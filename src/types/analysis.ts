import { QMLResult, ComparativeBenchmark } from './quantum';
import { GeospatialData } from './geospatial';

export type AnalysisStage = 'preprocessing' | 'ai_ml' | 'change_detection' | 'completed';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ClusterInfo {
  count: number;
  labels: string[];
  distribution: number[];
}

export interface ChangeMaskInfo {
  generated: boolean;
  pixel_resolution: string;
  format: string;
  highlight_color: string;
}

export interface AnalysisResults {
  change_detected: boolean;
  affected_area_km2: number;
  confidence: number;
  change_type: string;
  model: string;
  priority: PriorityLevel;
  recommended_action: string;
  monitoring: string;
  insight: string;
  change_ratio: number;
  clusters: ClusterInfo;
  change_mask: ChangeMaskInfo;
  is_demo_baseline?: boolean;
  qml?: QMLResult; // Safe optional to prevent 'Cannot read properties of undefined'
  geospatial?: GeospatialData;
  comparison?: {
    classical_accuracy: number | 'N/A';
    quantum_accuracy: number | 'N/A';
    classical_f1: number | 'N/A';
    quantum_f1: number | 'N/A';
    classical_latency_ms: number;
    quantum_latency_ms: number;
    features_used: number;
    note: string;
  };
}

export interface AnalysisJob {
  job_id: string;
  dataset_id: string;
  model: string;
  stage: AnalysisStage;
  status: JobStatus;
  progress: number;
  message: string;
  created_at: string;
  results?: AnalysisResults;
}
