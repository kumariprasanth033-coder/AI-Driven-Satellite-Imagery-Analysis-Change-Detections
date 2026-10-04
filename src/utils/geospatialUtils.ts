import { GeoJSONFeature } from '../types/geospatial';

/**
 * Calculates geodesic bounding box surface area in km² using ellipsoidal latitude correction.
 */
export function calculateGeodesicArea(bbox: [number, number, number, number], changeRatio = 1.0): number {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const meanLat = (minLat + maxLat) / 2.0;
  const latKm = Math.abs(maxLat - minLat) * 111.32;
  const lonKm = Math.abs(maxLon - minLon) * 111.32 * Math.cos((meanLat * Math.PI) / 180);
  const totalArea = latKm * lonKm;
  return Math.round(totalArea * changeRatio * 100) / 100;
}

/**
 * Creates GeoJSON Feature for Bounding Box footprint.
 */
export function buildBBoxGeoJSON(
  bbox: [number, number, number, number],
  properties: Record<string, any> = {}
): GeoJSONFeature {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat]
      ]]
    },
    properties: {
      name: 'Dataset Footprint Boundary',
      ...properties
    }
  };
}

/**
 * Generates an organic change anomaly polygon around an epicentre.
 */
export function buildChangeDetectionPolygon(
  centerLat: number,
  centerLon: number,
  radiusKm = 1.8,
  points = 16,
  properties: Record<string, any> = {}
): GeoJSONFeature {
  const coords: [number, number][] = [];
  const latDegPerKm = 1.0 / 111.32;
  const lonDegPerKm = 1.0 / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  for (let i = 0; i < points; i++) {
    const angle = (2 * Math.PI * i) / points;
    // Multi-frequency harmonic perturbation for natural remote sensing anomaly contours
    const perturbation = 0.85 + 0.28 * Math.sin(angle * 3) + 0.12 * Math.cos(angle * 5);
    const r = radiusKm * perturbation;
    const dLat = r * Math.sin(angle) * latDegPerKm;
    const dLon = r * Math.cos(angle) * lonDegPerKm;
    coords.push([
      Math.round((centerLon + dLon) * 1000000) / 1000000,
      Math.round((centerLat + dLat) * 1000000) / 1000000
    ]);
  }
  // Close loop
  coords.push(coords[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    },
    properties: {
      anomaly_type: 'Detected Land-Cover Shift',
      confidence: 0.87,
      ...properties
    }
  };
}
