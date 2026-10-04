export interface GeoJSONPolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][]; // [ [ [lon, lat], ... ] ]
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONPolygonGeometry;
  properties: Record<string, any>;
}

export interface GeospatialData {
  crs: string;
  bbox: [number, number, number, number];
  center_coords: [number, number];
  boundary_geojson: GeoJSONFeature;
  change_polygon_geojson: GeoJSONFeature;
  is_prototype_coordinates: boolean;
}
