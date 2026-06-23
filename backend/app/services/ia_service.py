import os
import time
import logging
from typing import Dict, Any, List
import cv2
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.models import Video, Infraction
from app.services.tracker import CentroidTracker
from app.services.visualizer import save_highlighted_frame
from app.services.yolo_predictor import predict_frame
from app.services.rules import (
    check_red_light_violation,
    check_uturn_violation,
    check_parking_violation,
    generate_mock_license_plate,
    extract_license_plate
)

# Configuración básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IAService")


def _init_video_record(db: Session, video_path: str, video_id: str) -> str:
    """Inicializa o recupera el registro de Video en la base de datos relacional."""
    original_filename = os.path.basename(video_path)
    try:
        video_record = db.query(Video).filter(Video.id == video_id).first()
        if not video_record:
            video_record = Video(
                id=video_id, 
                nombre_archivo=original_filename, 
                ruta_archivo=video_path,
                status="procesando"
            )
            db.add(video_record)
            db.commit()
            db.refresh(video_record)
        else:
            video_record.ruta_archivo = video_path
            db.commit()
            original_filename = video_record.nombre_archivo
    except Exception:
        logger.exception("[DB] Error inicializando registro de Video en base de datos:")
        db.rollback()
    return original_filename


def _update_video_status(
    db: Session, 
    video_id: str, 
    status: str, 
    error_message: str = None, 
    processing_time: float = None
) -> None:
    """Actualiza de forma centralizada el estado del procesamiento del video en SQL."""
    try:
        video_record = db.query(Video).filter(Video.id == video_id).first()
        if video_record:
            video_record.status = status
            if error_message is not None:
                video_record.error_message = error_message
            if processing_time is not None:
                video_record.tiempo_procesamiento_segundos = processing_time
            db.commit()
            logger.info(f"[DB] Estado del video '{video_id}' actualizado a '{status}' con éxito.")
    except Exception:
        logger.exception(f"[DB] Error actualizando estado '{status}' en base de datos:")
        db.rollback()


def _update_traffic_light_state(state_tracker: Dict[str, Any]) -> None:
    """Cicla el temporizador e identifica el estado semafórico simulado de la intersección."""
    state_tracker["traffic_light_timer"] += 1
    timer = state_tracker["traffic_light_timer"]
    if timer <= 45:
        state_tracker["traffic_light_state"] = "GREEN"
    elif timer <= 60:
        state_tracker["traffic_light_state"] = "YELLOW"
    elif timer <= 120:
        state_tracker["traffic_light_state"] = "RED"
    else:
        state_tracker["traffic_light_timer"] = 0
        state_tracker["traffic_light_state"] = "GREEN"


def _evaluate_custom_rules(
    db: Session,
    current_detections: List[Dict[str, Any]],
    video_id: str,
    timestamp_sec: float,
    frame_idx: int,
    frame: cv2.Mat,
    frames_dir: str,
    width: int,
    height: int
) -> None:
    """Evalúa detecciones del modelo custom entrenado y las almacena como infracciones directas."""
    for det in current_detections:
        clase_name = det["class_name"]
        confianza = det["confidence"]
        
        hay_infraccion = False
        tipo_infraccion = None
        tipo_display = ""
        
        if clase_name == 'infraccion_rojo' and confianza > 0.45:
            hay_infraccion = True
            tipo_infraccion = 'semaforo_rojo'
            tipo_display = "Cruce de semáforo en rojo"
        elif clase_name == 'infraccion_paso' and confianza > 0.45:
            hay_infraccion = True
            tipo_infraccion = 'estacionamiento_prohibido'
            tipo_display = "Invasión de paso peatonal"
        elif clase_name == 'infraccion_giro' and confianza > 0.45:
            hay_infraccion = True
            tipo_infraccion = 'giro_u_prohibido'
            tipo_display = "Giro prohibido"
            
        if hay_infraccion:
            infraccion_id = f"inf_{video_id[:8]}_{tipo_infraccion}_custom_{frame_idx}"
            frame_filename = f"{infraccion_id}.jpg"
            frame_path = os.path.join(frames_dir, frame_filename)
            
            label = f"{tipo_display.upper()} - IA"
            v_bbox = det["bbox"]
            save_highlighted_frame(frame, v_bbox, label, frame_path, width, height)
            
            placa = extract_license_plate(frame, v_bbox, width, height)
            conf = round(confianza, 2)
            
            x1_n, y1_n, x2_n, y2_n = v_bbox
            bbox_dict = {
                "x_min": round(x1_n, 2),
                "y_min": round(y1_n, 2),
                "x_max": round(x2_n, 2),
                "y_max": round(y2_n, 2)
            }
            
            db_infraction = Infraction(
                id=infraccion_id,
                video_id=video_id,
                tipo=tipo_display,
                frame_path=frame_path,
                timestamp=timestamp_sec,
                descripcion=f"Detección directa del modelo YOLOv8 para {tipo_display.lower()}.",
                placa_vehiculo=placa,
                confianza=conf,
                caja_delimitadora=bbox_dict
            )
            db.add(db_infraction)
            logger.info(f"[Infracción Custom] {tipo_display} guardada en frame {frame_idx}")


def _process_red_light_violation(
    db: Session,
    det: Dict[str, Any],
    state_tracker: Dict[str, Any],
    video_id: str,
    timestamp_sec: float,
    frame_idx: int,
    frame: cv2.Mat,
    frames_dir: str,
    width: int,
    height: int,
    bbox_dict: Dict[str, Any]
) -> None:
    """Procesa la regla de infracción por cruce de semáforo en rojo."""
    track_id = det["track_id"]
    track = state_tracker["vehicles"][track_id]
    positions = track["positions"]
    
    detected_stop_line_y = state_tracker.get("detected_stop_line_y")
    is_red_light, desc_red_light = check_red_light_violation(
        positions, height, state_tracker["traffic_light_state"], track, stop_line_y=detected_stop_line_y
    )
    if is_red_light:
        infraccion_id = f"inf_{video_id[:8]}_sem_red_{track_id}"
        frame_path = os.path.join(frames_dir, f"{infraccion_id}.jpg")
        
        # Buscar si el semáforo rojo fue detectado en este cuadro o recientemente
        extra_objects = []
        tl_bboxes = state_tracker.get("current_traffic_light_red_bboxes", [])
        if not tl_bboxes and state_tracker.get("last_traffic_light_red_bbox"):
            tl_bboxes = [state_tracker["last_traffic_light_red_bbox"]]
            
        for tl_bbox in tl_bboxes:
            extra_objects.append((tl_bbox, "SEMAFORO EN ROJO", (50, 50, 255)))
            
        save_highlighted_frame(
            frame, det["bbox"], f"ROJO - VEH {track_id}", 
            frame_path, width, height, extra_objects=extra_objects
        )
        
        db_infraction = Infraction(
            id=infraccion_id,
            video_id=video_id,
            tipo="Cruce de semáforo en rojo",
            frame_path=frame_path,
            timestamp=timestamp_sec,
            descripcion=desc_red_light,
            placa_vehiculo=extract_license_plate(frame, det["bbox"], width, height),
            confianza=round(det["confidence"], 2),
            caja_delimitadora=bbox_dict
        )
        db.add(db_infraction)
        logger.info(f"[Infracción] Semáforo en rojo de VEH {track_id} guardado en frame {frame_idx}")


def _process_uturn_violation(
    db: Session,
    det: Dict[str, Any],
    state_tracker: Dict[str, Any],
    video_id: str,
    timestamp_sec: float,
    frame_idx: int,
    frame: cv2.Mat,
    frames_dir: str,
    width: int,
    height: int,
    bbox_dict: Dict[str, Any]
) -> None:
    """Procesa la regla de infracción por giro prohibido en U."""
    track_id = det["track_id"]
    track = state_tracker["vehicles"][track_id]
    positions = track["positions"]
    
    is_uturn, desc_uturn = check_uturn_violation(positions, height, track)
    if is_uturn:
        infraccion_id = f"inf_{video_id[:8]}_uturn_{track_id}"
        frame_path = os.path.join(frames_dir, f"{infraccion_id}.jpg")
        save_highlighted_frame(frame, det["bbox"], f"GIRO U - VEH {track_id}", frame_path, width, height)
        
        db_infraction = Infraction(
            id=infraccion_id,
            video_id=video_id,
            tipo="Giro prohibido",
            frame_path=frame_path,
            timestamp=timestamp_sec,
            descripcion=desc_uturn,
            placa_vehiculo=extract_license_plate(frame, det["bbox"], width, height),
            confianza=round(det["confidence"] - 0.05, 2),
            caja_delimitadora=bbox_dict
        )
        db.add(db_infraction)
        logger.info(f"[Infracción] Giro en U de VEH {track_id} guardado en frame {frame_idx}")


def _process_parking_violation(
    db: Session,
    det: Dict[str, Any],
    state_tracker: Dict[str, Any],
    video_id: str,
    timestamp_sec: float,
    frame_idx: int,
    frame: cv2.Mat,
    frames_dir: str,
    width: int,
    height: int,
    bbox_dict: Dict[str, Any]
) -> None:
    """Procesa la regla de infracción por estacionamiento prohibido."""
    track_id = det["track_id"]
    track = state_tracker["vehicles"][track_id]
    positions = track["positions"]
    
    is_parking, desc_parking = check_parking_violation(det, positions, width, height, track)
    if is_parking:
        infraccion_id = f"inf_{video_id[:8]}_parking_{track_id}"
        frame_path = os.path.join(frames_dir, f"{infraccion_id}.jpg")
        save_highlighted_frame(frame, det["bbox"], f"PARQUEO - VEH {track_id}", frame_path, width, height)
        
        db_infraction = Infraction(
            id=infraccion_id,
            video_id=video_id,
            tipo="Invasión de paso peatonal",
            frame_path=frame_path,
            timestamp=timestamp_sec,
            descripcion=desc_parking,
            placa_vehiculo=extract_license_plate(frame, det["bbox"], width, height),
            confianza=round(det["confidence"], 2),
            caja_delimitadora=bbox_dict
        )
        db.add(db_infraction)
        logger.info(f"[Infracción] Estacionamiento de VEH {track_id} guardado en frame {frame_idx}")


def _evaluate_traditional_rules(
    db: Session,
    vehicle_detections: List[Dict[str, Any]],
    state_tracker: Dict[str, Any],
    video_id: str,
    timestamp_sec: float,
    frame_idx: int,
    frame: cv2.Mat,
    frames_dir: str,
    width: int,
    height: int
) -> None:
    """Evalúa las reglas heurísticas de geometría tradicionales de tránsito."""
    for det in vehicle_detections:
        track_id = det.get("track_id")
        if not track_id:
            continue
            
        x1_n, y1_n, x2_n, y2_n = det["bbox"]
        bbox_dict = {
            "x_min": round(x1_n, 2),
            "y_min": round(y1_n, 2),
            "x_max": round(x2_n, 2),
            "y_max": round(y2_n, 2)
        }

        # Evaluar cada regla con su función helper
        _process_red_light_violation(db, det, state_tracker, video_id, timestamp_sec, frame_idx, frame, frames_dir, width, height, bbox_dict)
        _process_uturn_violation(db, det, state_tracker, video_id, timestamp_sec, frame_idx, frame, frames_dir, width, height, bbox_dict)
        _process_parking_violation(db, det, state_tracker, video_id, timestamp_sec, frame_idx, frame, frames_dir, width, height, bbox_dict)


def _update_traffic_state_from_detections(state_tracker: Dict[str, Any], current_detections: List[Dict[str, Any]], height: int) -> None:
    """Actualiza dinámicamente el estado del semáforo si el modelo detecta luces reales o línea de parada."""
    for det in current_detections:
        c_name = det["class_name"]
        if c_name in ["traffic_light_red", "traffic_light_green", "traffic_light_yellow"]:
            state_tracker["has_real_traffic_light"] = True
            if c_name == "traffic_light_red":
                state_tracker["traffic_light_state"] = "RED"
            elif c_name == "traffic_light_green":
                state_tracker["traffic_light_state"] = "GREEN"
            elif c_name == "traffic_light_yellow":
                state_tracker["traffic_light_state"] = "YELLOW"
        elif c_name == "stop_line":
            # Coordenada Y de la línea de parada detectada por el modelo custom
            y_min_n = det["bbox"][1]
            y_max_n = det["bbox"][3]
            state_tracker["detected_stop_line_y"] = ((y_min_n + y_max_n) / 2) * height


def _process_video_frame(
    frame: cv2.Mat,
    frame_idx: int,
    state_tracker: Dict[str, Any],
    centroid_tracker: CentroidTracker,
    frame_skip: int,
    width: int,
    height: int,
    fps: float,
    db: Session,
    video_id: str,
    frames_dir: str
) -> bool:
    """Procesa un fotograma individual aplicando inferencia YOLO y evaluando reglas de tránsito."""
    # Solo actualizar con el temporizador simulado si no hay luces reales detectadas
    if not state_tracker.get("has_real_traffic_light", False):
        _update_traffic_light_state(state_tracker)
    
    if frame_idx % frame_skip != 0:
        return False
        
    current_detections = predict_frame(frame, frame_idx, state_tracker, width, height)
    
    # Actualización dinámica del estado del semáforo si el modelo detecta luces reales o línea de parada
    _update_traffic_state_from_detections(state_tracker, current_detections, height)
    
    # Filtrar solo vehículos para el tracker
    vehicle_detections = [
        d for d in current_detections 
        if d["class_name"] in ["vehicle", "car", "motorcycle", "bus", "truck"]
    ]
    centroid_tracker.update(state_tracker["vehicles"], vehicle_detections, frame_idx)
    
    # Verificar si existen clasificaciones directas de infracción en las detecciones
    has_direct_infractions = any(
        d["class_name"] in ["infraccion_rojo", "infraccion_paso", "infraccion_giro"]
        for d in current_detections
    )
    
    timestamp_sec = round(frame_idx / fps, 2)
    
    if has_direct_infractions:
        _evaluate_custom_rules(
            db, current_detections, video_id, timestamp_sec, 
            frame_idx, frame, frames_dir, width, height
        )
    
    # Siempre evaluar las reglas de tránsito geométricas tradicionales sobre los vehículos detectados
    _evaluate_traditional_rules(
        db, vehicle_detections, state_tracker, video_id, 
        timestamp_sec, frame_idx, frame, frames_dir, width, height
    )
    return True


def process_video(video_path: str, video_id: str) -> None:
    """
    Función principal del servicio. Extrae fotogramas mediante OpenCV,
    delega la predicción y persiste infracciones detectadas en SQL.
    """
    logger.info(f"[VideoProcessor] Iniciando procesamiento del video: {video_path}")
    db = SessionLocal()
    
    try:
        original_filename = _init_video_record(db, video_path, video_id)
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"No se pudo abrir el archivo de video en: {video_path}")
            _update_video_status(
                db, 
                video_id, 
                "fallido", 
                "No se pudo abrir el archivo de video con el motor de OpenCV."
            )
            db.close()
            return
 
        # Extracción de metadatos del video
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.info(f"[VideoProcessor] Metadatos -> FPS: {fps}, Resolución: {width}x{height}, Total Frames: {total_frames}")
 
        # Asegurar directorio de fotogramas de evidencia
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        frames_dir = os.path.join(base_dir, "uploads", "frames")
        os.makedirs(frames_dir, exist_ok=True)
 
        state_tracker = {
            "vehicles": {},
            "traffic_light_state": "GREEN",
            "traffic_light_timer": 0,
            "filename": original_filename
        }
        
        centroid_tracker = CentroidTracker()
        frame_idx = 0
        start_time = time.time()
        
        # Factor de salto de fotogramas (por defecto 2 localmente para mayor precisión, 10 en Render/bajos recursos)
        default_skip = 10 if os.getenv("DISABLE_YOLO", "false").lower() == "true" else 2
        frame_skip = int(os.getenv("FRAME_SKIP", str(default_skip)))
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            _process_video_frame(
                frame, frame_idx, state_tracker, centroid_tracker,
                frame_skip, width, height, fps, db, video_id, frames_dir
            )
            frame_idx += 1
            
        cap.release()
        processing_time = round(time.time() - start_time, 2)
        logger.info(f"[VideoProcessor] Video procesado. Fotogramas: {frame_idx}. Tiempo: {processing_time}s.")
        
        _update_video_status(db, video_id, "completado", processing_time=processing_time)
        
    except Exception as e:
        logger.exception("Error procesando el archivo de video %s:", video_id)
        if 'cap' in locals() and cap.isOpened():
            cap.release()
        _update_video_status(db, video_id, "fallido", error_message=str(e))
    finally:
        db.close()
