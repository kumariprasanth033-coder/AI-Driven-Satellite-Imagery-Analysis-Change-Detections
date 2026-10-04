"""
Statevector Simulator for NISQ quantum circuits.
Simulates state preparation, single-qubit rotations (H, Ry, Rz), two-qubit CNOT gates,
and projective measurements with shot sampling.
"""
import cmath
import math
import random
from typing import List, Dict, Any, Tuple

class StatevectorSimulator:
    """
    Simulates unitary gate evolution on a 2^n complex amplitude vector.
    """

    def __init__(self, num_qubits: int = 4, shots: int = 1024):
        self.num_qubits = num_qubits
        self.dim = 1 << num_qubits  # 2^n
        self.shots = shots
        # Initialize state |00...0>
        self.state = [complex(0.0, 0.0)] * self.dim
        self.state[0] = complex(1.0, 0.0)

    def reset(self):
        self.state = [complex(0.0, 0.0)] * self.dim
        self.state[0] = complex(1.0, 0.0)

    def apply_hadamard(self, target: int):
        inv_sqrt2 = 1.0 / math.sqrt(2.0)
        step = 1 << target
        for i in range(0, self.dim, step * 2):
            for j in range(step):
                idx0 = i + j
                idx1 = idx0 + step
                v0 = self.state[idx0]
                v1 = self.state[idx1]
                self.state[idx0] = (v0 + v1) * inv_sqrt2
                self.state[idx1] = (v0 - v1) * inv_sqrt2

    def apply_ry(self, target: int, theta: float):
        cos_half = math.cos(theta / 2.0)
        sin_half = math.sin(theta / 2.0)
        step = 1 << target
        for i in range(0, self.dim, step * 2):
            for j in range(step):
                idx0 = i + j
                idx1 = idx0 + step
                v0 = self.state[idx0]
                v1 = self.state[idx1]
                self.state[idx0] = cos_half * v0 - sin_half * v1
                self.state[idx1] = sin_half * v0 + cos_half * v1

    def apply_rz(self, target: int, phi: float):
        phase_neg = cmath.exp(complex(0, -phi / 2.0))
        phase_pos = cmath.exp(complex(0, phi / 2.0))
        step = 1 << target
        for i in range(0, self.dim, step * 2):
            for j in range(step):
                idx0 = i + j
                idx1 = idx0 + step
                self.state[idx0] *= phase_neg
                self.state[idx1] *= phase_pos

    def apply_cnot(self, control: int, target: int):
        c_mask = 1 << control
        t_mask = 1 << target
        for i in range(self.dim):
            # Only swap if control bit is 1 and target bit is 0 (to avoid double swapping)
            if (i & c_mask) and not (i & t_mask):
                swapped = i | t_mask
                self.state[i], self.state[swapped] = self.state[swapped], self.state[i]

    def execute_circuit(self, instructions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Executes instructions list and returns state probabilities and shot distribution.
        """
        self.reset()
        for inst in instructions:
            gate = inst.get("gate", "").lower()
            if gate == "h":
                self.apply_hadamard(inst["qubit"])
            elif gate == "ry":
                theta = inst["params"][0] if inst.get("params") else 0.0
                self.apply_ry(inst["qubit"], theta)
            elif gate == "rz":
                phi = inst["params"][0] if inst.get("params") else 0.0
                self.apply_rz(inst["qubit"], phi)
            elif gate == "cx":
                self.apply_cnot(inst["control"], inst["target"])
            elif gate == "measure":
                pass  # Final projective measurement is handled via Born rule probabilities

        # Calculate Born probabilities |amplitude|^2
        probabilities = [abs(amp) ** 2 for amp in self.state]
        
        # Sample shots
        counts: Dict[str, int] = {}
        cum_probs = []
        acc = 0.0
        for p in probabilities:
            acc += p
            cum_probs.append(acc)

        for _ in range(self.shots):
            r = random.random()
            # Binary search or scan
            idx = 0
            while idx < len(cum_probs) - 1 and r > cum_probs[idx]:
                idx += 1
            bitstr = format(idx, f"0{self.num_qubits}b")
            counts[bitstr] = counts.get(bitstr, 0) + 1

        # Calculate expectation value of Z on qubit 0: <Z_0> = P(q0=0) - P(q0=1)
        prob_q0_zero = sum(probabilities[i] for i in range(self.dim) if not (i & 1))
        exp_z0 = prob_q0_zero - (1.0 - prob_q0_zero)

        # Anomaly probability: derived from expectation value
        anomaly_score = (1.0 - exp_z0) / 2.0  # Normalized to [0, 1]

        return {
            "expectation_z0": round(exp_z0, 4),
            "anomaly_score": round(anomaly_score, 4),
            "probabilities": [round(p, 4) for p in probabilities],
            "counts": counts,
            "shots": self.shots
        }
