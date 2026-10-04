"""
Base Classifier interface for classical machine learning models.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import math

class BaseClassifier(ABC):
    """Abstract base class for remote sensing image classifiers."""
    
    def __init__(self, model_name: str, params: Dict[str, Any] = None):
        self.model_name = model_name
        self.params = params or {}
        self.is_trained = False
        
    @abstractmethod
    def fit(self, features: List[List[float]], labels: List[int] = None) -> "BaseClassifier":
        """Train or fit the classifier on extracted remote-sensing features."""
        pass
        
    @abstractmethod
    def predict(self, features: List[List[float]]) -> List[int]:
        """Predict class labels or anomaly flags for features."""
        pass
        
    @abstractmethod
    def evaluate(self, y_true: List[int], y_pred: List[int]) -> Dict[str, Any]:
        """Compute standard classification metrics."""
        pass
