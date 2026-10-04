"""
Quantum schemas and experiment tracking domain models.
"""
from typing import Dict, Any, List, Optional

class ExperimentRecord:
    """
    Tracks metadata and metrics for scientific reproducibility.
    """
    def __init__(
        self,
        experiment_id: str,
        dataset_id: str,
        model: str,
        model_type: str,
        features: List[str],
        feature_count: int,
        accuracy: Any,
        precision: Any,
        recall: Any,
        f1_score: Any,
        processing_time_ms: float,
        backend: str,
        qubits: int,
        shots: int,
        circuit_depth: int,
        created_at: str
    ):
        self.experiment_id = experiment_id
        self.dataset_id = dataset_id
        self.model = model
        self.model_type = model_type
        self.features = features
        self.feature_count = feature_count
        self.accuracy = accuracy
        self.precision = precision
        self.recall = recall
        self.f1_score = f1_score
        self.processing_time_ms = processing_time_ms
        self.backend = backend
        self.qubits = qubits
        self.shots = shots
        self.circuit_depth = circuit_depth
        self.created_at = created_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "experiment_id": self.experiment_id,
            "dataset_id": self.dataset_id,
            "model": self.model,
            "model_type": self.model_type,
            "features": self.features,
            "feature_count": self.feature_count,
            "accuracy": self.accuracy,
            "precision": self.precision,
            "recall": self.recall,
            "f1_score": self.f1_score,
            "processing_time_ms": self.processing_time_ms,
            "backend": self.backend,
            "qubits": self.qubits,
            "shots": self.shots,
            "circuit_depth": self.circuit_depth,
            "created_at": self.created_at
        }
