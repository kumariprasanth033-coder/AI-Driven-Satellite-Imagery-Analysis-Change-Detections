"""
Angle Feature Encoding for Quantum Circuits.
Maps each normalized remote-sensing feature x_i in [0, 1] to a rotation angle theta_i = x_i * pi in [0, pi],
driving the Ry(theta_i) gate on qubit i.
"""
import math
from typing import List, Dict, Any
from .base_encoder import QuantumFeatureEncoder

class AngleFeatureEncoder(QuantumFeatureEncoder):
    def __init__(self):
        super().__init__(name="Angle Encoding Ry(theta)")

    def encode(self, features: List[float], num_qubits: int) -> Dict[str, Any]:
        """
        Normalizes input vector and maps each feature to [0, pi] rotation angles.
        """
        padded_features = features[:num_qubits]
        while len(padded_features) < num_qubits:
            padded_features.append(0.5)

        # Scale continuous features to [0, pi]
        rotation_angles = []
        for val in padded_features:
            clamped = max(0.0, min(1.0, float(val)))
            rotation_angles.append(round(clamped * math.pi, 5))

        return {
            "method": self.name,
            "num_qubits": num_qubits,
            "raw_features_count": len(features),
            "angles_radians": rotation_angles,
            "description": "Continuous Ry rotation gate parameterization"
        }
