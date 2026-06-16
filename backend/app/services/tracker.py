import math
from typing import List, Dict, Tuple, Any

class CentroidTracker:
    """
    Algoritmo clásico Centroid Tracker para mantener la identidad de los vehículos
    a través de los fotogramas basándose en la distancia euclidiana mínima.
    """
    def __init__(self, max_distance: float = 65.0) -> None:
        """
        Inicializa el rastreador con la distancia máxima permitida para emparejar centroides.
        """
        self.max_distance = max_distance

    def update(self, vehicles_state: Dict[int, Any], current_detections: List[Dict[str, Any]], frame_idx: int) -> None:
        """
        Asocia detecciones actuales a trayectorias existentes basándose en proximidad euclidiana.
        """
        updated_ids: List[int] = []
        
        for det in current_detections:
            cx, cy = det["cx"], det["cy"]
            best_id = None
            min_dist = float("inf")
            
            for track_id, track in vehicles_state.items():
                if track_id in updated_ids:
                    continue
                last_cx, last_cy, _ = track["positions"][-1]
                dist = math.sqrt((cx - last_cx) ** 2 + (cy - last_cy) ** 2)
                
                if dist < self.max_distance and dist < min_dist:
                    min_dist = dist
                    best_id = track_id
                    
            if best_id is not None:
                vehicles_state[best_id]["positions"].append((cx, cy, frame_idx))
                det["track_id"] = best_id
                updated_ids.append(best_id)
            else:
                new_id = len(vehicles_state) + 1
                vehicles_state[new_id] = {
                    "positions": [(cx, cy, frame_idx)],
                    "stationary_frames": 0,
                    "crossed_stop_line": False,
                    "red_light_triggered": False,
                    "uturn_triggered": False,
                    "parking_triggered": False
                }
                det["track_id"] = new_id
                updated_ids.append(new_id)
