"""
Dataset Schema definitions.
Supports user uploaded satellite imagery, Sentinel-2, Landsat-8, and remote sensing metadata.
"""
from typing import List, Optional, Dict, Any

class DatasetMetadata:
    def __init__(
        self,
        dataset_id: str,
        name: str,
        source: str = "User Upload",
        sensor: str = "Multispectral MSI",
        acquisition_date: str = "2026-03-15",
        resolution_m: float = 10.0,
        bands: List[str] = None,
        crs: str = "EPSG:4326",
        bbox: List[float] = None,
        center_coords: List[float] = None,
        file_size_mb: float = 4.2,
        status: str = "ready",
        image_url: str = "",
        change_mask_url: Optional[str] = None,
        description: str = ""
    ):
        self.dataset_id = dataset_id
        self.name = name
        self.source = source
        self.sensor = sensor
        self.acquisition_date = acquisition_date
        self.resolution_m = resolution_m
        self.bands = bands or ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"]
        self.crs = crs
        self.bbox = bbox or [-122.45, 37.75, -122.40, 37.80]
        self.center_coords = center_coords or [37.7749, -122.4194]
        self.file_size_mb = file_size_mb
        self.status = status
        self.image_url = image_url
        self.change_mask_url = change_mask_url
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dataset_id": self.dataset_id,
            "name": self.name,
            "source": self.source,
            "sensor": self.sensor,
            "acquisition_date": self.acquisition_date,
            "resolution_m": self.resolution_m,
            "bands": self.bands,
            "crs": self.crs,
            "bbox": self.bbox,
            "center_coords": self.center_coords,
            "file_size_mb": self.file_size_mb,
            "status": self.status,
            "image_url": self.image_url,
            "change_mask_url": self.change_mask_url,
            "description": self.description
        }
