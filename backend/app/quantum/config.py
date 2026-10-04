"""
Quantum Computing Configuration Module.
Centralized, strongly-typed settings for the Quantum Computing layer.
Safely detects environment credentials without exposing secrets.
"""
import os
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class QuantumConfig:
    backend_mode: str = "SIMULATOR"  # "SIMULATOR" or "IBM_QUANTUM"
    hardware_target: str = "ibm_brisbane"
    default_qubits: int = 4
    supported_qubits: List[int] = field(default_factory=lambda: [4, 8])
    default_shots: int = 1024
    supported_shots: List[int] = field(default_factory=lambda: [512, 1024, 2048, 4096])
    encoding_method: str = "angle"  # "angle", "amplitude", "basis"
    supported_encodings: List[str] = field(default_factory=lambda: ["angle", "amplitude", "basis"])
    qml_model: str = "vqc"  # "vqc" (Variational Quantum Classifier)
    execution_mode: str = "asynchronous"  # "synchronous" or "asynchronous"

    @classmethod
    def from_env(cls) -> "QuantumConfig":
        mode_env = os.environ.get("QUANTUM_BACKEND_MODE", "SIMULATOR").upper()
        mode = "IBM_QUANTUM" if mode_env in ["IBM", "IBM_QUANTUM", "QPU"] else "SIMULATOR"
        target = os.environ.get("IBM_QUANTUM_BACKEND", "ibm_brisbane")
        qubits = int(os.environ.get("DEFAULT_QUBITS", "4"))
        shots = int(os.environ.get("DEFAULT_SHOTS", "1024"))
        encoding = os.environ.get("QUANTUM_ENCODING", "angle").lower()

        return cls(
            backend_mode=mode,
            hardware_target=target,
            default_qubits=qubits if qubits in [4, 8] else 4,
            default_shots=shots if shots in [512, 1024, 2048, 4096] else 1024,
            encoding_method=encoding if encoding in ["angle", "amplitude", "basis"] else "angle"
        )

    def is_ibm_configured(self) -> bool:
        """Checks if hardware credentials exist without exposing token value."""
        token = os.environ.get("IBM_QUANTUM_TOKEN") or os.environ.get("QISKIT_IBM_TOKEN", "")
        return bool(token.strip())

    def get_public_metadata(self) -> Dict[str, Any]:
        """Returns safe telemetry metadata suitable for frontend display (Zero Secrets)."""
        return {
            "backend_mode": self.backend_mode,
            "hardware_target": self.hardware_target,
            "ibm_credentials_present": self.is_ibm_configured(),
            "default_qubits": self.default_qubits,
            "supported_qubits": self.supported_qubits,
            "default_shots": self.default_shots,
            "supported_shots": self.supported_shots,
            "encoding_method": self.encoding_method,
            "supported_encodings": self.supported_encodings,
            "qml_model": self.qml_model,
            "execution_mode": self.execution_mode,
            "simulator_name": "AerSimulator (Statevector)",
            "research_disclaimer": "Experimental QML baseline under NISQ-era representations. Comparisons reflect controlled feature-space parity, not quantum supremacy."
        }

quantum_config = QuantumConfig.from_env()
