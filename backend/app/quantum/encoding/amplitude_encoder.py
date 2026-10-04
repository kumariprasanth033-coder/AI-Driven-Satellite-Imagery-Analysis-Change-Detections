"""
Amplitude Feature Encoding for Quantum Circuits.
Encodes a 2^n feature vector into the quantum state amplitudes:
|psi> = sum_{i=0}^{2^n-1} a_i |i>, where sum |a_i|^2 = 1.
"""
import math
from typing import List, Dict, Any
from .base_encoder import QuantumFeatureEncoder

class AmplitudeFeatureEncoder(QuantumFeatureEncoder):
    def __init__(self):
        super().__init__(name="Amplitude Encoding")

    def encode(self, features: List[float], num_qubits: int) -> Dict[str, Any]:
        """
        Normalizes vector using L2 norm to prepare statevector amplitude distribution.
        """
        dim = 1 << num_qubits
        padded = features[:dim]
        while len(padded) < dim:
            padded.append(0.0)

        # Compute L2 norm
        norm = math.sqrt(sum(x * x for x in padded))
        if norm == 0:
            amplitudes = [1.0] + [0.0] * (dim - 1)
        else:
            amplitudes = [round(x / norm, 5) for x in padded]

        return {
            "method": self.name,
            "num_qubits": num_qubits,
            "state_dimension": dim,
            "normalized_amplitudes": amplitudes,
            "description": "L2 normalized statevector superposition amplitudes"
        }
