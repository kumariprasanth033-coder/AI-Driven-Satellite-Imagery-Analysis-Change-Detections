import React, { useState, useEffect, useRef } from 'react';
import { Upload, Database, Play, CheckCircle2, FileText, MapPin, AlertCircle, ArrowRight, Layers, FileCheck, Filter } from 'lucide-react';
import { api } from '../services/api';
import { Dataset } from '../types/dataset';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';

interface Props {
  onStartAnalysis: (datasetId: string) => void;
}

export const SatelliteDataPage: React.FC<Props> = ({ onStartAnalysis }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedSensorFilter, setSelectedSensorFilter] = useState<string>('all');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Form states for upload
  const [uploadName, setUploadName] = useState('');
  const [sensorType, setSensorType] = useState('Sentinel-2 MSI');
  const [resolutionM, setResolutionM] = useState('10.0');
  const [latitude, setLatitude] = useState('37.7749');
  const [longitude, setLongitude] = useState('-122.4194');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      const data = await api.getDatasets();
      setDatasets(data);
      if (data.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load datasets:', e);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelected(file: File) {
    setSelectedFileName(file.name);
    if (!uploadName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setUploadName(cleanName);
    }
    setValidationError(null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadName.trim()) {
      setValidationError('Dataset name is required.');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setValidationError('Valid latitude (-90° to 90°) is required.');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setValidationError('Valid longitude (-180° to 180°) is required.');
      return;
    }

    setValidationError(null);
    setIsUploading(true);
    setUploadProgress(20);

    const pInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(pInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 180);

    try {
      const created = await api.uploadDataset({
        name: uploadName,
        sensor: sensorType,
        resolution_m: parseFloat(resolutionM) || 10.0,
        center_coords: [lat, lon],
        description: description || 'User-uploaded satellite imagery scene.',
        bbox: [lon - 0.05, lat - 0.05, lon + 0.05, lat + 0.05]
      });

      clearInterval(pInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      await loadDatasets();
      setSelectedDatasetId(created.id);

      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(false);
        setShowUploadModal(false);
        setSelectedFileName(null);
        setUploadName('');
        setDescription('');
      }, 900);
    } catch (err: any) {
      clearInterval(pInterval);
      setIsUploading(false);
      setValidationError(err?.message || 'Failed to ingest satellite raster.');
    }
  }

  if (loading) {
    return <LoadingState message="Connecting to satellite imagery repository..." />;
  }

  const filteredDatasets = datasets.filter(d => {
    if (selectedSensorFilter === 'all') return true;
    if (selectedSensorFilter === 'sentinel') return d.sensor.includes('Sentinel');
    if (selectedSensorFilter === 'landsat') return d.sensor.includes('Landsat');
    if (selectedSensorFilter === 'planet') return d.sensor.includes('Planet');
    if (selectedSensorFilter === 'custom') return d.source === 'User Upload';
    return true;
  });

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono uppercase text-[10px] tracking-wider text-[var(--accent)] font-semibold">
              Imagery Ingestion
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">Multi-Spectral Repositories</span>
          </div>
          <h1 className="font-['Syne'] font-bold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
            Satellite Imagery Data Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Ingest and catalog multi-sensor remote sensing scenes (Sentinel-2, Landsat-8, PlanetScope, GeoTIFF) with validated coordinate reference systems (CRS: EPSG:4326).
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="geo-btn-primary"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Ingest New Scene</span>
        </button>
      </div>

      {/* Filter and SOP Milestone Ribbon */}
      <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Sensor Filters */}
        <div className="flex items-center gap-1 bg-[var(--surface-secondary)] p-0.5 rounded-[var(--radius-xs)] border border-[var(--border)]">
          <span className="px-2 text-[10px] font-mono text-[var(--text-muted)] uppercase">Filter:</span>
          {[
            { id: 'all', label: 'All Constellations' },
            { id: 'sentinel', label: 'Sentinel-2' },
            { id: 'landsat', label: 'Landsat-8' },
            { id: 'planet', label: 'PlanetScope' },
            { id: 'custom', label: 'Custom' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedSensorFilter(f.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded-[var(--radius-xs)] transition-colors cursor-pointer ${
                selectedSensorFilter === f.id
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Technical Standard Notice */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] text-[var(--text-muted)]">
          <span>Top-of-Atmosphere (TOA) Reflectance</span>
          <span>·</span>
          <span>10m / 30m GSD</span>
          <span>·</span>
          <span className="text-[var(--accent)]">Normalized PCA Subspace</span>
        </div>
      </div>

      {/* Workstation Split View: Catalog Table (Left) & Detailed Scene Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left (2 Cols): High-Density Data Repository Table */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-xs overflow-hidden">
          <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
            <span className="font-mono uppercase text-[10px] text-[var(--text-muted)] font-semibold">
              Available Raster Footprints ({filteredDatasets.length})
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-mono">
              Click a row to inspect technical payload
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="geo-table">
              <thead>
                <tr>
                  <th>Scene Name</th>
                  <th>Constellation</th>
                  <th>Acquired</th>
                  <th>GSD</th>
                  <th>Size</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDatasets.map(d => {
                  const isSelected = d.id === selectedDataset?.id;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDatasetId(d.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[var(--surface-secondary)] font-medium' : ''
                      }`}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[var(--accent)]' : 'bg-transparent'}`} />
                          <div>
                            <span className="text-xs text-[var(--text-primary)] font-medium block">
                              {d.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              ID: {d.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-[var(--text-secondary)]">{d.sensor}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-[var(--text-secondary)]">{d.acquisition_date}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs">{d.resolution_m}m</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-[var(--text-muted)]">{d.file_size_mb} MB</span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartAnalysis(d.id);
                          }}
                          className="px-2.5 py-1 bg-[var(--accent)] text-white hover:brightness-110 rounded-[var(--radius-xs)] text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-97"
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 Col): Detailed Scene Inspector Panel */}
        {selectedDataset && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
                <span className="font-mono uppercase text-[10px] text-[var(--text-muted)] font-semibold">
                  Scene Spectral Inspector
                </span>
                <StatusBadge label={selectedDataset.source} tone="info" size="sm" />
              </div>

              <h3 className="font-['Syne'] font-bold text-base text-[var(--text-primary)] tracking-tight">
                {selectedDataset.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 mb-3.5 leading-relaxed">
                {selectedDataset.description}
              </p>

              {/* Technical Specifications */}
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] flex justify-between">
                  <span className="text-[var(--text-muted)]">SENSOR CONSTELLATION:</span>
                  <span className="text-[var(--text-primary)] font-medium">{selectedDataset.sensor}</span>
                </div>

                <div className="p-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] flex justify-between">
                  <span className="text-[var(--text-muted)]">SPATIAL RESOLUTION:</span>
                  <span className="text-[var(--text-primary)] font-medium">{selectedDataset.resolution_m}m GSD per pixel</span>
                </div>

                <div className="p-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] flex justify-between">
                  <span className="text-[var(--text-muted)]">GEODETIC REFERENCE:</span>
                  <span className="text-[var(--text-primary)] font-medium">{selectedDataset.crs} (WGS 84)</span>
                </div>

                <div className="p-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] flex justify-between">
                  <span className="text-[var(--text-muted)]">CENTROID COORDINATES:</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {selectedDataset.center_coords[0].toFixed(4)}°N, {Math.abs(selectedDataset.center_coords[1]).toFixed(4)}°W
                  </span>
                </div>

                <div className="p-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)]">
                  <span className="text-[var(--text-muted)] block mb-1">CALIBRATED SPECTRAL BANDS:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDataset.bands.map((b, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[10px] text-[var(--text-secondary)]">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] mt-4">
              <button
                onClick={() => onStartAnalysis(selectedDataset.id)}
                className="w-full geo-btn-primary py-2.5 justify-center"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Initialize Pipeline for this Scene</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Ingestion Modal (Clean GIS Window) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] max-w-lg w-full p-5 text-[var(--text-primary)] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <div>
                <h2 className="font-['Syne'] font-bold text-base text-[var(--text-primary)]">
                  Ingest Satellite Scene
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Register optical or multi-spectral raster dataset with coordinate bounds.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isUploading) setShowUploadModal(false);
                }}
                disabled={isUploading}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {validationError && (
              <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-[var(--radius-xs)] text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </div>
            )}

            {isUploading ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] mx-auto">
                  {uploadSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                  ) : (
                    <Upload className="w-5 h-5 animate-pulse text-[var(--accent)]" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-xs text-[var(--text-primary)]">
                    {uploadSuccess ? 'Scene Registered Successfully' : 'Validating & Ingesting Raster Data...'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
                    {uploadSuccess ? 'Ready for multi-spectral analysis' : `CRS footprint verification · ${uploadProgress}%`}
                  </p>
                </div>
                <div className="w-full h-1 bg-[var(--surface-secondary)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
                {/* Drag and Drop Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-[var(--radius-xs)] p-4 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                      : 'border-[var(--border)] bg-[var(--surface-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                    accept="image/*,.tif,.tiff"
                    className="hidden"
                  />
                  {selectedFileName ? (
                    <div className="flex items-center justify-center gap-2 text-[var(--accent)]">
                      <FileCheck className="w-4 h-4" />
                      <span className="font-mono font-medium">{selectedFileName}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-[var(--accent)] mx-auto mb-1" />
                      <p className="text-[var(--text-primary)] font-medium">
                        Drag and drop satellite raster or click to browse
                      </p>
                      <p className="text-[var(--text-muted)] text-[10px] mt-0.5 font-mono">
                        GeoTIFF, PNG, JPEG with embedded or manual CRS coordinates
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-mono uppercase text-[10px] mb-1">
                    Dataset Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Valley Orchard Assessment"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-secondary)] font-mono uppercase text-[10px] mb-1">
                      Sensor Constellation
                    </label>
                    <select
                      value={sensorType}
                      onChange={(e) => setSensorType(e.target.value)}
                      className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                    >
                      <option value="Sentinel-2 MSI">Sentinel-2 MSI (10m)</option>
                      <option value="Landsat-8 OLI">Landsat-8 OLI (30m)</option>
                      <option value="PlanetScope SuperDove">PlanetScope SuperDove (3m)</option>
                      <option value="Custom Airborne RGB/NIR">Custom Airborne (0.5m)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--text-secondary)] font-mono uppercase text-[10px] mb-1">
                      Resolution (m GSD)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={resolutionM}
                      onChange={(e) => setResolutionM(e.target.value)}
                      className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-secondary)] font-mono uppercase text-[10px] mb-1">
                      Latitude (°N)
                    </label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-secondary)] font-mono uppercase text-[10px] mb-1">
                      Longitude (°W/E)
                    </label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-secondary)] font-mono uppercase text-[10px] mb-1">
                    Operational Context &amp; Objective
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe monitoring target, agricultural parcel, or disturbance boundary..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[var(--radius-xs)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="geo-btn-primary"
                  >
                    Register &amp; Ingest Scene
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
