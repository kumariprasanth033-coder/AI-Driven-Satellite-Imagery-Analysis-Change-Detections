export interface Dataset {
  id: string;
  name: string;
  source: 'Sentinel-2' | 'Landsat-8' | 'PlanetScope' | 'User Upload';
  sensor: string;
  acquisition_date: string;
  resolution_m: number;
  bands: string[];
  crs: string;
  bbox: [number, number, number, number]; // [min_lon, min_lat, max_lon, max_lat]
  center_coords: [number, number]; // [lat, lon]
  file_size_mb: number;
  status: 'ready' | 'processing' | 'archived';
  image_url: string;
  change_mask_url?: string;
  description: string;
  thumbnail_theme: 'agriculture' | 'forest' | 'coastal' | 'urban';
}
