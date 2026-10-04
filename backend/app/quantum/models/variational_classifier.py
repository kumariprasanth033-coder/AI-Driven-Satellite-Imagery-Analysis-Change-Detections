"""
Variational Quantum Classifier (VQC) Model for Satellite Land-Cover Change Detection.
Combines feature mapping, parameterized variational circuit, measurement expectation, and classical optimization.
"""
import math
from typing import List, Dict, Any, Optional
from ..circuits.vqc_circuit import VQCCircuit
from ..providers.backend_provider import QuantumBackend, SimulatorBackend

class VariationalQuantumClassifier:
    """
    Experimental Variational Quantum Classifier (VQC).
    Encodes satellite feature vectors into 4-qubit quantum states and executes
    parameterized variational rotations to output a change anomaly prediction and confidence score.
    """

    def __init__(self, num_qubits: int = 4, depth: int = 2, backend: Optional[QuantumBackend] = None):
        self.num_qubits = num_qubits
        self.depth = depth
        self.circuit_builder = VQCCircuit(num_qubits=num_qubits, depth=depth)
        self.backend = backend or SimulatorBackend(num_qubits=num_qubits)
        # Pre-trained or optimized variational parameters (weights)
        # 4 qubits * 2 layers * 2 params/qubit = 16 variational parameters
        self.weights = [
            0.52, -0.31, 1.15, -0.78,
            0.24,  0.89, -0.45, 0.62,
            -0.18, 0.95, 0.33, -0.67,
            0.41, -0.82, 0.12,  0.74
        ]
        self.is_trained = True

    def predict_sample(self, feature_vector: List[float], shots: int = 1024) -> Dict[str, Any]:
        """
        Executes quantum circuit for one normalized 4-feature vector.
        """
        circuit_spec = self.circuit_builder.build_circuit_spec(feature_vector, self.weights)
        raw_result = self.backend.run(circuit_spec["instructions"], shots=shots)

        anomaly_score = raw_result["anomaly_score"]
        # Threshold at 0.50
        prediction = 1 if anomaly_score >= 0.50 else 0
        # Confidence calculation based on distance from decision boundary
        confidence = round(0.5 + abs(anomaly_score - 0.5), 4)

        return {
            "prediction": prediction,
            "change_detected": prediction == 1,
            "anomaly_score": anomaly_score,
            "confidence": confidence,
            "expectation_z0": raw_result["expectation_z0"],
            "circuit_depth": circuit_spec["depth"],
            "cnot_count": circuit_spec["cnot_count"],
            "num_qubits": self.num_qubits,
            "shots": shots,
            "backend": raw_result.get("backend_name", "simulator"),
            "is_simulator": raw_result.get("is_simulator", True),
            "execution_time_ms": raw_result.get("execution_time_ms", 0.0),
            "counts": raw_result.get("counts", {}),
            "probabilities": raw_result.get("probabilities", [])
        }

    def predict_batch(self, features: List[List[float]], shots: int = 512) -> Dict[str, Any]:
        """
        Processes batch of feature samples.
        """
        results = [self.predict_sample(f, shots=shots) for f in features]
        predictions = [r["prediction"] for r in results]
        confidences = [r["confidence"] for r in results]
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

        sample_circuit = results[0] if results else {}

        return {
            "predictions": predictions,
            "overall_change_detected": any(p == 1 for p in predictions),
            "mean_confidence": round(avg_conf, 4),
            "circuit_depth": sample_circuit.get("circuit_depth", 8),
            "cnot_count": sample_circuit.get("cnot_count", 8),
            "num_qubits": self.num_qubits,
            "shots": shots,
            "sample_counts": sample_circuit.get("counts", {}),
            "execution_time_ms": round(sum(r.get("execution_time_ms", 0.0) for r in results), 2)
        }
