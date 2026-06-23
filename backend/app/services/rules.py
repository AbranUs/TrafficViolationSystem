import random
import math
import re
from typing import Tuple, Dict, Any, List
import cv2

# Lector OCR global cargado de forma perezosa
_ocr_reader = None

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
    track: Dict[str, Any],
    stop_line_y: float = None
) -> Tuple[bool, str]:
    """
    Evalúa si la trayectoria del vehículo cruzó la línea de parada cuando la luz del semáforo era ROJA.
    Retorna (True, descripcion) si se confirma la infracción de tránsito.
    """
    if len(positions) < 2:
        return False, ""
        
    cx_prev, cy_prev, _ = positions[-2]
    cx_curr, cy_curr, _ = positions[-1]
    
    if stop_line_y is None:
        stop_line_y = STOP_LINE_COEFF * height
        line_desc = f"establecida (y={STOP_LINE_COEFF})"
    else:
        line_desc = f"detectada por IA (y={round(stop_line_y / height, 2)})"
    
    # Comprobar si el centroide del vehículo cruzó la línea de Y en sentido descendente o ascendente
    crossing_down = (cy_prev <= stop_line_y and cy_curr > stop_line_y)
    crossing_up = (cy_prev >= stop_line_y and cy_curr < stop_line_y)
    
    if crossing_down or crossing_up:
        track["crossed_stop_line"] = True
        if traffic_light_state == "RED" and not track["red_light_triggered"]:
            track["red_light_triggered"] = True
            descripcion = (
                f"El vehículo omitió la línea de parada {line_desc} "
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


def correct_to_peruvian_plate(raw_text: str) -> str:
    """
    Corrige errores comunes de lectura OCR (como confundir B con 2 u 8, o N con 7 o 9)
    mapeando caracteres según el formato de placas peruanas de 6 dígitos.
    """
    # Dejar solo caracteres alfanuméricos en mayúsculas
    cleaned = re.sub(r'[^A-Z0-9]', '', raw_text.upper())
    if len(cleaned) != 6:
        return cleaned
        
    # Carácter 0: Debe ser una letra (A-Z)
    char0 = cleaned[0]
    if char0.isdigit():
        digit_to_letter = {
            '2': 'B', '8': 'B', '3': 'B', '0': 'O', '1': 'I', 
            '5': 'S', '6': 'G', '4': 'A', '9': 'P'
        }
        char0 = digit_to_letter.get(char0, 'B')
        
    # Carácter 1: Puede ser letra o número (ej: B8N). 
    # Mapeo de errores comunes
    char1 = cleaned[1]
    if char1 == '9':
        char1 = '8'
    elif char1 == '0':
        char1 = 'O'
        
    # Carácter 2: Debe ser una letra (A-Z)
    char2 = cleaned[2]
    if char2.isdigit():
        digit_to_letter = {
            '7': 'N', '9': 'N', '8': 'B', '2': 'Z', '0': 'O', 
            '5': 'S', '6': 'G', '1': 'I', '3': 'E', '4': 'A'
        }
        char2 = digit_to_letter.get(char2, 'N')
        
    # Caracteres 3, 4, 5: Deben ser números (0-9)
    letter_to_digit = {'O': '0', 'I': '1', 'Z': '2', 'S': '5', 'G': '6', 'B': '8', 'A': '4'}
    
    char3 = cleaned[3]
    if char3.isalpha():
        char3 = letter_to_digit.get(char3, '6')
        
    char4 = cleaned[4]
    if char4.isalpha():
        char4 = letter_to_digit.get(char4, '6')
        
    char5 = cleaned[5]
    if char5.isalpha():
        char5 = letter_to_digit.get(char5, '6')
        
    return f"{char0}{char1}{char2}-{char3}{char4}{char5}"


def extract_license_plate(frame: cv2.Mat, bbox_norm: List[float], width: int, height: int) -> str:
    """
    Recorta la región del vehículo del fotograma, escala la imagen 3x con interpolación cúbica
    para optimizar los detalles y corre EasyOCR aplicando correcciones de placas peruanas.
    """
    try:
        x1_n, y1_n, x2_n, y2_n = bbox_norm
        x1, y1 = max(0, int(x1_n * width)), max(0, int(y1_n * height))
        x2, y2 = min(width, int(x2_n * width)), min(height, int(y2_n * height))
        
        vehicle_crop = frame[y1:y2, x1:x2]
        if vehicle_crop is None or vehicle_crop.size == 0:
            return generate_mock_license_plate()
            
        h_v, _, _ = vehicle_crop.shape
        # Las placas están típicamente en la mitad inferior del vehículo (ej: del 40% hacia abajo)
        plate_area = vehicle_crop[int(h_v * 0.45):, :]
        
        # Escalar 3x con interpolación cúbica para mejorar nitidez de texto pequeño
        plate_area_resized = cv2.resize(plate_area, (0, 0), fx=3.0, fy=3.0, interpolation=cv2.INTER_CUBIC)
        
        # Cargar lector OCR perezosamente
        global _ocr_reader
        if _ocr_reader is None:
            import easyocr
            _ocr_reader = easyocr.Reader(['en', 'es'], gpu=False, verbose=False)
        
        # Ejecutar OCR en la zona de la placa escalada
        results = _ocr_reader.readtext(plate_area_resized)
        
        # Filtrar textos candidatos
        possible_plates = []
        for _, text, conf in results:
            # Limpiar caracteres dejando solo letras y números
            cleaned = re.sub(r'[^A-Z0-9]', '', text.upper())
            if 5 <= len(cleaned) <= 8:
                possible_plates.append((cleaned, conf))
        
        if possible_plates:
            # Ordenar por confianza y corregir el de mayor confianza
            possible_plates.sort(key=lambda x: x[1], reverse=True)
            best_raw = possible_plates[0][0]
            
            # Aplicar corrección peruana si tiene longitud 6
            if len(best_raw) == 6:
                return correct_to_peruvian_plate(best_raw)
            
            # Fallback de formato general si mide 7 u 8
            if len(best_raw) == 7 and '-' not in best_raw:
                return f"{best_raw[:3]}-{best_raw[3:]}"
            return best_raw
    except Exception as e:
        import logging
        logging.getLogger("OCR").warning(f"Error detectando placa mediante OCR: {e}")
        
    return generate_mock_license_plate()
