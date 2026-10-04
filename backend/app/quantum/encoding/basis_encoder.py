"""
Basis Feature Encoding for Quantum Circuits.
Transforms discrete features into computational basis bitstrings:
x in {0, 1}^n -> |x_1 x_2 ... x_n>.
"""
from typing import List, Dict, Any
from .base_encoder import QuantumFeatureEncoder

class BasisFeatureEncoder(QuantumFeatureEncoder):
    def __init__(self, threshold: float = 0.5):
        super().__init__(name="Basis Encoding")
        self.threshold = threshold

    def encode(self, features: List[float], num_qubits: int) -> Dict[str, Any]:
        """
        Discretizes continuous features into binary bitstrings for basis state preparation.
        """
        padded = features[:num_qubits]
        while len(padded) < num_qubits:
            padded.append(0.0)

        bitstring = "".join("1" if x >= self.threshold else "0" for x in padded)

        return {
            "method": self.name,
            "num_qubits": num_qubits,
            "bitstring": bitstring,
            "basis_state": f"|{bitstring}>",
            "threshold": self.threshold,
            "description": "Discrete computational basis state mapping"
        }
