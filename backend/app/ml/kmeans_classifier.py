"""
K-Means clustering implementation for satellite land-cover change detection.
"""
import random
import math
from typing import List, Dict, Any
from .base_classifier import BaseClassifier

class KMeansClassifier(BaseClassifier):
    """
    K-Means clustering on multi-spectral / reduced satellite feature vectors.
    Partitions pixel feature vectors into k clusters to separate baseline land cover from change anomalies.
    """
    
    def __init__(self, k: int = 3, max_iter: int = 30, random_state: int = 42):
        super().__init__("K-Means Cluster Baseline", {"k": k, "max_iter": max_iter, "random_state": random_state})
        self.k = k
        self.max_iter = max_iter
        self.random_state = random_state
        self.centroids: List[List[float]] = []

    def _euclidean_dist(self, p1: List[float], p2: List[float]) -> float:
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))

    def fit(self, features: List[List[float]], labels: List[int] = None) -> "KMeansClassifier":
        if not features:
            return self
        random.seed(self.random_state)
        num_features = len(features[0])
        # Random initial centroids
        sampled_indices = random.sample(range(len(features)), min(self.k, len(features)))
        self.centroids = [features[i][:] for i in sampled_indices]

        for _ in range(self.max_iter):
            clusters: List[List[List[float]]] = [[] for _ in range(self.k)]
            for pt in features:
                closest_idx = min(range(self.k), key=lambda i: self._euclidean_dist(pt, self.centroids[i]))
                clusters[closest_idx].append(pt)

            new_centroids = []
            for i, cluster in enumerate(clusters):
                if not cluster:
                    new_centroids.append(self.centroids[i])
                    continue
                mean_pt = [sum(c[dim] for c in cluster) / len(cluster) for dim in range(num_features)]
                new_centroids.append(mean_pt)

            # Check convergence
            shifts = [self._euclidean_dist(c1, c2) for c1, c2 in zip(self.centroids, new_centroids)]
            self.centroids = new_centroids
            if max(shifts) < 1e-4:
                break

        self.is_trained = True
        return self

    def predict(self, features: List[List[float]]) -> List[int]:
        if not self.centroids:
            return [0] * len(features)
        preds = []
        for pt in features:
            closest_idx = min(range(self.k), key=lambda i: self._euclidean_dist(pt, self.centroids[i]))
            preds.append(closest_idx)
        return preds

    def evaluate(self, y_true: List[int], y_pred: List[int]) -> Dict[str, Any]:
        if not y_true or len(y_true) != len(y_pred):
            return {"accuracy": "N/A", "precision": "N/A", "recall": "N/A", "f1_score": "N/A"}
        
        correct = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
        total = len(y_true)
        acc = round(correct / total, 4) if total > 0 else 0.0

        # Binary change evaluation (class 1 as change anomaly)
        tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
        fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
        fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)
        tn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)

        precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
        recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
        f1 = round(2 * precision * recall / (precision + recall), 4) if (precision + recall) > 0 else 0.0

        return {
            "accuracy": acc,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "confusion_matrix": {"tp": tp, "fp": fp, "fn": fn, "tn": tn}
        }
