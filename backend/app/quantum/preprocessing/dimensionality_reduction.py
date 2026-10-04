"""
Dimensionality reduction for remote sensing multi-spectral features.
Prepares continuous multi-dimensional satellite features for NISQ quantum feature encoding (4 qubits).
"""
import math
from typing import List, Tuple

class RemoteSensingPCA:
    """
    Principal Component Analysis (PCA) projection.
    Reduces N spectral/texture features down to k components (e.g. k=4)
    matching available quantum register width without arbitrary truncation.
    """
    
    def __init__(self, n_components: int = 4):
        self.n_components = n_components
        self.mean_vector: List[float] = []
        self.components: List[List[float]] = []

    def fit_transform(self, data: List[List[float]]) -> List[List[float]]:
        if not data or not data[0]:
            return []
        
        n_samples = len(data)
        n_features = len(data[0])
        target_k = min(self.n_components, n_features)

        # 1. Compute mean for each feature
        self.mean_vector = [sum(row[j] for row in data) / n_samples for j in range(n_features)]

        # 2. Center the data
        centered = [[row[j] - self.mean_vector[j] for j in range(n_features)] for row in data]

        # 3. Compute empirical covariance matrix
        cov = [[0.0] * n_features for _ in range(n_features)]
        for i in range(n_features):
            for j in range(n_features):
                cov[i][j] = sum(centered[row_idx][i] * centered[row_idx][j] for row_idx in range(n_samples)) / max(1, n_samples - 1)

        # 4. Power iteration to extract top k eigenvectors
        self.components = []
        for comp_idx in range(target_k):
            # Deterministic initial vector
            v = [1.0 / math.sqrt(n_features)] * n_features
            for _ in range(30):
                # Matrix-vector multiply
                mv = [sum(cov[r][c] * v[c] for c in range(n_features)) for r in range(n_features)]
                # Deflate previous components
                for prev in self.components:
                    proj = sum(mv[c] * prev[c] for c in range(n_features))
                    mv = [mv[c] - proj * prev[c] for c in range(n_features)]
                norm = math.sqrt(sum(x * x for x in mv))
                if norm < 1e-9:
                    break
                v = [x / norm for x in mv]
            self.components.append(v)

        # 5. Project centered data onto components
        projected = []
        for row in centered:
            p_row = [sum(row[c] * comp[c] for c in range(n_features)) for comp in self.components]
            # If target_k < self.n_components, pad with 0.0
            while len(p_row) < self.n_components:
                p_row.append(0.0)
            projected.append(p_row)

        return projected

    def normalize_for_angle_encoding(self, features: List[List[float]]) -> List[List[float]]:
        """
        Normalizes projected features to [0, pi] range suitable for Ry quantum rotations.
        """
        if not features:
            return []
        n_features = len(features[0])
        min_vals = [min(row[j] for row in features) for j in range(n_features)]
        max_vals = [max(row[j] for row in features) for j in range(n_features)]

        encoded = []
        for row in features:
            encoded_row = []
            for j in range(n_features):
                rng = max_vals[j] - min_vals[j]
                if rng < 1e-6:
                    val = 0.5 * math.pi
                else:
                    norm = (row[j] - min_vals[j]) / rng
                    val = norm * math.pi
                encoded_row.append(val)
            encoded.append(encoded_row)
        return encoded
