import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, CheckCircle2, Loader2, Cpu, Database, Activity, RefreshCw, Layers, Compass, Sliders, ShieldCheck, MapPin, Terminal } from 'lucide-react';
import { api } from '../services/api';
import { Dataset } from '../types/dataset';
import { AnalysisJob, AnalysisStage } from '../types/analysis';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';

interface Props {
  selectedDatasetId?: string;
  onNavigateToResults: (jobId: string) => void;
}

export const AnalysisPage: React.FC<Props> = ({ selectedDatasetId, onNavigateToResults }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>(selectedDatasetId || '');
  const [selectedModel, setSelectedModel] = useState<string>('kmeans_vqc_hybrid');
  const [currentJob, setCurrentJob] = useState<AnalysisJob | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const dList = await api.getDatasets();
        setDatasets(dList);
        if (!currentDatasetId && dList.length > 0) {
          setCurrentDatasetId(dList[0].id);
        }
      } catch (err) {
        console.error('Error loading datasets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDatasetId) {
      setCurrentDatasetId(selectedDatasetId);
    }
  }, [selectedDatasetId]);

  // Stage auto-advance interval for live demonstrations
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoAdvance && currentJob && currentJob.status === 'running' && currentJob.stage !== 'completed') {
      timer = setTimeout(() => {
        handleAdvance();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [autoAdvance, currentJob]);

  async function handleStartJob() {
    if (!currentDatasetId) return;
    try {
      const job = await api.startAnalysis(currentDatasetId, selectedModel);
      setCurrentJob(job);
    } catch (err) {
      console.error('Failed to start analysis job:', err);
    }
  }

  async function handleAdvance() {
    if (!currentJob) return;
    setIsAdvancing(true);
    try {
      const updatedJob = await api.advanceJob(currentJob.job_id);
      setCurrentJob({ ...updatedJob });
    } catch (err) {
      console.error('Failed to advance job:', err);
    } finally {
      setIsAdvancing(false);
    }
  }

  if (loading) {
    return <LoadingState message="Configuring analysis runtime environment..." />;
  }

  const workflowSteps = [
    {
      id: 'step-data',
      num: '01',
      label: 'Satellite Ingestion',
      sub: 'Multi-Spectral Input',
      desc: 'Top-of-Atmosphere optical rasters, band stack calibration (RGB+NIR+SWIR), EPSG:4326 verification.',
      icon: <Database className="w-3.5 h-3.5" />
    },
    {
      id: 'step-prep',
      num: '02',
      label: 'Preprocessing & PCA',
      sub: 'Radiometric Calibration',
      desc: 'Derives NDVI indices and compresses continuous features into a 4-component orthogonal subspace.',
      icon: <Layers className="w-3.5 h-3.5" />
    },
    {
      id: 'step-ml',
      num: '03',
      label: 'Classical AI/ML',
      sub: 'K-Means Clustering',
      desc: 'Spatial centroid distance optimization, Euclidean metric grouping, and unsupervised cluster segmentation.',
      icon: <Activity className="w-3.5 h-3.5" />
    },
    {
      id: 'step-cd',
      num: '04',
      label: 'Change Detection',
      sub: 'Vectorization',
      desc: 'Multi-spectral binary anomaly mask generation, morphological filtering, and WGS 84 GeoJSON polygonization.',
      icon: <MapPin className="w-3.5 h-3.5" />
    },
    {
      id: 'step-qml',
      num: '05',
      label: 'Experimental QML',
      sub: 'Variational VQC',
      desc: 'Parameterized 4-qubit quantum circuit, Ry(θ) feature map, circular entanglement, and Born rule projection.',
      icon: <Cpu className="w-3.5 h-3.5" />
    },
    {
      id: 'step-intel',
      num: '06',
      label: 'Decision Support',
      sub: 'Operational Dossier',
      desc: 'Consensus synthesis across classical and quantum branches, priority mitigation, and intelligence export.',
      icon: <Compass className="w-3.5 h-3.5" />
    }
  ];

  function getStepStatus(idx: number): 'pending' | 'active' | 'completed' {
    if (!currentJob) return 'pending';
    if (currentJob.stage === 'completed') return 'completed';

    const stageOrder: AnalysisStage[] = ['preprocessing', 'ai_ml', 'change_detection', 'completed'];
    const currentStageIdx = stageOrder.indexOf(currentJob.stage);

    if (idx < currentStageIdx) return 'completed';
    if (idx === currentStageIdx) return 'active';
    return 'pending';
  }

  const currentDataset = datasets.find(d => d.id === currentDatasetId) || datasets[0];

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono uppercase text-[10px] tracking-wider text-[var(--accent)] font-semibold">
              Pipeline Execution Engine
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">Multi-Stage Automated Workflow</span>
          </div>
          <h1 className="font-['Syne'] font-bold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
            Satellite Intelligence Analysis Pipeline
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Execute classical K-Means spectral clustering and variational quantum circuit (VQC) simulation across multi-spectral satellite imagery.
          </p>
        </div>

        {currentJob?.stage === 'completed' && (
          <button
            onClick={() => onNavigateToResults(currentJob.job_id)}
            className="geo-btn-primary"
          >
            <span>View Final Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Unified Command Configuration Strip */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Target Dataset Selection */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Target Satellite Scene
              </label>
              <select
                value={currentDatasetId}
                onChange={(e) => {
                  setCurrentDatasetId(e.target.value);
                  setCurrentJob(null);
                }}
                disabled={currentJob?.status === 'running' && currentJob?.stage !== 'completed'}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-sans cursor-pointer disabled:opacity-50"
              >
                {datasets.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.sensor} · {d.resolution_m}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Model Architecture */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Analysis Architecture
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={currentJob?.status === 'running' && currentJob?.stage !== 'completed'}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono cursor-pointer disabled:opacity-50"
              >
                <option value="kmeans_vqc_hybrid">Hybrid: K-Means Spatial + 4-Qubit VQC</option>
                <option value="kmeans_only">Classical Only: K-Means Clustering</option>
                <option value="vqc_simulation">Quantum Only: Variational Classifier</option>
              </select>
            </div>
          </div>

          {/* Trigger Actions */}
          <div className="flex items-center gap-2 pt-1 md:pt-4">
            {!currentJob ? (
              <button
                onClick={handleStartJob}
                className="geo-btn-primary"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Initialize Pipeline</span>
              </button>
            ) : currentJob.stage !== 'completed' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdvance}
                  disabled={isAdvancing}
                  className="geo-btn-primary"
                >
                  {isAdvancing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isAdvancing ? 'Executing Stage...' : 'Advance Stage'}</span>
                </button>

                <button
                  onClick={() => setAutoAdvance(!autoAdvance)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-[var(--radius-xs)] border transition-colors cursor-pointer ${
                    autoAdvance
                      ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/40 text-[var(--accent)] font-semibold'
                      : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Automatically advance pipeline stages for presentation"
                >
                  Auto: {autoAdvance ? 'ON' : 'OFF'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentJob(null)}
                className="geo-btn-secondary"
              >
                Reset Runtime
              </button>
            )}
          </div>
        </div>

        {/* Footprint Specifications */}
        {currentDataset && (
          <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex flex-wrap items-center gap-3 text-[11px] font-mono text-[var(--text-secondary)]">
            <span>Constellation: <strong className="text-[var(--text-primary)]">{currentDataset.sensor}</strong></span>
            <span>·</span>
            <span>Spatial GSD: <strong className="text-[var(--text-primary)]">{currentDataset.resolution_m}m</strong></span>
            <span>·</span>
            <span>Acquired: <strong className="text-[var(--text-primary)]">{currentDataset.acquisition_date}</strong></span>
            <span>·</span>
            <span>Datum: <strong className="text-[var(--text-primary)]">{currentDataset.crs}</strong></span>
          </div>
        )}
      </div>

      {/* 3. Live Execution Terminal & Progress Bar */}
      {currentJob && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono">
              <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[var(--text-primary)] font-medium">JOB: {currentJob.job_id}</span>
              <span className="text-[var(--text-muted)]">|</span>
              <StatusBadge
                label={currentJob.stage}
                tone={currentJob.status === 'completed' ? 'success' : 'info'}
                size="sm"
              />
            </div>
            <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
              {currentJob.progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-400 ease-out"
              style={{ width: `${currentJob.progress}%` }}
            />
          </div>

          {/* Telemetry Log */}
          <div className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] font-mono text-[11px] text-[var(--text-secondary)] flex items-center justify-between">
            <span className="truncate">{currentJob.message}</span>
            {currentJob.status === 'running' && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)] shrink-0 ml-2" />
            )}
          </div>
        </div>
      )}

      {/* 4. Sequential 6-Phase Pipeline Diagram */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 shadow-xs">
        <div className="pb-3 border-b border-[var(--border)] mb-3 flex items-center justify-between">
          <h2 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)]">
            Execution Lifecycle Architecture
          </h2>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            6 Sequential Milestones
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {workflowSteps.map((step, idx) => {
            const status = getStepStatus(idx);
            return (
              <div
                key={step.id}
                className={`p-3 rounded-[var(--radius-xs)] border transition-all ${
                  status === 'active'
                    ? 'bg-[var(--surface-secondary)] border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
                    : status === 'completed'
                    ? 'bg-[var(--surface)] border-[var(--success)]/40'
                    : 'bg-[var(--surface)] border-[var(--border)] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-muted)]">
                    <span>{step.num}</span>
                    <span>·</span>
                    <span className="uppercase text-[var(--text-secondary)]">{step.sub}</span>
                  </div>
                  <StatusBadge
                    label={status === 'completed' ? 'Verified' : status === 'active' ? 'Active' : 'Pending'}
                    tone={status === 'completed' ? 'success' : status === 'active' ? 'info' : 'neutral'}
                    size="sm"
                    dot={status === 'active'}
                  />
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1 rounded-[var(--radius-xs)] ${status === 'active' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-xs text-[var(--text-primary)]">
                    {step.label}
                  </h3>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Completion Milestone Transition Banner */}
      {currentJob?.stage === 'completed' && (
        <div className="p-4 bg-[var(--surface)] border border-[var(--success)]/40 rounded-[var(--radius-sm)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--success-subtle)] border border-[var(--success)]/30 flex items-center justify-center text-[var(--success)] shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)]">
                Dual-Branch Pipeline Execution Complete
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Geodesic change polygons, multi-spectral masks, and 4-qubit VQC state probabilities generated.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToResults(currentJob.job_id)}
            className="geo-btn-primary shrink-0"
          >
            <span>Open Intelligence Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
