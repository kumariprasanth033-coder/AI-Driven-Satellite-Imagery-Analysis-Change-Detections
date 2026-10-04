"""
Asynchronous Quantum Job Manager.
Manages quantum execution lifecycle across local simulators and external IBM Quantum QPU targets.
Tracks formal NISQ lifecycle states: not_started, preparing, submitted, queued, running, completed, failed.
"""
import uuid
import time
import threading
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class QuantumJob:
    job_id: str
    status: str  # not_started, preparing, submitted, queued, running, completed, failed
    num_qubits: int
    shots: int
    backend_mode: str
    encoding_method: str
    created_at: str
    updated_at: str
    execution_time_ms: float = 0.0
    features: List[float] = field(default_factory=list)
    results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "status": self.status,
            "num_qubits": self.num_qubits,
            "shots": self.shots,
            "backend_mode": self.backend_mode,
            "encoding_method": self.encoding_method,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "execution_time_ms": self.execution_time_ms,
            "results": self.results,
            "error": self.error
        }

class QuantumJobManager:
    def __init__(self):
        self.jobs: Dict[str, QuantumJob] = {}
        self._lock = threading.Lock()

    def create_job(
        self,
        features: List[float],
        num_qubits: int = 4,
        shots: int = 1024,
        backend_mode: str = "SIMULATOR",
        encoding_method: str = "angle"
    ) -> QuantumJob:
        job_id = f"qjob-{uuid.uuid4().hex[:8]}"
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        job = QuantumJob(
            job_id=job_id,
            status="submitted",
            num_qubits=num_qubits,
            shots=shots,
            backend_mode=backend_mode,
            encoding_method=encoding_method,
            created_at=now,
            updated_at=now,
            features=features
        )

        with self._lock:
            self.jobs[job_id] = job

        return job

    def get_job(self, job_id: str) -> Optional[QuantumJob]:
        with self._lock:
            return self.jobs.get(job_id)

    def update_status(self, job_id: str, status: str, error: Optional[str] = None) -> Optional[QuantumJob]:
        with self._lock:
            job = self.jobs.get(job_id)
            if job:
                job.status = status
                job.updated_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                if error:
                    job.error = error
            return job

    def set_completed(self, job_id: str, results: Dict[str, Any], execution_time_ms: float) -> Optional[QuantumJob]:
        with self._lock:
            job = self.jobs.get(job_id)
            if job:
                job.status = "completed"
                job.results = results
                job.execution_time_ms = execution_time_ms
                job.updated_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            return job

    def list_jobs(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [j.to_dict() for j in self.jobs.values()]

quantum_job_manager = QuantumJobManager()
