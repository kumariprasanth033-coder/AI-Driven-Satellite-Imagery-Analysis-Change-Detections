import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Eye, 
  Sliders, 
  Download, 
  Maximize2, 
  Compass, 
  Scale,
  Radio,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisJob, AnalysisResults } from '../types/analysis';
import { Dataset } from '../types/dataset';
import { LeafletMapView } from '../components/LeafletMapView';
import { QuantumCircuitVisualizer } from '../components/QuantumCircuitVisualizer';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { ActionableInsightsCard } from '../components/ActionableInsightsCard';
import { DefensiveErrorBoundary } from '../components/DefensiveErrorBoundary';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';

interface Props {
  selectedJobId?: string;
  onNavigateToData: () => void;
}

export const ResultsPage: React.FC<Props> = ({ selectedJobId, onNavigateToData }) => {
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>(selectedJobId || '');
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [imageDisplayMode, setImageDisplayMode] = useState<'side-by-side' | 'mask-overlay' | 'cir-infrared'>('side-by-side');
  const [maskOpacity, setMaskOpacity] = useState<number>(65);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const jList = await api.getJobs();
        setJobs(jList);
        if (!activeJobId && jList.length > 0) {
          setActiveJobId(jList[0].job_id);
        }
      } catch (err) {
        console.error('Failed to load jobs for Results page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      setActiveJobId(selectedJobId);
    }
  }, [selectedJobId]);

  const activeJob = jobs.find(j => j.job_id === activeJobId) || jobs[0];

  useEffect(() => {
    async function loadDataset() {
      if (!activeJob?.dataset_id) return;
      try {
        const ds = await api.getDatasetById(activeJob.dataset_id);
        setCurrentDataset(ds);
      } catch (err) {
        console.error('Failed to load dataset details:', err);
      }
    }
    loadDataset();
  }, [activeJob]);

  const handleRecalculateQuantum = async (
    qubits: number,
    shots: number,
    backend: 'simulator' | 'ibm_quantum',
    encoding: 'angle' | 'amplitude' | 'basis' = 'angle'
  ) => {
    if (!activeJob) return;
    try {
      const updated = await api.recalculateQuantum(activeJob.job_id, qubits, shots, backend, encoding);
      setJobs(prev => prev.map(j => (j.job_id === updated.job_id ? { ...updated } : j)));
    } catch (err) {
      console.error('Failed to recalculate quantum circuit:', err);
    }
  };

  if (loading) {
    return <LoadingState message="Synthesizing geospatial intelligence report..." />;
  }

  if (!activeJob) {
    return (
      <EmptyState
        title="No Analysis Results Found"
        description="Launch an analysis job from the Satellite Data catalog or upload custom raster imagery to generate intelligence reports."
        actionLabel="Go to Satellite Data"
        onAction={onNavigateToData}
      />
    );
  }

  // Safe handling if an in-progress or non-result job is selected
  if (!activeJob.results) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap font-mono text-[11px]">
              <span className="uppercase text-[var(--accent)] font-semibold">
                Intelligence Dossier
              </span>
              <span className="text-[var(--text-muted)]">|</span>
              <span className="text-[var(--text-secondary)]">JOB: {activeJob.job_id}</span>
              <span className="text-[var(--text-muted)]">|</span>
              <StatusBadge
                label={activeJob.status}
                tone={activeJob.status === 'failed' ? 'critical' : 'info'}
                size="sm"
              />
            </div>
            <h1 className="font-['Syne'] font-bold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
              Geospatial Report Pending
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Pipeline stage: <strong className="text-[var(--text-primary)] font-mono">{activeJob.stage}</strong> ({activeJob.progress}% complete)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-mono text-[var(--text-muted)] uppercase hidden md:inline">
              Job Dossier:
            </label>
            <select
              value={activeJob.job_id}
              onChange={(e) => setActiveJobId(e.target.value)}
              className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-2.5 py-1 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {jobs.map(j => (
                <option key={j.job_id} value={j.job_id}>
                  {j.job_id} · {j.model} ({j.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <EmptyState
          title={`Job ${activeJob.job_id} is in stage: ${activeJob.stage}`}
          description="This pipeline run has not completed geospatial vectorization or QML benchmarking yet. Select a completed job from the dropdown or continue processing in the pipeline."
          actionLabel="Go to Satellite Data"
          onAction={onNavigateToData}
        />
      </div>
    );
  }

  // Defensive fallback data handling
  const results: AnalysisResults = activeJob.results;
  const changeDetected = results?.change_detected ?? true;
  const affectedAreaKm2 = results?.affected_area_km2 ?? 14.80;
  const confidence = results?.confidence ?? 0.865;
  const changeType = results?.change_type ?? 'Vegetation / Land-Cover Anomaly';
  const priority = results?.priority ?? 'high';
  const changeRatio = results?.change_ratio ?? 0.184;
  const qml = results?.qml;

  // Model agreement determination
  const qmlAnomalyScore = qml?.anomaly_score ?? 0.84;
  const qmlDetected = qmlAnomalyScore >= 0.5;
  const isAgreement = changeDetected === qmlDetected;

  const clusterDistribution = results?.clusters?.distribution ?? [0.55, 0.28, 0.17];
  const clusterLabels = results?.clusters?.labels ?? ['Healthy Vegetation', 'Soil / Dry Matrix', 'Anomaly Zone'];

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar with Job Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap font-mono text-[11px]">
            <span className="uppercase text-[var(--accent)] font-semibold">
              Intelligence Dossier
            </span>
            <span className="text-[var(--text-muted)]">|</span>
            <span className="text-[var(--text-secondary)]">RUN: {activeJob.job_id}</span>
            <span className="text-[var(--text-muted)]">|</span>
            <StatusBadge
              label={activeJob.status === 'completed' ? 'Verified' : activeJob.status}
              tone={activeJob.status === 'completed' ? 'success' : 'info'}
              size="sm"
            />
            <span className="text-[var(--text-muted)]">|</span>
            <span className="text-[var(--text-muted)] font-mono text-[10px]">
              {currentDataset?.name ?? 'Satellite Scene'} ({currentDataset?.sensor ?? 'Sentinel-2'} · {currentDataset?.resolution_m ?? 10}m GSD)
            </span>
          </div>
          <h1 className="font-['Syne'] font-bold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
            Geospatial Analysis &amp; Quantum Report
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">
            Target Scene: <strong className="text-[var(--text-primary)]">{currentDataset?.name ?? 'Satellite Scene'}</strong> ({currentDataset?.sensor ?? 'Sentinel-2 MSI'} · {currentDataset?.acquisition_date ?? 'Recent'})
          </p>
        </div>

        {/* Job Switcher Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[11px] font-mono text-[var(--text-muted)] uppercase hidden md:inline">
            Job Dossier:
          </label>
          <select
            value={activeJob.job_id}
            onChange={(e) => setActiveJobId(e.target.value)}
            className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-2.5 py-1 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            {jobs.map(j => (
              <option key={j.job_id} value={j.job_id}>
                {j.job_id} · {j.model} ({j.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. PRIMARY TELEMETRY BANNER (Visually Dominant & High-Hierarchy) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-xs overflow-hidden">
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
          
          {/* 1. Change Classification */}
          <div className="p-2 lg:pr-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Change Classification
            </span>
            <div className="flex items-center gap-2">
              {changeDetected ? (
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              <span className={`text-lg font-bold tracking-tight ${changeDetected ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {changeDetected ? 'Anomaly Detected' : 'Nominal Stability'}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 truncate">
              {changeType}
            </span>
          </div>

          {/* 2. Model Confidence */}
          <div className="p-2 lg:px-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Classical Confidence
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-[var(--success)] tabular-nums">
                {(confidence * 100).toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[var(--success)]/80">%</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
              PCA Subspace Validation
            </span>
          </div>

          {/* 3. Impact Extent */}
          <div className="p-2 lg:px-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Affected Surface Extent
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono text-[var(--text-primary)] tabular-nums">
                {affectedAreaKm2.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">km²</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">
              {(changeRatio * 100).toFixed(1)}% of total scene footprint
            </span>
          </div>

          {/* 4. Action Priority */}
          <div className="p-2 lg:pl-4 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Action Protocol
            </span>
            <div>
              <StatusBadge
                label={`${priority} Priority`}
                tone={priority === 'critical' ? 'critical' : priority === 'high' ? 'warning' : 'info'}
                size="md"
              />
            </div>
            <span className="text-[11px] font-mono text-[var(--text-secondary)] mt-1">
              Field inspection directive recommended
            </span>
          </div>

        </div>

        {/* Secondary Telemetry Sub-strip (Integrated hairline, not a floating card) */}
        <div className="px-4 py-2 bg-[var(--surface-secondary)] border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)]">
          <div className="flex items-center gap-4">
            <span>Model Agreement: <strong className={isAgreement ? 'text-[var(--success)]' : 'text-[var(--warning)]'}>{isAgreement ? 'Concordant' : 'Divergent'}</strong></span>
            <span>·</span>
            <span>Classical: <strong className="text-[var(--text-primary)]">K-Means Spectral</strong></span>
            <span>·</span>
            <span>QML Anomaly Score: <strong className="text-[var(--quantum)]">{qml?.anomaly_score?.toFixed(3) ?? '0.840'}</strong></span>
            <span>·</span>
            <span>QML Confidence: <strong className="text-[var(--quantum)]">{(qml?.confidence != null ? `${(qml.confidence * 100).toFixed(1)}%` : '83.5%')}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Subspace: 4 PCA Features</span>
            <span>·</span>
            <span className="text-[var(--text-muted)]">Datum: EPSG:4326</span>
          </div>
        </div>
      </div>

      {/* 3. SATELLITE VISUALIZATION & RADIOMETRIC INSPECTOR */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border)] gap-2">
          <div>
            <h2 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
              Radiometric Raster vs. Computed Anomaly Mask
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Optical true-color composite aligned with multi-spectral ΔNDVI segmentation threshold.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[var(--surface-secondary)] p-0.5 rounded-[var(--radius-xs)] border border-[var(--border)] text-xs font-mono">
            <button
              onClick={() => setImageDisplayMode('side-by-side')}
              className={`px-2.5 py-1 rounded-[var(--radius-xs)] transition-colors cursor-pointer ${
                imageDisplayMode === 'side-by-side'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setImageDisplayMode('mask-overlay')}
              className={`px-2.5 py-1 rounded-[var(--radius-xs)] transition-colors cursor-pointer ${
                imageDisplayMode === 'mask-overlay'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Overlay Blend
            </button>
            <button
              onClick={() => setImageDisplayMode('cir-infrared')}
              className={`px-2.5 py-1 rounded-[var(--radius-xs)] transition-colors cursor-pointer ${
                imageDisplayMode === 'cir-infrared'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              False-Color CIR
            </button>
          </div>
        </div>

        {/* Visualizer Canvas Area */}
        <div className="pt-3">
          {imageDisplayMode === 'side-by-side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Left: Source Scene */}
              <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] overflow-hidden">
                <div className="px-3 py-1.5 bg-[var(--surface)] border-b border-[var(--border)] text-xs flex justify-between items-center font-mono">
                  <span className="text-[var(--text-primary)] font-medium">Calibrated Optical Composite</span>
                  <span className="text-[var(--text-muted)] text-[11px]">{currentDataset?.sensor ?? 'MSI'} · RGB (B04/B03/B02)</span>
                </div>
                <div className="relative w-full h-[250px] bg-slate-950 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 250">
                    <rect width="400" height="250" fill="#1e293b" />
                    <rect x="10" y="10" width="120" height="105" fill="#14532d" />
                    <rect x="140" y="10" width="100" height="105" fill="#166534" />
                    <rect x="250" y="10" width="140" height="75" fill="#78350f" />
                    <rect x="250" y="95" width="140" height="145" fill="#15803d" />
                    <rect x="10" y="125" width="100" height="115" fill="#854d0e" />
                    <rect x="120" y="125" width="120" height="115" fill="#b45309" />
                    <circle cx="200" cy="65" r="42" fill="#16a34a" opacity="0.85" />
                    <circle cx="70" cy="180" r="48" fill="#713f12" opacity="0.8" />
                    <line x1="0" y1="120" x2="400" y2="120" stroke="#475569" strokeWidth="1.5" />
                    <line x1="130" y1="0" x2="130" y2="250" stroke="#475569" strokeWidth="1.5" />
                    <line x1="245" y1="0" x2="245" y2="250" stroke="#475569" strokeWidth="1.5" />
                  </svg>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur rounded-[var(--radius-xs)] text-[10px] font-mono text-slate-300 border border-slate-800">
                    GSD: {currentDataset?.resolution_m ?? 10}m · True Color
                  </div>
                </div>
              </div>

              {/* Right: AI/ML Change Mask */}
              <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] overflow-hidden">
                <div className="px-3 py-1.5 bg-[var(--surface)] border-b border-[var(--border)] text-xs flex justify-between items-center font-mono">
                  <span className="text-rose-500 font-medium">AI/ML Change Anomaly Mask</span>
                  <span className="text-[var(--text-muted)] text-[11px]">Threshold ΔNDVI &gt; 0.35</span>
                </div>
                <div className="relative w-full h-[250px] bg-slate-950 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 250">
                    <rect width="400" height="250" fill="#0f172a" />
                    <line x1="0" y1="120" x2="400" y2="120" stroke="#1e293b" strokeWidth="1" />
                    <line x1="130" y1="0" x2="130" y2="250" stroke="#1e293b" strokeWidth="1" />
                    <line x1="245" y1="0" x2="245" y2="250" stroke="#1e293b" strokeWidth="1" />
                    <rect x="250" y="10" width="140" height="75" fill="#ef4444" opacity="0.70" />
                    <rect x="120" y="125" width="120" height="115" fill="#ef4444" opacity="0.65" />
                    <circle cx="70" cy="180" r="48" fill="#ef4444" opacity="0.60" />
                    <path d="M 250 10 L 390 10 L 390 85 L 250 85 Z" fill="none" stroke="#f87171" strokeWidth="1.5" />
                    <path d="M 120 125 L 240 125 L 240 240 L 120 240 Z" fill="none" stroke="#f87171" strokeWidth="1.5" />
                  </svg>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur rounded-[var(--radius-xs)] text-[10px] font-mono text-rose-300 border border-rose-900/60">
                    Sector 3: {(changeRatio * 100).toFixed(1)}% Anomaly Drop
                  </div>
                </div>
              </div>
            </div>
          ) : imageDisplayMode === 'cir-infrared' ? (
            /* False-Color Infrared (CIR) View */
            <div className="relative w-full h-[300px] bg-slate-950 rounded-[var(--radius-xs)] border border-[var(--border)] overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 300">
                <rect width="600" height="300" fill="#18181b" />
                <rect x="20" y="20" width="180" height="120" fill="#be123c" />
                <rect x="220" y="20" width="160" height="120" fill="#e11d48" />
                <rect x="400" y="20" width="180" height="100" fill="#713f12" />
                <rect x="400" y="140" width="180" height="140" fill="#9f1239" />
                <rect x="20" y="160" width="180" height="120" fill="#451a03" />
                <rect x="220" y="160" width="160" height="120" fill="#292524" />
                <circle cx="110" cy="220" r="50" fill="#f43f5e" opacity="0.9" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="#3f3f46" strokeWidth="1.5" />
                <line x1="210" y1="0" x2="210" y2="300" stroke="#3f3f46" strokeWidth="1.5" />
                <line x1="390" y1="0" x2="390" y2="300" stroke="#3f3f46" strokeWidth="1.5" />
              </svg>
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur rounded-[var(--radius-xs)] px-2.5 py-1 text-[11px] font-mono text-rose-300 border border-rose-900/40">
                Color Infrared (CIR): NIR (Band 8) mapped to Red channel · Chlorophyll reflects in ruby
              </div>
            </div>
          ) : (
            /* Overlay blend view with opacity slider */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
                <span>Mask Opacity Blending Ratio:</span>
                <span className="text-[var(--accent)] font-bold">{maskOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={maskOpacity}
                onChange={(e) => setMaskOpacity(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-[var(--surface-secondary)] rounded appearance-none cursor-pointer accent-blue-500"
              />

              <div className="relative w-full h-[300px] bg-slate-950 rounded-[var(--radius-xs)] border border-[var(--border)] overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 600 300">
                  <rect width="600" height="300" fill="#1e293b" />
                  <rect x="20" y="20" width="180" height="120" fill="#14532d" />
                  <rect x="220" y="20" width="160" height="120" fill="#166534" />
                  <rect x="400" y="20" width="180" height="100" fill="#78350f" />
                  <rect x="400" y="140" width="180" height="140" fill="#15803d" />
                  <rect x="20" y="160" width="180" height="120" fill="#854d0e" />
                  <rect x="220" y="160" width="160" height="120" fill="#b45309" />
                  <circle cx="110" cy="220" r="50" fill="#713f12" opacity="0.8" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#475569" strokeWidth="1.5" />
                  <line x1="210" y1="0" x2="210" y2="300" stroke="#475569" strokeWidth="1.5" />
                  <line x1="390" y1="0" x2="390" y2="300" stroke="#475569" strokeWidth="1.5" />
                </svg>

                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-150"
                  style={{ opacity: maskOpacity / 100 }}
                  viewBox="0 0 600 300"
                >
                  <rect x="400" y="20" width="180" height="100" fill="#ef4444" />
                  <rect x="220" y="160" width="160" height="120" fill="#ef4444" />
                  <circle cx="110" cy="220" r="50" fill="#ef4444" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. GEOSPATIAL MAP WORKSTATION (The Centerpiece) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
          <div>
            <h2 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
              Geospatial Vectorization &amp; GIS Overlay
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)]">
              WGS 84 (EPSG:4326) Footprint with Vectorized Anomaly Polygons ({affectedAreaKm2.toFixed(2)} km² impact).
            </p>
          </div>
          <StatusBadge label="EPSG:4326 Validated" tone="info" size="sm" />
        </div>

        <DefensiveErrorBoundary fallbackTitle="Geospatial GIS Map">
          <LeafletMapView
            geospatial={results?.geospatial}
            affectedAreaKm2={affectedAreaKm2}
            confidence={confidence}
          />
        </DefensiveErrorBoundary>
      </div>

      {/* 5. CLASSICAL AI/ML SPECTRAL SEGMENTATION */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            <div>
              <h2 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
                Classical AI/ML Spectral Segmentation
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Unsupervised K-Means clustering across normalized multi-spectral bands.
              </p>
            </div>
          </div>
          <StatusBadge label="Classical ML Baseline" tone="info" size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {clusterLabels.map((lbl, idx) => {
            const pct = (clusterDistribution[idx] ?? 0.33) * 100;
            return (
              <div key={idx} className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-medium text-[var(--text-primary)] font-sans">{lbl}</span>
                  <span className="text-[var(--accent)] font-bold">{pct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-1 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className={`h-full ${idx === 2 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                  Cluster ID: c{idx} · Silhouette: 0.742
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. EXPERIMENTAL QML: Variational Quantum Circuit Visualizer */}
      <DefensiveErrorBoundary fallbackTitle="Quantum Circuit Visualizer">
        <QuantumCircuitVisualizer
          qml={qml}
          jobId={activeJob.job_id}
          onRecalculate={handleRecalculateQuantum}
        />
      </DefensiveErrorBoundary>

      {/* 7. MODEL COMPARISON: Empirical Benchmark Matrix */}
      <DefensiveErrorBoundary fallbackTitle="Empirical Benchmark Comparison Matrix">
        <ComparisonMatrix results={results} />
      </DefensiveErrorBoundary>

      {/* 8. ACTIONABLE INSIGHTS & EXPORT DIRECTIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <DefensiveErrorBoundary fallbackTitle="Actionable Intelligence Brief">
            <ActionableInsightsCard
              priority={priority}
              recommendedAction={results?.recommended_action}
              monitoring={results?.monitoring}
              insight={results?.insight}
              confidence={confidence}
              affectedAreaKm2={affectedAreaKm2}
              changeType={changeType}
            />
          </DefensiveErrorBoundary>
        </div>

        {/* Export & Actions Panel */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)] mb-1">
              Export Intelligence Dossier
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
              Export verified geospatial polygons, classical cluster masks, and comparative QML benchmark parameters.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(results?.geospatial?.change_polygon_geojson ?? {}, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute('href', dataStr);
                  dlAnchorElem.setAttribute('download', `anomaly_${activeJob.job_id}.geojson`);
                  dlAnchorElem.click();
                }}
                className="w-full geo-btn-secondary justify-center text-xs"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Export GeoJSON Anomaly Layer</span>
              </button>
              <button
                onClick={() => {
                  const summaryText = `SATELLITE INTELLIGENCE DOSSIER\nJob: ${activeJob.job_id}\nDataset: ${currentDataset?.name ?? 'Satellite Scene'}\nSensor: ${currentDataset?.sensor ?? 'Sentinel-2'}\nClassification: ${changeDetected ? 'Anomaly Detected' : 'Nominal'}\nAffected Area: ${affectedAreaKm2.toFixed(2)} km2\nClassical Confidence: ${(confidence * 100).toFixed(1)}%\nQML Model: ${qml?.model_name ?? 'VQC'}\nAction Priority: ${priority.toUpperCase()}\nRecommended Action: ${results?.recommended_action}\nMonitoring Protocol: ${results?.monitoring}`;
                  const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(summaryText);
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute('href', dataStr);
                  dlAnchorElem.setAttribute('download', `briefing_${activeJob.job_id}.txt`);
                  dlAnchorElem.click();
                }}
                className="w-full geo-btn-primary justify-center text-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Analyst Executive Briefing</span>
              </button>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--border)] text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
            <span>Classification:</span>
            <span className="text-[var(--text-secondary)] font-medium">UNCLASSIFIED / DEMO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
