"""
Quantum Feature Encoding Package.
Provides pluggable continuous and discrete feature encoders.
"""
from .base_encoder import QuantumFeatureEncoder
from .angle_encoder import AngleFeatureEncoder
from .amplitude_encoder import AmplitudeFeatureEncoder
from .basis_encoder import BasisFeatureEncoder

def get_encoder(method: str = "angle") -> QuantumFeatureEncoder:
    """Factory function for selecting quantum feature encoder."""
    method_lower = method.lower().strip()
    if method_lower == "amplitude":
        return AmplitudeFeatureEncoder()
    elif method_lower == "basis":
        return BasisFeatureEncoder()
    return AngleFeatureEncoder()

__all__ = [
    "QuantumFeatureEncoder",
    "AngleFeatureEncoder",
    "AmplitudeFeatureEncoder",
    "BasisFeatureEncoder",
    "get_encoder"
]
