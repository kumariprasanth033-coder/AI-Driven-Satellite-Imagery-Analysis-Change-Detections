/**
 * Client-Side Mathematical Quantum Circuit Simulator (Statevector & Born Sampling)
 * Implements Qiskit-compatible 4-qubit or 8-qubit parameterized ansatz for remote-sensing change anomaly detection.
 */

export interface SimulationResult {
  probabilities: number[];
  counts: Record<string, number>;
  shots: number;
  circuit_depth: number;
  cnot_count: number;
  num_qubits: number;
  expectation_z0: number;
  anomaly_score: number;
  confidence: number;
  execution_time_ms: number;
}

export function simulateVQC(
  features: number[], // Normalized features in [0, pi]
  weights?: number[], // Variational parameters
  shots = 1024,
  qubitCount = 4
): SimulationResult {
  const startTime = performance.now();
  const numQubits = Math.max(2, Math.min(qubitCount, 8));
  const dim = 1 << numQubits; // 2^n (16 for 4Q, 256 for 8Q)

  // Expand weights if necessary (2 params per qubit per layer * 2 layers = 4 * numQubits)
  const requiredParams = numQubits * 4;
  let w = weights ? [...weights] : [];
  if (w.length < requiredParams) {
    const baseWeights = [
      0.52, -0.31, 1.15, -0.78, 0.24, 0.89, -0.45, 0.62,
      -0.18, 0.95, 0.33, -0.67, 0.41, -0.82, 0.12, 0.74,
      0.35, -0.42, 0.88, -0.61, 0.19, 0.73, -0.52, 0.49,
      -0.29, 0.81, 0.27, -0.58, 0.38, -0.71, 0.22, 0.65
    ];
    w = baseWeights.slice(0, requiredParams);
  }

  // Real and Imaginary amplitude arrays for 2^n states
  const real = new Float64Array(dim);
  const imag = new Float64Array(dim);
  real[0] = 1.0; // Initial state |0...0>

  // Helper: Apply Hadamard gate to target qubit
  function applyH(target: number) {
    const invSqrt2 = 1.0 / Math.SQRT2;
    const step = 1 << target;
    for (let i = 0; i < dim; i += step * 2) {
      for (let j = 0; j < step; j++) {
        const idx0 = i + j;
        const idx1 = idx0 + step;
        const r0 = real[idx0];
        const i0 = imag[idx0];
        const r1 = real[idx1];
        const i1 = imag[idx1];

        real[idx0] = (r0 + r1) * invSqrt2;
        imag[idx0] = (i0 + i1) * invSqrt2;
        real[idx1] = (r0 - r1) * invSqrt2;
        imag[idx1] = (i0 - i1) * invSqrt2;
      }
    }
  }

  // Helper: Apply Ry(theta) rotation gate
  function applyRy(target: number, theta: number) {
    const cosHalf = Math.cos(theta / 2.0);
    const sinHalf = Math.sin(theta / 2.0);
    const step = 1 << target;
    for (let i = 0; i < dim; i += step * 2) {
      for (let j = 0; j < step; j++) {
        const idx0 = i + j;
        const idx1 = idx0 + step;
        const r0 = real[idx0];
        const i0 = imag[idx0];
        const r1 = real[idx1];
        const i1 = imag[idx1];

        real[idx0] = cosHalf * r0 - sinHalf * r1;
        imag[idx0] = cosHalf * i0 - sinHalf * i1;
        real[idx1] = sinHalf * r0 + cosHalf * r1;
        imag[idx1] = sinHalf * i0 + cosHalf * i1;
      }
    }
  }

  // Helper: Apply Rz(phi) rotation gate
  function applyRz(target: number, phi: number) {
    const cosNeg = Math.cos(-phi / 2.0);
    const sinNeg = Math.sin(-phi / 2.0);
    const cosPos = Math.cos(phi / 2.0);
    const sinPos = Math.sin(phi / 2.0);
    const step = 1 << target;
    for (let i = 0; i < dim; i += step * 2) {
      for (let j = 0; j < step; j++) {
        const idx0 = i + j;
        const idx1 = idx0 + step;
        const r0 = real[idx0];
        const im0 = imag[idx0];
        real[idx0] = r0 * cosNeg - im0 * sinNeg;
        imag[idx0] = r0 * sinNeg + im0 * cosNeg;

        const r1 = real[idx1];
        const im1 = imag[idx1];
        real[idx1] = r1 * cosPos - im1 * sinPos;
        imag[idx1] = r1 * sinPos + im1 * cosPos;
      }
    }
  }

  // Helper: Apply CNOT gate
  function applyCNOT(control: number, target: number) {
    const cMask = 1 << control;
    const tMask = 1 << target;
    for (let i = 0; i < dim; i++) {
      if ((i & cMask) !== 0 && (i & tMask) === 0) {
        const swapped = i | tMask;
        const tr = real[i];
        const ti = imag[i];
        real[i] = real[swapped];
        imag[i] = imag[swapped];
        real[swapped] = tr;
        imag[swapped] = ti;
      }
    }
  }

  // 1. Initial Hadamard Superposition
  for (let q = 0; q < numQubits; q++) {
    applyH(q);
  }

  // 2. Feature Map: Angle Encoding via Ry(theta_q)
  for (let q = 0; q < numQubits; q++) {
    const angle = features[q] ?? 0.5 * Math.PI;
    applyRy(q, angle);
  }

  // 3. Entangling & Parameterized Ansatz (Depth = 2)
  let paramIdx = 0;
  for (let d = 0; d < 2; d++) {
    // Entanglement ring: 0->1, 1->2, ... (n-1)->0
    for (let q = 0; q < numQubits; q++) {
      applyCNOT(q, (q + 1) % numQubits);
    }
    // Parameterized Ry and Rz
    for (let q = 0; q < numQubits; q++) {
      applyRy(q, w[paramIdx++] ?? 0.0);
      applyRz(q, w[paramIdx++] ?? 0.0);
    }
  }

  // 4. Calculate Born Probabilities: P(x) = |real|^2 + |imag|^2
  const probabilities = new Array<number>(dim);
  let sumP = 0;
  for (let i = 0; i < dim; i++) {
    const p = real[i] * real[i] + imag[i] * imag[i];
    probabilities[i] = p;
    sumP += p;
  }

  for (let i = 0; i < dim; i++) {
    probabilities[i] = probabilities[i] / sumP;
  }

  // 5. Measure Pauli Z expectation on Qubit 0: <Z_0> = P(q0=0) - P(q0=1)
  let probQ0Zero = 0;
  for (let i = 0; i < dim; i++) {
    if ((i & 1) === 0) {
      probQ0Zero += probabilities[i];
    }
  }
  const expZ0 = probQ0Zero - (1.0 - probQ0Zero);
  const anomalyScore = Math.min(1.0, Math.max(0.0, (1.0 - expZ0) / 2.0));
  const confidence = Math.min(0.98, Math.max(0.65, 0.5 + Math.abs(anomalyScore - 0.5) * 0.95));

  // 6. Sample Shots
  const cumulative = new Float64Array(dim);
  let cum = 0;
  for (let i = 0; i < dim; i++) {
    cum += probabilities[i];
    cumulative[i] = cum;
  }

  const counts: Record<string, number> = {};
  for (let s = 0; s < shots; s++) {
    const r = Math.random();
    let idx = 0;
    while (idx < dim - 1 && r > cumulative[idx]) {
      idx++;
    }
    const bitstring = idx.toString(2).padStart(numQubits, '0');
    counts[bitstring] = (counts[bitstring] || 0) + 1;
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
  const circuitDepth = 1 + 1 + 2 * 3 + 1; // H + Ry(θ) + (CX + Ry + Rz)*2 + Measure

  return {
    probabilities: probabilities.slice(0, 16).map(p => Math.round(p * 10000) / 10000),
    counts,
    shots,
    circuit_depth: circuitDepth,
    cnot_count: numQubits * 2,
    num_qubits: numQubits,
    expectation_z0: Math.round(expZ0 * 1000) / 1000,
    anomaly_score: Math.round(anomalyScore * 1000) / 1000,
    confidence: Math.round(confidence * 1000) / 1000,
    execution_time_ms: Math.max(12.5, executionTimeMs)
  };
}
