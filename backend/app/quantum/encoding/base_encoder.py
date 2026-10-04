"""
Base Abstract Class for Quantum Feature Encoding.
Transforms classical continuous features into quantum state representations.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class QuantumFeatureEncoder(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def encode(self, features: List[float], num_qubits: int) -> Dict[str, Any]:
        """
        Encodes classical feature vector into quantum-compatible parameters or state amplitudes.
        """
        pass
