import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Maximize2, 
  Compass, 
  MapPin, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Activity, 
  Mountain, 
  Satellite, 
  Map, 
  Globe,
  Radio
} from 'lucide-react';
import { GeospatialData } from '../types/geospatial';
import { useTheme } from '../context/ThemeContext';

export type BasemapMode = 'satellite' | 'hybrid' | 'street' | 'terrain' | 'false_color' | 'perspective_3d';

interface Props {
  geospatial?: GeospatialData;
  changeMaskUrl?: string;
  affectedAreaKm2?: number;
  confidence?: number;
}

export const LeafletMapView: React.FC<Props> = ({
  geospatial,
  changeMaskUrl,
  affectedAreaKm2 = 14.8,
  confidence = 0.865
}) => {
  const { effectiveTheme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [basemapMode, setBasemapMode] = useState<BasemapMode>('satellite');
  const [showMask, setShowMask] = useState<boolean>(true);
  const [showFootprint, setShowFootprint] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Safe fallback coordinates (Default: San Joaquin Valley, CA)
  const centerLat = geospatial?.center_coords?.[0] ?? 36.515;
  const centerLon = geospatial?.center_coords?.[1] ?? -120.175;
  const rawBbox = geospatial?.bbox ?? [-120.25, 36.45, -120.10, 36.58];

  const validBBox = Array.isArray(rawBbox) && rawBbox.length === 4 && rawBbox.every(n => typeof n === 'number' && !isNaN(n))
    ? rawBbox
    : [-120.25, 36.45, -120.10, 36.58];
  const [minLon, minLat, maxLon, maxLat] = validBBox;
  const bboxBounds: L.LatLngBoundsExpression = [
    [minLat, minLon],
    [maxLat, maxLon]
  ];

  // Initialize and update Leaflet map
  useEffect(() => {
    if (basemapMode === 'perspective_3d') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;

    // Clean up previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // Add Zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Metric Scale control bottom-left
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      // Define Basemap Tile Layers
      let activeTileLayer: L.TileLayer;
      let labelOverlayLayer: L.TileLayer | null = null;

      if (basemapMode === 'satellite' || basemapMode === 'hybrid') {
        activeTileLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18 }
        );
        if (basemapMode === 'hybrid') {
          labelOverlayLayer = L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
            { maxZoom: 19 }
          );
        }
      } else if (basemapMode === 'terrain') {
        activeTileLayer = L.tileLayer(
          'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          { maxZoom: 17 }
        );
      } else if (basemapMode === 'false_color') {
        // Infrared Vegetation Simulation (Using high contrast NIR-shifted Imagery)
        activeTileLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 18,
            className: 'false-color-infrared-tile'
          }
        );
      } else {
        // Standard Street / Dark CartoDB
        activeTileLayer = L.tileLayer(
          effectiveTheme === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 19 }
        );
      }

      activeTileLayer.addTo(map);
      if (labelOverlayLayer) {
        labelOverlayLayer.addTo(map);
      }

      // 1. Draw Bounding Box Footprint Polygon (Blue dashed border)
      if (showFootprint) {
        L.rectangle(bboxBounds, {
          color: '#3b82f6',
          weight: 1.5,
          dashArray: '5, 5',
          fill: false
        }).addTo(map);
      }

      // 2. Draw Detected Change Polygon (Red anomaly layer)
      const polyCoords = geospatial?.change_polygon_geojson?.geometry?.coordinates?.[0];
      if (showMask && Array.isArray(polyCoords) && polyCoords.length > 2) {
        const latLngs: [number, number][] = polyCoords.map(([lon, lat]) => [lat, lon]);

        const changePolygon = L.polygon(latLngs, {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.38,
          weight: 2
        }).addTo(map);

        changePolygon.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: ${effectiveTheme === 'dark' ? '#F8FAFC' : '#0F172A'}; line-height: 1.45;">
            <div style="font-weight: 700; color: #EF4444; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
              <span>Detected Change Anomaly</span>
            </div>
            <div>Extent: <strong>${affectedAreaKm2.toFixed(2)} km²</strong></div>
            <div>Confidence: <strong>${(confidence * 100).toFixed(1)}%</strong></div>
            <div>Geodetic Datum: <strong>WGS 84 (EPSG:4326)</strong></div>
            <div style="margin-top: 4px; font-size: 10px; color: #94A3B8;">Method: Multi-spectral Spectral Distance</div>
          </div>
        `);
      }

      // Track cursor coordinates
      map.on('mousemove', (e) => {
        setMouseCoords({
          lat: parseFloat(e.latlng.lat.toFixed(4)),
          lng: parseFloat(e.latlng.lng.toFixed(4))
        });
      });

      map.on('mouseout', () => {
        setMouseCoords(null);
      });

      // Fit map view to bounding box with padding
      map.fitBounds(bboxBounds, { padding: [28, 28] });

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Leaflet map initialization notice:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [basemapMode, showMask, showFootprint, effectiveTheme, centerLat, centerLon, affectedAreaKm2, confidence]);

  // Recenter / Reset Bounds
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bboxBounds, { padding: [28, 28] });
    }
  };

  return (
    <div className={`relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded overflow-hidden flex flex-col transition-all duration-200 ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[440px]'
    }`}>
      {/* Top Geospatial Workstation Toolbar */}
      <div className="p-2.5 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2.5 text-xs z-10">
        
        {/* Basemap Visualization Mode Switcher */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-0.5 rounded border border-[var(--border-subtle)] overflow-x-auto">
          <button
            onClick={() => setBasemapMode('satellite')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              basemapMode === 'satellite'
                ? 'bg-[var(--accent-blue)] text-white font-medium shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="High-Resolution True Color Satellite Imagery"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            onClick={() => setBasemapMode('hybrid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              basemapMode === 'hybrid'
                ? 'bg-[var(--accent-blue)] text-white font-medium shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Satellite Imagery with Cartographic Overlays"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Hybrid</span>
          </button>

          <button
            onClick={() => setBasemapMode('street')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              basemapMode === 'street'
                ? 'bg-[var(--accent-blue)] text-white font-medium shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Standard Vector Road & Cartographic Basemap"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Carto</span>
          </button>

          <button
            onClick={() => setBasemapMode('terrain')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              basemapMode === 'terrain'
                ? 'bg-[var(--accent-blue)] text-white font-medium shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Topographic Hillshade & Contour Elevation"
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>

          <button
            onClick={() => setBasemapMode('false_color')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              basemapMode === 'false_color'
                ? 'bg-rose-600 text-white font-medium shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Simulated False-Color Infrared (CIR: NIR, Red, Green)"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>CIR NIR</span>
          </button>

          <button
            onClick={() => setBasemapMode('perspective_3d')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              basemapMode === 'perspective_3d'
                ? 'bg-purple-600 text-white font-medium shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="2.5D Perspective Terrain Exploration"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Perspective</span>
          </button>
        </div>

        {/* Layer Toggles & View Controls */}
        <div className="flex items-center gap-2">
          {/* Anomaly Polygon Toggle */}
          <button
            onClick={() => setShowMask(!showMask)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
              showMask
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-medium'
                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
            title="Toggle Change Anomaly Vector Layer"
          >
            {showMask ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Anomaly Mask</span>
          </button>

          {/* Footprint Boundary Toggle */}
          <button
            onClick={() => setShowFootprint(!showFootprint)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
              showFootprint
                ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 font-medium'
                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
            }`}
            title="Toggle Bounding Footprint Boundary"
          >
            <MapPin className="w-3 h-3" />
            <span>Boundary</span>
          </button>

          {/* Recenter Button */}
          {basemapMode !== 'perspective_3d' && (
            <button
              onClick={handleRecenter}
              className="p-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors cursor-pointer"
              title="Reset View to Scene Footprint"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Geospatial Workstation'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport Canvas: Leaflet Map or 3D Perspective Canvas */}
      {basemapMode === 'perspective_3d' ? (
        /* 2.5D Perspective Geospatial Viewport */
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Simulated 3D Topographic Mesh */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <svg
              className="w-full h-full max-h-[380px]"
              viewBox="0 0 700 360"
              style={{ transform: 'perspective(600px) rotateX(28deg)' }}
            >
              <defs>
                <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <linearGradient id="anomaly3d" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Base terrain grid */}
              <polygon points="50,280 350,60 650,280" fill="url(#terrainGrad)" stroke="#334155" strokeWidth="1" />
              
              {/* Elevation contour rings */}
              <ellipse cx="350" cy="180" rx="220" ry="85" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4,4" />
              <ellipse cx="350" cy="160" rx="160" ry="60" fill="none" stroke="#334155" strokeWidth="1" />
              <ellipse cx="350" cy="140" rx="100" ry="38" fill="none" stroke="#475569" strokeWidth="1" />
              <ellipse cx="350" cy="120" rx="50" ry="18" fill="none" stroke="#64748b" strokeWidth="1" />

              {/* Bounding box ground projection */}
              {showFootprint && (
                <polygon
                  points="180,240 320,110 520,110 440,240"
                  fill="rgba(59, 130, 246, 0.08)"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                />
              )}

              {/* Extruded Change Anomaly Polygon */}
              {showMask && (
                <g>
                  {/* Base shadow */}
                  <polygon
                    points="260,210 320,150 410,165 370,225"
                    fill="rgba(0, 0, 0, 0.5)"
                  />
                  {/* Extruded sides */}
                  <polygon points="260,210 260,185 320,125 320,150" fill="#991b1b" opacity="0.85" />
                  <polygon points="320,150 320,125 410,140 410,165" fill="#7f1d1d" opacity="0.85" />
                  <polygon points="410,165 410,140 370,200 370,225" fill="#b91c1c" opacity="0.85" />
                  {/* Top face */}
                  <polygon
                    points="260,185 320,125 410,140 370,200"
                    fill="url(#anomaly3d)"
                    stroke="#fca5a5"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Target Marker Pin */}
              <circle cx="340" cy="160" r="4" fill="#60a5fa" />
              <line x1="340" y1="160" x2="340" y2="105" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2,2" />
              <rect x="290" y="85" width="100" height="20" rx="3" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
              <text x="340" y="99" fill="#93c5fd" fontSize="10" fontFamily="monospace" textAnchor="middle">
                ANOMALY EPICENTRE
              </text>
            </svg>
          </div>

          {/* 3D Perspective HUD overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded px-2.5 py-1.5 text-[11px] font-mono text-slate-300">
            <div className="text-purple-400 font-semibold mb-0.5">2.5D Topographic Shading</div>
            <div className="text-slate-400 text-[10px]">Pitch: 28° · Vertical Exaggeration: 2.2x · Sun Azimuth: 315°</div>
          </div>
        </div>
      ) : (
        /* Standard 2D Leaflet Viewport */
        <div ref={mapContainerRef} className="flex-1 w-full h-full relative z-0" />
      )}

      {/* Floating Tactical Legend Overlay */}
      {showLegend && (
        <div className="absolute bottom-3 right-3 z-10 bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] rounded p-2.5 text-[11px] font-mono shadow-md max-w-[220px]">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-primary)]">Workstation Legend</span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[10px] cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2 bg-rose-500/70 border border-rose-400 rounded-xs shrink-0" />
              <span className="text-[var(--text-secondary)]">Anomaly Zone ({affectedAreaKm2.toFixed(1)} km²)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-0.5 border-b border-dashed border-blue-400 shrink-0" />
              <span className="text-[var(--text-secondary)]">Analysis Footprint (10m)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[var(--text-secondary)]">Datum: WGS 84 (EPSG:4326)</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Coordinates Readout HUD */}
      <div className="absolute bottom-3 left-18 z-10 hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] rounded text-[10px] font-mono text-[var(--text-muted)] shadow-xs">
        <Compass className="w-3 h-3 text-[var(--accent-blue)]" />
        <span>
          {mouseCoords ? `${mouseCoords.lat}° N, ${Math.abs(mouseCoords.lng)}° W` : `${centerLat.toFixed(4)}° N, ${Math.abs(centerLon).toFixed(4)}° W`}
        </span>
        <span className="text-slate-400">·</span>
        <span>Zoom: 12</span>
      </div>
    </div>
  );
};
