"""
Analysis schemas and job definitions.
Models the state progression: preprocessing -> ai_ml -> change_detection -> completed.
"""
from typing import Dict, Any, Optional, List

class AnalysisJob:
    STAGES = ["preprocessing", "ai_ml", "change_detection", "completed"]

    def __init__(
        self,
        job_id: str,
        dataset_id: str,
        model: str = "kmeans_vqc_hybrid",
        stage: str = "preprocessing",
        status: str = "running",
        progress: int = 15,
        message: str = "Initializing imagery preprocessing and calibration...",
        created_at: str = "2026-03-15T12:00:00Z",
        results: Optional[Dict[str, Any]] = None
    ):
        self.job_id = job_id
        self.dataset_id = dataset_id
        self.model = model
        self.stage = stage
        self.status = status
        self.progress = progress
        self.message = message
        self.created_at = created_at
        self.results = results

    def advance(self) -> "AnalysisJob":
        """Advances job to next stage."""
        if self.stage == "preprocessing":
            self.stage = "ai_ml"
            self.progress = 50
            self.message = "Running Classical ML clustering and quantum dimensionality reduction..."
        elif self.stage == "ai_ml":
            self.stage = "change_detection"
            self.progress = 85
            self.message = "Executing change detection algorithms and Qiskit quantum circuit simulator..."
        elif self.stage == "change_detection":
            self.stage = "completed"
            self.status = "completed"
            self.progress = 100
            self.message = "Analysis complete. Actionable insights and geospatial results ready."
        return self

    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "dataset_id": self.dataset_id,
            "model": self.model,
            "stage": self.stage,
            "status": self.status,
            "progress": self.progress,
            "message": self.message,
            "created_at": self.created_at,
            "results": self.results
        }
