import random
import math
from typing import Tuple, Dict, Any, List

# =====================================================================
# CONFIGURACIÓN DE HIPERPARÁMETROS DE TRÁNSITO (GEOMETRÍA)
# =====================================================================
STOP_LINE_COEFF: float = 0.7  # Línea de parada semafórica a la altura: y = 0.7 * alto
PROHIBITED_PARKING_ZONE: Dict[str, float] = {
    "x_min": 0.05,  # 5% del ancho del video
    "y_min": 0.50,  # 50% de la altura del video
    "x_max": 0.45,  # 45% del ancho del video
    "y_max": 0.95   # 95% de la altura del video
}
STATIONARY_PIXELS_THRESHOLD: float = 5.0  # Desplazamiento menor a 5 px califica como inmóvil
PARKING_FRAMES_THRESHOLD: int = 90       # ~3 segundos inmóvil a 30 FPS
UTURN_Y_INVERSION_THRESHOLD: float = 0.15  # Umbral de parábola de giro en U (15% del alto del video)

def generate_mock_license_plate() -> str:
    """
    Genera un número de placa vehicular simulado aleatorio (Formato estándar: ABC-1234).
    """
    cryptogen = random.SystemRandom()
    letters = "".join(cryptogen.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=3))
    numbers = "".join(cryptogen.choices("0123456789", k=4))
    return f"{letters}-{numbers}"

def check_red_light_violation(
    positions: List[Tuple[int, int, int]], 
    height: int, 
    traffic_light_state: str, 
    track: Dict[str, Any]
) -> Tuple[bool, str]:
    """
    Evalúa si la trayectoria del vehículo cruzó la línea de parada cuando la luz del semáforo era ROJA.
    Retorna (True, descripcion) si se confirma la infracción de tránsito.
    """
    if len(positions) < 2:
        return False, ""
        
    cx_prev, cy_prev, _ = positions[-2]
    cx_curr, cy_curr, _ = positions[-1]
    stop_line_y = STOP_LINE_COEFF * height
    
    # Comprobar si el centroide del vehículo cruzó la línea de y en sentido vertical descendente
    if cy_prev <= stop_line_y and cy_curr > stop_line_y:
        track["crossed_stop_line"] = True
        if traffic_light_state == "RED" and not track["red_light_triggered"]:
            track["red_light_triggered"] = True
            descripcion = (
                f"El vehículo omitió la línea de parada establecida (y={STOP_LINE_COEFF}) "
                f"cuando el semáforo se encontraba en luz ROJA."
            )
            return True, descripcion
            
    return False, ""

def check_uturn_violation(
    positions: List[Tuple[int, int, int]], 
    height: int, 
    track: Dict[str, Any]
) -> Tuple[bool, str]:
    """
    Evalúa si la trayectoria del vehículo dibuja una curva vertical en forma de U (parábola).
    Retorna (True, descripcion) si se confirma la infracción de giro prohibido en U.
    """
    if len(positions) < 15 or track["uturn_triggered"]:
        return False, ""
        
    ys = [p[1] for p in positions]
    min_y = min(ys)
    max_y = max(ys)
    
    idx_min = ys.index(min_y)
    idx_max = ys.index(max_y)
    
    # Evaluar si hay un punto de inflexión vertical cóncavo/convexo en la trayectoria
    if 0 < idx_max < len(ys) - 1:
        start_y = ys[0]
        end_y = ys[-1]
        
        down_dist = max_y - start_y
        up_dist = max_y - end_y
        threshold_px = UTURN_Y_INVERSION_THRESHOLD * height
        
        if down_dist > threshold_px and up_dist > threshold_px:
            track["uturn_triggered"] = True
            descripcion = "Se detectó un cambio drástico de trayectoria parabólica (giro en U prohibido)."
            return True, descripcion
            
    return False, ""

def check_parking_violation(
    det: Dict[str, Any], 
    positions: List[Tuple[int, int, int]], 
    width: int, 
    height: int, 
    track: Dict[str, Any]
) -> Tuple[bool, str]:
    """
    Evalúa si el vehículo invadió la zona de seguridad peatonal / cruce de cebra y permaneció inmóvil.
    Retorna (True, descripcion) si se confirma la infracción de invasión de paso peatonal.
    """
    cx, cy = det["cx"], det["cy"]
    
    px_x_min = PROHIBITED_PARKING_ZONE["x_min"] * width
    px_x_max = PROHIBITED_PARKING_ZONE["x_max"] * width
    px_y_min = PROHIBITED_PARKING_ZONE["y_min"] * height
    px_y_max = PROHIBITED_PARKING_ZONE["y_max"] * height
    
    # Verificar si las coordenadas del centroide están dentro del área peatonal delimitada
    if px_x_min <= cx <= px_x_max and px_y_min <= cy <= px_y_max:
        if len(positions) >= 2:
            cx_p, cy_p, _ = positions[-2]
            cx_c, cy_c, _ = positions[-1]
            dist = math.sqrt((cx_c - cx_p) ** 2 + (cy_c - cy_p) ** 2)
            
            # Si el desplazamiento de píxeles es inferior al umbral, se considera estacionario
            if dist < STATIONARY_PIXELS_THRESHOLD:
                track["stationary_frames"] += 1
            else:
                track["stationary_frames"] = 0
                
            if track["stationary_frames"] >= PARKING_FRAMES_THRESHOLD and not track["parking_triggered"]:
                track["parking_triggered"] = True
                descripcion = (
                    f"Permaneció inmóvil por {track['stationary_frames']} fotogramas "
                    f"dentro de la zona restringida de seguridad peatonal."
                )
                return True, descripcion
                
    return False, ""
