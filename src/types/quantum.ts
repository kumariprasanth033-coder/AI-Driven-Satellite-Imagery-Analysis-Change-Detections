export interface QuantumGateInstruction {
  gate: 'h' | 'ry' | 'rz' | 'cx' | 'measure';
  qubit: number;
  target?: number;
  control?: number;
  params?: number[];
  classical_bit?: number;
}

export interface QuantumCircuitSpec {
  num_qubits: number;
  depth: number;
  cnot_count: number;
  parameter_count: number;
  encoding: string;
  instructions: QuantumGateInstruction[];
}

export interface QMLResult {
  model_name: string;
  qubits: number;
  circuit_depth: number;
  cnot_count: number;
  shots: number;
  encoding: string;
  encoding_details?: Record<string, any>;
  backend: string;
  is_simulator: boolean;
  anomaly_score: number;
  confidence: number;
  expectation_z0?: number;
  execution_time_ms: number;
  measurement_counts?: Record<string, number>;
  state_probabilities?: number[];
  status: string;
  quantum_job_id?: string;
  execution_status?: 'not_started' | 'preparing' | 'submitted' | 'queued' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface QuantumConfigMetadata {
  backend_mode: string;
  hardware_target: string;
  ibm_credentials_present: boolean;
  default_qubits: number;
  supported_qubits: number[];
  default_shots: number;
  supported_shots: number[];
  encoding_method: string;
  supported_encodings: string[];
  qml_model: string;
  execution_mode: string;
  simulator_name: string;
  research_disclaimer: string;
}

export interface ComparativeBenchmark {
  dataset_id: string;
  dataset_name: string;
  sensor: string;
  experimental_disclaimer: string;
  classical: {
    model_name: string;
    model_family: string;
    features_used: number;
    accuracy: number | 'N/A';
    precision: number | 'N/A';
    recall: number | 'N/A';
    f1_score: number | 'N/A';
    confusion_matrix: { tp: number | 'N/A'; fp: number | 'N/A'; fn: number | 'N/A'; tn: number | 'N/A' };
    inference_time_ms: number;
    confidence: number;
    qubits: 'N/A';
    circuit_depth: 'N/A';
    shots: 'N/A';
  };
  quantum: {
    model_name: string;
    model_family: string;
    encoding: string;
    features_used: number;
    qubits: number;
    circuit_depth: number;
    cnot_count: number;
    shots: number;
    backend: string;
    accuracy: number | 'N/A';
    precision: number | 'N/A';
    recall: number | 'N/A';
    f1_score: number | 'N/A';
    confusion_matrix: { tp: number | 'N/A'; fp: number | 'N/A'; fn: number | 'N/A'; tn: number | 'N/A' };
    inference_time_ms: number;
    confidence: number;
    status: string;
  };
}
