# AI-Driven Satellite Imagery Analysis & Change Detection

A hybrid Classical AI/ML and Experimental Quantum Machine Learning (QML) platform for satellite remote sensing change detection, geospatial anomaly vectorization, and empirical model benchmarking.

---

## 1. Project Objective

Satellite Earth observation generates multi-spectral raster data across diverse sensor constellations (Sentinel-2, Landsat-8, PlanetScope). This platform evaluates how **Classical Machine Learning** (unsupervised spatial clustering and PCA) and **Experimental Quantum Machine Learning** (Parameterized Quantum Circuits / Variational Quantum Classifiers) process high-dimensional multi-spectral remote sensing features under controlled subspace parity.

---

## 2. System Architecture

```
[Satellite Scene Ingestion] (GeoTIFF / Multi-spectral bands)
           ↓
[Radiometric Calibration & Preprocessing] (TOA Reflectance, NDVI/NDWI)
           ↓
[Feature Extraction & PCA Reduction] (k = 4 orthogonal components in [0, π])
           ↓
  ┌─────────────────────────────────┴─────────────────────────────────┐
  │                                                                   │
[Classical AI/ML Branch]                                   [Quantum / QML Branch]
• Unsupervised K-Means clustering                          • Modular Feature Encoding:
• Centroid distance anomaly thresholding                     Angle Ry(θ), Amplitude L2, Basis
• Continuous anomaly mask                                  • Parameterized Variational Ansatz
• Fast inference (<15 ms)                                  • Statevector Evolution & Born Sampling
  │                                                                   │
  └─────────────────────────────────┬─────────────────────────────────┘
                                    ↓
[Dual-Branch Model Comparison & Consensus Analysis]
• Prediction concordancy (Concordant vs Divergent)
• Confidence comparison: Classical vs QML (|ΔConf|)
• Execution latency & circuit depth tracking
                                    ↓
[Geospatial Vectorization & Leaflet Overlay] (WGS 84 Polygon, Ellipsoidal Geodesic Area)
                                    ↓
[Actionable Intelligence Briefing & Export]
```

---

## 3. Four-Page Application Structure

1. **Dashboard (`/`)**: Operational overview, active fleet alerts, sensor constellation health, recent anomaly detections, and rapid pipeline launchers.
2. **Satellite Data (`/data`)**: Catalog of multi-spectral scenes (agricultural drought, tropical deforestation, maritime coastal, and wetland flooding) with interactive band inspector and custom raster upload.
3. **Analysis Pipeline (`/analysis`)**: 4-stage live progression tracker (`preprocessing` $\to$ `ai_ml` $\to$ `change_detection` $\to$ `completed`) with execution telemetry.
4. **Results & Insights (`/results`)**: Presentation dossier with primary telemetry, optical composite vs change mask viewer, interactive Leaflet GIS map, Classical K-Means breakdown, Variational Quantum Circuit visualizer, empirical comparative benchmark matrix, and exportable decision briefing.

---

## 4. Quantum-Ready Computing Layer

- **Qiskit 1.x Compatible Backend**: Modular statevector simulator and hardware-ready IBM Quantum provider abstraction (`IBMQuantumBackend`).
- **NISQ Feature Parity**: Maps continuous PCA features to single-qubit rotation gates ($R_y(\theta_i)$ with $\theta_i = x_i \cdot \pi$).
- **Ansatz Topology**: Circular entangling layer of CNOT unitaries followed by parameterized $R_y(\theta) \cdot R_z(\phi)$ variational rotations.
- **Observable Expectation**: Pauli $\langle Z_0 \rangle$ measurement mapped to anomaly probability via logistic sigmoid projection.
- **Fail-Safe Fallback**: If external quantum hardware or simulator is unavailable, classical AI/ML completes uninterrupted:
  *"Experimental QML execution unavailable — classical analysis completed successfully."*

---

## 5. Security & Credential Hygiene

- IBM Quantum tokens (`IBM_QUANTUM_TOKEN`, `QISKIT_IBM_TOKEN`) are strictly backend-only environment variables.
- Zero secrets are ever included in the client-side JavaScript bundle, browser `localStorage`, or API responses.
- `GET /api/quantum/config` exposes only sanitized public telemetry (qubit counts, shot budgets, supported encodings).

---

## 6. How to Run the Project

### Backend:
```bash
# From workspace root
python3 backend/main.py
# API runs on http://127.0.0.1:5050
```

### Frontend:
```bash
# From workspace root
npm run dev
# Web application runs on http://localhost:3000
```

### Verification & Automated Testing:
```bash
# Run reliability and integration test matrix
python3 backend/tests/test_reliability_matrix.py

# Verify TypeScript and bundle compilation
npm run build
```

---

## 7. Known Limitations & Scientific Transparency

- **Simulation Constraints**: Statevector simulation on NISQ-era representations models ideal unitary matrix evolution. Physical QPU execution involves gate fidelity noise, decoherence ($T_1/T_2$), and cloud queue latency.
- **Quantum Advantage**: This platform serves as an empirical research and evaluation testbed; it does not claim quantum supremacy on current NISQ hardware. Comparisons reflect controlled feature-space parity.
