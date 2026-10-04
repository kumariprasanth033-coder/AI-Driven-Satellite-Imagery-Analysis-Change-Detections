"""
Variational Quantum Circuit definition for 4-qubit satellite change classification.
Uses Qiskit-compatible gate topology: Angle Encoding feature map + Entangling Parameterized Ansatz.
"""
from typing import List, Dict, Any
import math

class VQCCircuit:
    """
    Constructs a 4-qubit parameterized quantum circuit for satellite feature classification.
    
    Structure:
    1. Feature Map (Angle Encoding):
       |0> -> [H] -> [Ry(theta_i)] -> ... for i in {0, 1, 2, 3}
    2. Entangling Layer:
       CNOT(0->1), CNOT(1->2), CNOT(2->3), CNOT(3->0) (circular or linear entanglement)
    3. Parameterized Variational Ansatz:
       [Rz(w_0)], [Ry(w_1)], ...
    4. Measurement on register q0..q3 (computational Z-basis).
    """

    def __init__(self, num_qubits: int = 4, depth: int = 2):
        self.num_qubits = num_qubits
        self.depth = depth
        # Number of parameters in ansatz: 2 parameters (Ry, Rz) per qubit per layer
        self.num_params = num_qubits * depth * 2

    def build_circuit_spec(self, features: List[float], weights: List[float]) -> Dict[str, Any]:
        """
        Generates circuit specification instructions compatible with Qiskit circuits and simulators.
        """
        assert len(features) >= self.num_qubits, f"Expected at least {self.num_qubits} features"
        
        instructions = []
        # 1. State preparation / superposition
        for q in range(self.num_qubits):
            instructions.append({"gate": "h", "qubit": q, "params": []})

        # 2. Angle feature encoding
        for q in range(self.num_qubits):
            theta = features[q]
            instructions.append({"gate": "ry", "qubit": q, "params": [theta]})

        # 3. Entanglement & Variational Layers
        param_idx = 0
        for d in range(self.depth):
            # Circular entanglement
            for q in range(self.num_qubits):
                target = (q + 1) % self.num_qubits
                instructions.append({"gate": "cx", "control": q, "target": target, "params": []})

            # Parameterized rotations
            for q in range(self.num_qubits):
                w_y = weights[param_idx] if param_idx < len(weights) else 0.0
                param_idx += 1
                w_z = weights[param_idx] if param_idx < len(weights) else 0.0
                param_idx += 1
                instructions.append({"gate": "ry", "qubit": q, "params": [w_y]})
                instructions.append({"gate": "rz", "qubit": q, "params": [w_z]})

        # 4. Measurement
        for q in range(self.num_qubits):
            instructions.append({"gate": "measure", "qubit": q, "classical_bit": q})

        circuit_depth = 1 + 1 + (self.depth * 3) + 1  # approximate layer depth
        
        return {
            "num_qubits": self.num_qubits,
            "depth": circuit_depth,
            "cnot_count": self.depth * self.num_qubits,
            "parameter_count": self.num_params,
            "encoding": "angle_ry",
            "instructions": instructions
        }
