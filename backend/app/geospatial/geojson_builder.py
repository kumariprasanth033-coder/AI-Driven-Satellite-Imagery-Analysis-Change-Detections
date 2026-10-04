"""
Geospatial GeoJSON builder and geodesic coordinate utilities.
Constructs standard GeoJSON features (FeatureCollection, Polygons) for satellite footprints,
analysis boundary bounding boxes, and detected change regions.
"""
import math
from typing import Dict, Any, List, Tuple

def create_bounding_box_geojson(
    bbox: List[float], # [min_lon, min_lat, max_lon, max_lat]
    properties: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Creates a GeoJSON Feature Polygon for a bounding box footprint.
    Coordinates format: [ [ [lon, lat], [lon, lat], ... ] ]
    """
    min_lon, min_lat, max_lon, max_lat = bbox
    coordinates = [[
        [min_lon, min_lat],
        [max_lon, min_lat],
        [max_lon, max_lat],
        [min_lon, max_lat],
        [min_lon, min_lat]  # closed ring
    ]]
    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": coordinates
        },
        "properties": properties or {}
    }

def create_change_detection_polygon(
    center_lon: float,
    center_lat: float,
    radius_km: float,
    points: int = 16,
    properties: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Generates a localized change-detection anomaly polygon around an epicentre.
    Uses approximate haversine projection for geodesic circle/anomaly geometry.
    """
    coords = []
    # 1 deg lat ~ 111.32 km
    # 1 deg lon ~ 111.32 * cos(lat) km
    lat_deg_per_km = 1.0 / 111.32
    lon_deg_per_km = 1.0 / (111.32 * math.cos(math.radians(center_lat)))

    for i in range(points):
        angle = (2.0 * math.pi * i) / points
        # Add slight natural irregularity to simulate realistic land-cover change boundary
        jitter = 0.85 + 0.30 * math.sin(angle * 3)
        r = radius_km * jitter
        d_lat = r * math.sin(angle) * lat_deg_per_km
        d_lon = r * math.cos(angle) * lon_deg_per_km
        coords.append([round(center_lon + d_lon, 6), round(center_lat + d_lat, 6)])

    # Close the polygon
    coords.append(coords[0])

    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [coords]
        },
        "properties": properties or {
            "name": "Detected Change Anomaly",
            "anomaly_type": "Vegetation / Land-Cover Shift",
            "confidence": 0.87
        }
    }

def calculate_geodesic_area_km2(bbox: List[float], change_ratio: float) -> float:
    """
    Computes approximate ground surface area in square kilometers for a bounding box,
    multiplied by the detected change pixel ratio.
    """
    min_lon, min_lat, max_lon, max_lat = bbox
    mean_lat = (min_lat + max_lat) / 2.0
    width_km = abs(max_lon - min_lon) * 111.32 * math.cos(math.radians(mean_lat))
    height_km = abs(max_lat - min_lat) * 111.32
    total_area = width_km * height_km
    return round(total_area * change_ratio, 2)
