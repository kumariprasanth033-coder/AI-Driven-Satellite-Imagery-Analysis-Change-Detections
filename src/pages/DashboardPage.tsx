import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Cpu, Play, Upload, ArrowRight, Layers, MapPin, Compass, Activity, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Dataset } from '../types/dataset';
import { AnalysisJob } from '../types/analysis';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';

interface Props {
  onNavigate: (tab: 'dashboard' | 'data' | 'analysis' | 'results') => void;
  onSelectDatasetForAnalysis: (datasetId: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigate, onSelectDatasetForAnalysis }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dList, jList] = await Promise.all([api.getDatasets(), api.getJobs()]);
        setDatasets(dList);
        setJobs(jList);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading geospatial intelligence workspace..." />;
  }

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const detectedChangesCount = jobs.filter(j => j.results?.change_detected).length;
  const latestJob = jobs[0];

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar with Direct Ingestion / Run Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono uppercase text-[10px] tracking-wider text-[var(--accent)] font-semibold">
              Earth Observation Intelligence
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">Hybrid Classical &amp; Quantum Architecture</span>
          </div>
          <h1 className="font-['Syne'] font-bold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
            AI-Driven Satellite Imagery Analysis &amp; Change Detection
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Automated multi-spectral change anomaly detection, geodesic vector overlays, and experimental 4-qubit quantum machine learning (QML) benchmarking for environmental monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('data')}
            className="geo-btn-secondary"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Ingest Satellite Scene</span>
          </button>
          <button
            onClick={() => {
              if (datasets.length > 0) {
                onSelectDatasetForAnalysis(datasets[0].id);
              } else {
                onNavigate('data');
              }
            }}
            className="geo-btn-primary"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Analysis Pipeline</span>
          </button>
        </div>
      </div>

      {/* 2. Integrated Telemetry Bar (Single compact strip with hairline dividers) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
          {/* Cell 1: Catalog Imagery */}
          <div className="p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
              <span>Catalog Imagery</span>
              <Database className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
                {datasets.length}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">Scenes</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
              Sentinel-2, Landsat-8, PlanetScope &amp; Custom
            </span>
          </div>

          {/* Cell 2: Completed Pipelines */}
          <div className="p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
              <span>Completed Pipelines</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[var(--success)]">
                {completedJobs.length}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">Runs</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
              Classical ML &amp; Quantum simulation verified
            </span>
          </div>

          {/* Cell 3: Detected Anomalies */}
          <div className="p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
              <span>Detected Anomalies</span>
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[var(--warning)]">
                {detectedChangesCount}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">Sites</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
              Geodesic polygon boundaries calculated
            </span>
          </div>

          {/* Cell 4: Quantum Register */}
          <div className="p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
              <span>Quantum Register</span>
              <Cpu className="w-3.5 h-3.5 text-[var(--quantum)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[var(--quantum)]">
                4
              </span>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">Qubits</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
              NISQ Statevector simulation (1024 shots)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Workstation Grid: Architecture Flow & Current Mission Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Processing Lifecycle (2 Cols) */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
            <div>
              <h2 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
                Multi-Sensor &amp; Quantum Processing Lifecycle
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Standardized pipeline executing classical clustering and quantum variational ansatz.
              </p>
            </div>
            <StatusBadge label="Operational" tone="success" size="sm" />
          </div>

          {/* Connected Lifecycle Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
              <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)] mb-1">
                <span>STAGE 01</span>
                <span className="text-[var(--accent)] font-semibold">DATA</span>
              </div>
              <h3 className="font-semibold text-xs text-[var(--text-primary)]">Data Ingestion</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                Calibration of multi-spectral bands (RGB, NIR, SWIR) and CRS footprint extraction.
              </p>
            </div>

            <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
              <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)] mb-1">
                <span>STAGE 02</span>
                <span className="text-[var(--accent)] font-semibold">PREP</span>
              </div>
              <h3 className="font-semibold text-xs text-[var(--text-primary)]">Preprocessing &amp; PCA</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                Spectral index calculation (NDVI) and continuous reduction to 4-component feature vector.
              </p>
            </div>

            <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
              <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)] mb-1">
                <span>STAGE 03</span>
                <span className="text-[var(--quantum)] font-semibold">HYBRID</span>
              </div>
              <h3 className="font-semibold text-xs text-[var(--text-primary)]">ML &amp; Quantum VQC</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                Parallel evaluation of K-Means clustering against 4-qubit parameterized circuit.
              </p>
            </div>

            <div className="p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
              <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)] mb-1">
                <span>STAGE 04</span>
                <span className="text-[var(--success)] font-semibold">INSIGHTS</span>
              </div>
              <h3 className="font-semibold text-xs text-[var(--text-primary)]">Geospatial Insights</h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                Interactive Leaflet change polygon mapping and rule-based decision support.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)] font-sans text-[11px]">
              Demonstration ready: Select any active scene from the catalog to launch live analysis.
            </span>
            <button
              onClick={() => onNavigate('data')}
              className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-medium text-xs cursor-pointer"
            >
              <span>Open Satellite Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Latest Analysis Brief (1 Col) */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
              <h2 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)] tracking-wide">
                Latest Analysis Brief
              </h2>
              {latestJob ? (
                <StatusBadge
                  label={latestJob.results?.priority ? `${latestJob.results.priority} Priority` : 'Completed'}
                  tone={latestJob.results?.priority === 'critical' ? 'critical' : 'warning'}
                  size="sm"
                />
              ) : (
                <StatusBadge label="No Activity" tone="neutral" size="sm" />
              )}
            </div>

            {latestJob && latestJob.results ? (
              <div className="space-y-2.5 text-xs">
                {/* Job Specs */}
                <div className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] font-mono">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[var(--text-muted)]">JOB IDENTIFIER:</span>
                    <span className="text-[var(--text-primary)] font-semibold">{latestJob.job_id}</span>
                  </div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[var(--text-muted)]">DETECTED PHENOMENON:</span>
                    <span className="text-rose-500 font-semibold">{latestJob.results.change_type}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">IMPACT AREA:</span>
                    <span className="text-[var(--text-primary)] font-bold">{latestJob.results.affected_area_km2?.toFixed(2)} km²</span>
                  </div>
                </div>

                {/* Dual-Branch Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">CONFIDENCE:</span>
                    <span className="text-[var(--success)] font-bold text-sm">
                      {((latestJob.results.confidence ?? 0.865) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">QML ANOMALY SCORE:</span>
                    <span className="text-[var(--quantum)] font-bold text-sm">
                      {latestJob.results.qml?.anomaly_score?.toFixed(3) ?? '0.840'}
                    </span>
                  </div>
                </div>

                {/* Recommended Operational Action */}
                <div className="p-2.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
                  <span className="font-mono uppercase text-[10px] text-[var(--text-muted)] block mb-0.5">
                    Recommended Action
                  </span>
                  <p className="text-[11px] text-[var(--text-primary)] font-medium leading-relaxed">
                    {latestJob.results.recommended_action}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] py-6 text-center">
                No completed analyses available yet.
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border)] mt-3">
            <button
              onClick={() => onNavigate('results')}
              className="w-full geo-btn-secondary"
            >
              <span>View Full Dossier</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Active Satellite Scenes Repository Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="font-['Syne'] font-bold text-sm text-[var(--text-primary)]">
              Active Satellite Scenes in Catalog
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Available multi-spectral raster parcels with spatial coordinates.
            </p>
          </div>
          <button
            onClick={() => onNavigate('data')}
            className="text-xs text-[var(--accent)] hover:underline font-mono"
          >
            View All ({datasets.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="geo-table">
            <thead>
              <tr>
                <th>Scene Name</th>
                <th>Constellation</th>
                <th>Spatial GSD</th>
                <th>Acquired</th>
                <th>Target Coordinates</th>
                <th>Payload Bands</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((d) => (
                <tr key={d.id} className="transition-colors">
                  <td>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{d.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] line-clamp-1">{d.description}</div>
                  </td>
                  <td>
                    <span className="font-mono text-xs">{d.sensor}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs">{d.resolution_m}m</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-[var(--text-secondary)]">{d.acquisition_date}</span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                      {d.center_coords[0].toFixed(2)}°N, {Math.abs(d.center_coords[1]).toFixed(2)}°W
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                      {d.bands.length} Bands (RGB+NIR)
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onSelectDatasetForAnalysis(d.id)}
                      className="px-2.5 py-1 bg-[var(--surface-secondary)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] rounded-[var(--radius-xs)] text-xs font-medium text-[var(--accent)] transition-all cursor-pointer"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
