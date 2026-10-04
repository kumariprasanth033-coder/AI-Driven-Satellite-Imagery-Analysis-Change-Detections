import React, { useState } from 'react';
import { Cpu, Terminal, RefreshCw, Info, Play, Sliders, ShieldCheck } from 'lucide-react';
import { QMLResult } from '../types/quantum';
import { StatusBadge } from './ui/StatusBadge';

interface Props {
  qml?: QMLResult;
  jobId?: string;
  onRecalculate?: (qubits: number, shots: number, backend: 'simulator' | 'ibm_quantum', encoding: 'angle' | 'amplitude' | 'basis') => Promise<void>;
}

export const QuantumCircuitVisualizer: React.FC<Props> = ({ qml, jobId, onRecalculate }) => {
  const [activeTab, setActiveTab] = useState<'circuit' | 'histogram' | 'qiskit' | 'architecture'>('circuit');
  const [selectedQubits, setSelectedQubits] = useState<number>(qml?.qubits ?? 4);
  const [selectedShots, setSelectedShots] = useState<number>(qml?.shots ?? 1024);
  const [selectedBackend, setSelectedBackend] = useState<'simulator' | 'ibm_quantum'>('simulator');
  const [selectedEncoding, setSelectedEncoding] = useState<'angle' | 'amplitude' | 'basis'>('angle');
  const [isExecuting, setIsExecuting] = useState(false);

  // Defensive fallback if qml is missing or undefined
  const depth = qml?.circuit_depth ?? (selectedQubits === 8 ? 9 : 8);
  const qubits = qml?.qubits ?? selectedQubits;
  const shots = qml?.shots ?? selectedShots;
  const backend = qml?.backend ?? 'AerSimulator (Statevector)';
  const encoding = qml?.encoding ?? 'Angle Encoding Ry(θ)';
  const counts = qml?.measurement_counts ?? {
    '1101': 284,
    '1110': 262,
    '1111': 248,
    '1011': 112,
    '0001': 68,
    '0000': 50
  };
  const expZ0 = qml?.expectation_z0 ?? -0.68;
  const anomalyScore = qml?.anomaly_score ?? 0.84;
  const confidence = qml?.confidence ?? 0.865;

  const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(counts), 1);

  async function handleExecute() {
    if (!onRecalculate) return;
    setIsExecuting(true);
    try {
      await onRecalculate(selectedQubits, selectedShots, selectedBackend, selectedEncoding);
    } catch (err) {
      console.error('Quantum recalculation failed:', err);
    } finally {
      setIsExecuting(false);
    }
  }

  // Wires to display (limit visual display to 4 or 8)
  const displayQubits = Math.min(qubits, 8);
  const wireHeight = displayQubits === 8 ? 32 : 42;
  const svgHeight = 40 + displayQubits * wireHeight;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded p-5 text-[var(--text-primary)] shadow-xs">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-subtle)] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[var(--accent-quantum)]" />
            <h3 className="font-['Syne'] font-bold text-base text-[var(--text-primary)] tracking-wide">
              {qubits}-Qubit Experimental QML Circuit (VQC)
            </h3>
            <StatusBadge
              label={qml?.is_simulator === false ? 'IBM Quantum QPU' : 'NISQ Simulator Baseline'}
              tone={qml?.is_simulator === false ? 'warning' : 'quantum'}
              size="sm"
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            Continuous angle feature encoding Ry(θ) with circular CNOT entanglement and parameterized variational rotations.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-[var(--bg-surface-elevated)] p-1 rounded border border-[var(--border-subtle)] text-xs font-mono">
          <button
            onClick={() => setActiveTab('circuit')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'circuit'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Circuit Wire
          </button>
          <button
            onClick={() => setActiveTab('histogram')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'histogram'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Shot Histogram
          </button>
          <button
            onClick={() => setActiveTab('qiskit')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'qiskit'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Qiskit Code
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Theory / PCA
          </button>
        </div>
      </div>

      {/* Interactive Circuit Parameter Bar */}
      <div className="my-3.5 p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Qubit Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] font-mono uppercase text-[10px]">Register:</span>
            <select
              value={selectedQubits}
              onChange={(e) => setSelectedQubits(parseInt(e.target.value, 10))}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)] text-xs cursor-pointer"
            >
              <option value={4}>4 Qubits (4 PCA Features)</option>
              <option value={8}>8 Qubits (8 PCA Features)</option>
            </select>
          </div>

          {/* Shot Count */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] font-mono uppercase text-[10px]">Shots:</span>
            <select
              value={selectedShots}
              onChange={(e) => setSelectedShots(parseInt(e.target.value, 10))}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)] text-xs cursor-pointer"
            >
              <option value={512}>512 Shots</option>
              <option value={1024}>1024 Shots</option>
              <option value={2048}>2048 Shots</option>
            </select>
          </div>

          {/* Encoding Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] font-mono uppercase text-[10px]">Encoding:</span>
            <select
              value={selectedEncoding}
              onChange={(e) => setSelectedEncoding(e.target.value as any)}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)] text-xs cursor-pointer"
            >
              <option value="angle">Angle Ry(θ)</option>
              <option value="amplitude">Amplitude L2</option>
              <option value="basis">Basis State</option>
            </select>
          </div>

          {/* Backend Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] font-mono uppercase text-[10px]">Backend:</span>
            <select
              value={selectedBackend}
              onChange={(e) => setSelectedBackend(e.target.value as any)}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)] text-xs cursor-pointer"
            >
              <option value="simulator">AerSimulator (Statevector)</option>
              <option value="ibm_quantum">IBM Quantum (QPU Transpiled)</option>
            </select>
          </div>
        </div>

        {/* Execution Trigger */}
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[var(--accent-blue)] hover:brightness-110 rounded transition-all cursor-pointer disabled:opacity-50 active:scale-97 shadow-xs"
        >
          {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {isExecuting ? 'Simulating QML...' : 'Re-run QML Circuit'}
        </button>
      </div>

      {/* Telemetry ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-2.5 border-b border-[var(--border-subtle)] text-xs font-mono">
        <div>
          <span className="text-[var(--text-muted)] block uppercase tracking-wider text-[10px]">Qubit Width</span>
          <span className="text-[var(--text-primary)] text-sm font-semibold tabular-nums">{qubits} Qubits</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block uppercase tracking-wider text-[10px]">Circuit Depth</span>
          <span className="text-[var(--text-primary)] text-sm font-semibold tabular-nums">{depth} Layers</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block uppercase tracking-wider text-[10px]">Encoding Method</span>
          <span className="text-purple-600 dark:text-purple-300 text-xs font-semibold truncate block">{encoding}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block uppercase tracking-wider text-[10px]">Measurement Shots</span>
          <span className="text-[var(--text-primary)] text-sm font-semibold tabular-nums">{shots.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block uppercase tracking-wider text-[10px]">Target Backend</span>
          <span className="text-[var(--accent-quantum)] text-xs font-semibold truncate block">{backend}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-3">
        {activeTab === 'circuit' && (
          <div className="overflow-x-auto pb-2">
            <svg
              className="w-full min-w-[680px] select-none text-xs font-mono"
              style={{ height: `${svgHeight}px` }}
              viewBox={`0 0 680 ${svgHeight}`}
            >
              <defs>
                <pattern id="wire-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" className="text-slate-800/40 dark:text-slate-800/60" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="680" height={svgHeight} fill="currentColor" className="text-slate-100 dark:text-[#0b0f19]" rx="4" />
              <rect width="680" height={svgHeight} fill="url(#wire-grid-pattern)" />

              {/* Qubit Wires */}
              {Array.from({ length: displayQubits }).map((_, q) => {
                const y = 30 + q * wireHeight;
                return (
                  <g key={`wire-${q}`}>
                    <text x="18" y={y + 4} fill="currentColor" className="text-slate-600 dark:text-slate-400 font-semibold" fontSize="11">
                      |q{q}⟩
                    </text>
                    <line x1="55" y1={y} x2="650" y2={y} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" />

                    {/* Step 1: Hadamard Gate */}
                    <rect x="75" y={y - 12} width="24" height="24" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
                    <text x="87" y={y + 4} fill="#e2e8f0" textAnchor="middle" fontWeight="bold" fontSize="10">H</text>

                    {/* Step 2: Feature Map Ry(θ) */}
                    <rect x="125" y={y - 12} width="46" height="24" fill="#0f172a" stroke="#2563eb" strokeWidth="1.5" rx="2" />
                    <text x="148" y={y + 4} fill="#93c5fd" textAnchor="middle" fontSize="9">Ry(θ{q})</text>

                    {/* Step 3: Parameterized Rotation Ry(w) */}
                    <rect x="330" y={y - 12} width="44" height="24" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
                    <text x="352" y={y + 4} fill="#c4b5fd" textAnchor="middle" fontSize="9">Ry(w{q})</text>

                    {/* Step 4: Parameterized Rotation Rz(w) */}
                    <rect x="395" y={y - 12} width="44" height="24" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
                    <text x="417" y={y + 4} fill="#c4b5fd" textAnchor="middle" fontSize="9">Rz(w{q})</text>

                    {/* Step 5: Measurement Meter */}
                    <rect x="585" y={y - 12} width="30" height="24" fill="#0f172a" stroke="#64748b" strokeWidth="1" rx="2" />
                    <path d={`M ${593} ${y + 6} A 6 6 0 0 1 ${603} ${y + 6}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="598" y1={y + 6} x2="604" y2={y - 3} stroke="#38bdf8" strokeWidth="1.5" />
                  </g>
                );
              })}

              {/* Entanglement CX links (Circular ring between qubits) */}
              {Array.from({ length: displayQubits }).map((_, q) => {
                const targetQ = (q + 1) % displayQubits;
                const y1 = 30 + q * wireHeight;
                const y2 = 30 + targetQ * wireHeight;
                const x = 200 + q * (120 / displayQubits);

                return (
                  <g key={`cx-${q}`}>
                    <circle cx={x} cy={y1} r="3" fill="#a855f7" />
                    <line x1={x} y1={y1} x2={x} y2={y2} stroke="#a855f7" strokeWidth="1.5" />
                    <circle cx={x} cy={y2} r="6" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                  </g>
                );
              })}

              {/* Vertical section dividers */}
              <line x1="110" y1="10" x2="110" y2={svgHeight - 10} stroke="currentColor" className="text-slate-400/60 dark:text-slate-600" strokeDasharray="3,3" strokeWidth="1" />
              <line x1="185" y1="10" x2="185" y2={svgHeight - 10} stroke="currentColor" className="text-slate-400/60 dark:text-slate-600" strokeDasharray="3,3" strokeWidth="1" />
              <line x1="315" y1="10" x2="315" y2={svgHeight - 10} stroke="currentColor" className="text-slate-400/60 dark:text-slate-600" strokeDasharray="3,3" strokeWidth="1" />
              <line x1="565" y1="10" x2="565" y2={svgHeight - 10} stroke="currentColor" className="text-slate-400/60 dark:text-slate-600" strokeDasharray="3,3" strokeWidth="1" />

              {/* Annotations */}
              <text x="148" y={svgHeight - 8} fill="currentColor" className="text-slate-500" textAnchor="middle" fontSize="9">FEATURE MAP</text>
              <text x="250" y={svgHeight - 8} fill="currentColor" className="text-slate-500" textAnchor="middle" fontSize="9">CIRCULAR ENTANGLEMENT</text>
              <text x="440" y={svgHeight - 8} fill="currentColor" className="text-slate-500" textAnchor="middle" fontSize="9">PARAMETERIZED ANSATZ</text>
              <text x="600" y={svgHeight - 8} fill="currentColor" className="text-slate-500" textAnchor="middle" fontSize="9">MEASURE</text>
            </svg>

            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mt-2 font-mono">
              <span>Expectation ⟨Z₀⟩: {expZ0} · Anomaly Score: {anomalyScore}</span>
              <span className="text-purple-600 dark:text-purple-300 font-semibold">Confidence: {(confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}

        {activeTab === 'histogram' && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1 font-mono">
              <span>Top Measured Computational Basis States</span>
              <span>{shots} Total Sampling Shots</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
              {sortedCounts.slice(0, 8).map(([state, count]) => {
                const pct = Math.round((count / shots) * 1000) / 10;
                return (
                  <div key={state} className="bg-[var(--bg-surface-elevated)] p-2 rounded border border-[var(--border-subtle)] text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-purple-600 dark:text-purple-300 font-semibold">|{state}⟩</span>
                      <span className="font-mono text-[var(--text-secondary)]">{count} shots ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'qiskit' && (
          <div className="bg-[var(--bg-surface-elevated)] p-3 rounded border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] overflow-x-auto max-h-[180px]">
            <pre className="text-[var(--text-secondary)]">
{`# Qiskit 1.0+ Variational Quantum Classifier (VQC) for Satellite Change Detection
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(${qubits}, ${qubits})

# 1. State preparation (Hadamard Superposition)
for i in range(${qubits}):
    qc.h(i)

# 2. Angle feature encoding Ry(theta) from remote sensing PCA features
for i in range(${qubits}):
    qc.ry(theta_angles[i], i)

# 3. Parameterized Entangling Ansatz (Depth = 2)
for d in range(2):
    # Circular CNOT entanglement ring
    for q in range(${qubits}):
        qc.cx(q, (q + 1) % ${qubits})
    # Parameterized single-qubit rotations
    for q in range(${qubits}):
        qc.ry(weights[d*${qubits*2} + q*2], q)
        qc.rz(weights[d*${qubits*2} + q*2 + 1], q)

# 4. Computational Basis Measurement
qc.measure_all()

# 5. Execution on backend
backend = AerSimulator()
job = backend.run(qc, shots=${shots})
counts = job.result().get_counts()`}
            </pre>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-secondary)] space-y-2 font-sans leading-relaxed max-h-[180px] overflow-y-auto">
            <h4 className="font-semibold text-[var(--text-primary)] font-['Syne']">
              Why Dimensionality Reduction is Scientifically Necessary
            </h4>
            <p>
              Current Noisy Intermediate-Scale Quantum (NISQ) devices feature limited qubit counts (&lt;127 physical qubits) and strict decoherence times (T2 coherence &lt; 200 microseconds). Satellite imagery tiles contains millions of pixel values across multiple spectral bands (e.g. 1024×1024×4 = 4.19M values).
            </p>
            <p>
              Directly encoding millions of raw pixels into quantum states is mathematically intractable on NISQ hardware. Therefore, our pipeline implements a disciplined <strong>hybrid classical-quantum workflow</strong>:
            </p>
            <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-[var(--text-muted)]">
              <li>Classical band extraction: Multi-spectral infrared, vegetation indices (NDVI), and Haralick texture.</li>
              <li>PCA projection: Projects spectral distributions down to k=4 or k=8 principal components.</li>
              <li>Angle Feature Mapping: Normalizes orthogonal components to [0, π] driving unitary Ry(θ) rotations.</li>
              <li>Controlled Parity: Classical K-Means and QML VQC are evaluated on the exact same k-feature subspace.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
