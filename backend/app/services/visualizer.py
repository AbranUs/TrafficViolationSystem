import os
import cv2
from typing import List, Tuple, Optional, Any

def save_highlighted_frame(
    frame: Any, 
    bbox: List[float], 
    label: str, 
    frame_path: str, 
    width: int, 
    height: int,
    extra_objects: Optional[List[Tuple[List[float], str, Tuple[int, int, int]]]] = None
) -> None:
    """
    Dibuja un rectángulo coloreado y la etiqueta sobre una copia del fotograma,
    junto con objetos adicionales opcionales (como el semáforo), y lo almacena en disco.
    """
    # Asegurar la creación del directorio contenedor
    os.makedirs(os.path.dirname(frame_path), exist_ok=True)
    
    vis_frame = frame.copy()
    
    # 1. Dibujar el objeto principal (Vehículo infractor)
    x1_n, y1_n, x2_n, y2_n = bbox
    x1, y1 = int(x1_n * width), int(y1_n * height)
    x2, y2 = int(x2_n * width), int(y2_n * height)
    
    # Color Rojo en formato BGR
    red_color = (50, 50, 255)
    cv2.rectangle(vis_frame, (x1, y1), (x2, y2), red_color, 2)
    
    # Etiqueta del vehículo
    (w_l, h_l), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
    cv2.rectangle(vis_frame, (x1, y1 - h_l - 6), (x1 + w_l + 10, y1), red_color, -1)
    cv2.putText(vis_frame, label, (x1 + 5, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    
    # 2. Dibujar objetos adicionales (como el semáforo)
    if extra_objects:
        for ex_bbox, ex_label, ex_color in extra_objects:
            ex_x1_n, ex_y1_n, ex_x2_n, ex_y2_n = ex_bbox
            ex_x1, ex_y1 = int(ex_x1_n * width), int(ex_y1_n * height)
            ex_x2, ex_y2 = int(ex_x2_n * width), int(ex_y2_n * height)
            
            # Dibujar el rectángulo del objeto extra
            cv2.rectangle(vis_frame, (ex_x1, ex_y1), (ex_x2, ex_y2), ex_color, 2)
            
            # Dibujar etiqueta
            (ex_w_l, ex_h_l), _ = cv2.getTextSize(ex_label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
            cv2.rectangle(vis_frame, (ex_x1, ex_y1 - ex_h_l - 6), (ex_x1 + ex_w_l + 10, ex_y1), ex_color, -1)
            cv2.putText(vis_frame, ex_label, (ex_x1 + 5, ex_y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            
    cv2.imwrite(frame_path, vis_frame)
