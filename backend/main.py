"""
Backend Server for Satellite Imagery Analysis Platform.
Implements secure REST APIs for dataset ingestion, classical ML clustering,
and experimental 4-Qubit / 8-Qubit Variational Quantum Classifier (VQC) pipelines.
"""
import os
import sys
import json
import uuid
import time
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.app.services.analysis_service import AnalysisService
from backend.app.services.quantum_service import quantum_service

# Logging Configuration (No sensitive tokens logged)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("satellite_api")

# Security Constraints
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {".tif", ".tiff", ".png", ".jpg", ".jpeg"}

# Global Service Instance
analysis_service = AnalysisService()

# Preload initial demonstration datasets
INITIAL_DATASETS = [
    {
        "id": "ds-sentinel2-drought",
        "name": "San Joaquin Valley Canopy Stress",
        "source": "Sentinel-2",
        "sensor": "MSI (MultiSpectral Instrument)",
        "acquisition_date": "2026-03-12",
        "resolution_m": 10.0,
        "bands": ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"],
        "crs": "EPSG:4326",
        "bbox": [-120.25, 36.45, -120.10, 36.58],
        "center_coords": [36.515, -120.175],
        "file_size_mb": 28.4,
        "status": "ready",
        "description": "Irrigation deficit and canopy vigor decline across intensive orchard and vegetable plots."
    },
    {
        "id": "ds-landsat8-deforestation",
        "name": "Rondônia Frontier Disturbance",
        "source": "Landsat-8",
        "sensor": "OLI / TIRS",
        "acquisition_date": "2026-02-28",
        "resolution_m": 30.0,
        "bands": ["B2 (Blue)", "B3 (Green)", "B4 (Red)", "B5 (NIR)", "B6 (SWIR-1)"],
        "crs": "EPSG:4326",
        "bbox": [-62.40, -10.85, -62.20, -10.65],
        "center_coords": [-10.75, -62.30],
        "file_size_mb": 42.1,
        "status": "ready",
        "description": "Fishbone canopy clearance and recent access corridor cutting adjacent to protected reserve."
    }
]

datasets_db = {d["id"]: d for d in INITIAL_DATASETS}

class SatelliteRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        # 1. Health check
        if path in ["", "/health", "/api/health"]:
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "status": "online",
                "service": "Satellite Imagery Analysis API",
                "version": "2.1.0",
                "quantum_simulator": "AerSimulator (Statevector)",
                "ibm_configured": bool(os.environ.get("IBM_QUANTUM_TOKEN") or os.environ.get("QISKIT_IBM_TOKEN"))
            }).encode("utf-8"))
            return

        # 2. List datasets
        if path == "/api/datasets":
            self._set_headers(200)
            self.wfile.write(json.dumps(list(datasets_db.values())).encode("utf-8"))
            return

        # 3. List jobs
        if path == "/api/analysis/jobs":
            jobs = analysis_service.list_jobs()
            self._set_headers(200)
            self.wfile.write(json.dumps(jobs).encode("utf-8"))
            return

        # 4. Get job by ID (/api/analysis/jobs/{job_id})
        if path.startswith("/api/analysis/jobs/"):
            job_id = path.split("/")[4]
            job = analysis_service.get_job(job_id)
            if job:
                self._set_headers(200)
                self.wfile.write(json.dumps(job.to_dict()).encode("utf-8"))
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": f"Job {job_id} not found"}).encode("utf-8"))
            return

        # 5. Quantum status & configuration
        if path in ["/api/quantum/status", "/api/quantum/config"]:
            self._set_headers(200)
            self.wfile.write(json.dumps(quantum_service.get_config_metadata()).encode("utf-8"))
            return

        # 6. Quantum Job Status: GET /api/quantum/jobs/{job_id}
        if path.startswith("/api/quantum/jobs/"):
            q_job_id = path.split("/")[4]
            q_job = quantum_service.get_quantum_job(q_job_id)
            if q_job:
                self._set_headers(200)
                self.wfile.write(json.dumps(q_job.to_dict()).encode("utf-8"))
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": f"Quantum job {q_job_id} not found"}).encode("utf-8"))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        content_len = int(self.headers.get("Content-Length", 0))

        # Security: payload size check
        if content_len > MAX_FILE_SIZE_BYTES:
            self._set_headers(413)
            self.wfile.write(json.dumps({"error": "Payload exceeds 50MB limit"}).encode("utf-8"))
            return

        body = self.rfile.read(content_len) if content_len > 0 else b"{}"
        data = {}
        if body:
            try:
                data = json.loads(body.decode("utf-8"))
            except Exception:
                pass

        # 1. Start Analysis: POST /api/analysis/start/{dataset_id}
        if path.startswith("/api/analysis/start/"):
            dataset_id = path.split("/")[4]
            model = data.get("model", "kmeans_vqc_hybrid")
            logger.info("Initializing analysis job for dataset: %s, model: %s", dataset_id, model)
            try:
                job = analysis_service.start_job(dataset_id=dataset_id, model=model)
                self._set_headers(201)
                self.wfile.write(json.dumps(job.to_dict()).encode("utf-8"))
            except Exception as e:
                logger.error("Error creating job: %s", str(e))
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        # 2. Advance Job: POST /api/analysis/jobs/{job_id}/advance
        if path.startswith("/api/analysis/jobs/") and path.endswith("/advance"):
            job_id = path.split("/")[4]
            logger.info("Advancing analysis job: %s", job_id)
            try:
                ds_meta = datasets_db.get(analysis_service.get_job(job_id).dataset_id) if analysis_service.get_job(job_id) else None
                job = analysis_service.advance_job(job_id, dataset_metadata=ds_meta)
                self._set_headers(200)
                self.wfile.write(json.dumps(job.to_dict()).encode("utf-8"))
            except ValueError as ve:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": str(ve)}).encode("utf-8"))
            except Exception as e:
                logger.error("Error advancing job %s: %s", job_id, str(e))
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": "Internal pipeline error"}).encode("utf-8"))
            return

        # 3. Recalculate Quantum: POST /api/analysis/jobs/{job_id}/quantum
        if path.startswith("/api/analysis/jobs/") and path.endswith("/quantum"):
            job_id = path.split("/")[4]
            qubits = int(data.get("qubits", 4))
            shots = int(data.get("shots", 1024))
            mode = str(data.get("backend_mode", "simulator"))
            logger.info("Executing quantum recalculation on job %s: %dQ, %d shots", job_id, qubits, shots)
            try:
                q_res = analysis_service.execute_quantum_recalculation(
                    job_id=job_id,
                    num_qubits=qubits,
                    shots=shots,
                    backend_mode=mode
                )
                self._set_headers(200)
                self.wfile.write(json.dumps(q_res).encode("utf-8"))
            except ValueError as ve:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": str(ve)}).encode("utf-8"))
            except Exception as e:
                logger.error("Quantum recalculation failed: %s", str(e))
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    "status": "unavailable",
                    "error": "Quantum execution failed safely",
                    "classical_active": True
                }).encode("utf-8"))
            return

        # 4. Async Quantum Job Submission: POST /api/quantum/jobs/submit
        if path == "/api/quantum/jobs/submit":
            features = data.get("features", [0.82, 0.65, 0.44, 0.91])
            qubits = int(data.get("qubits", 4))
            shots = int(data.get("shots", 1024))
            mode = str(data.get("backend_mode", "SIMULATOR"))
            encoding = str(data.get("encoding_method", "angle"))
            logger.info("Submitting async quantum job: %dQ, %d shots, %s encoding", qubits, shots, encoding)
            try:
                job = quantum_service.submit_async_qml_job(
                    features=features,
                    num_qubits=qubits,
                    shots=shots,
                    backend_mode=mode,
                    encoding_method=encoding
                )
                self._set_headers(202)
                self.wfile.write(json.dumps(job.to_dict()).encode("utf-8"))
            except Exception as e:
                logger.error("Async quantum job submission error: %s", str(e))
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        # 5. Upload Dataset: POST /api/datasets/upload
        if path == "/api/datasets/upload":
            raw_filename = data.get("filename", "custom_scene.tif")
            # Security: Sanitize filename, prevent directory traversal
            clean_filename = Path(raw_filename).name.replace("..", "").replace("/", "")
            ext = Path(clean_filename).suffix.lower()

            if ext not in ALLOWED_EXTENSIONS:
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "error": f"Invalid extension '{ext}'. Allowed: {list(ALLOWED_EXTENSIONS)}"
                }).encode("utf-8"))
                return

            new_id = f"ds-custom-{uuid.uuid4().hex[:6]}"
            new_dataset = {
                "id": new_id,
                "name": data.get("name", "Custom Satellite Ingestion"),
                "source": "User Upload",
                "sensor": data.get("sensor", "Calibrated Multi-Spectral Sensor"),
                "acquisition_date": data.get("acquisition_date", time.strftime("%Y-%m-%d")),
                "resolution_m": float(data.get("resolution_m", 10.0)),
                "bands": ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"],
                "crs": "EPSG:4326",
                "bbox": data.get("bbox", [-122.45, 37.75, -122.40, 37.80]),
                "center_coords": data.get("center_coords", [37.775, -122.425]),
                "file_size_mb": 14.5,
                "status": "ready",
                "description": data.get("description", "Uploaded multi-spectral raster.")
            }
            datasets_db[new_id] = new_dataset
            logger.info("Registered sanitized dataset: %s", new_id)
            self._set_headers(201)
            self.wfile.write(json.dumps(new_dataset).encode("utf-8"))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))


class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

def run_server(port=5050):
    server_address = ("", port)
    httpd = ReusableHTTPServer(server_address, SatelliteRequestHandler)
    logger.info("Satellite Backend API running on port %d...", port)
    httpd.serve_forever()

if __name__ == "__main__":
    run_server(5050)
