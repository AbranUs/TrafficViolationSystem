import logging
from collections import Counter, defaultdict
from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import get_db
from app.models.models import (
    Video, Infraction, AnalyticsStatsResponse,
    AIModel, Camera, Location, Officer, OfficerAssignment, AuditLog,
    OperationalizationResponse, OperationalizationIndicator
)


logger = logging.getLogger("AnalyticsRoutes")
router = APIRouter()

VISION_INFERENCE_DIMENSION = "Visión Artificial e Inferencia de Tránsito"

@router.get("/stats", response_model=AnalyticsStatsResponse, responses={500: {"description": "Internal Server Error"}})
async def get_analytics_stats(db: Annotated[Session, Depends(get_db)]) -> dict:
    """
    Realiza agregaciones SQL y formateo Python de base de datos agnóstica para
    recuperar métricas del panel de analíticas viales (totales, distribución y tendencia).
    """
    logger.info("Petición de analíticas recibida para compilar el panel administrativo.")
    
    try:
        # 1. Obtener totalizadores básicos
        total_videos = db.query(Video).count()
        total_infractions = db.query(Infraction).count()
        
        # Promedio de confianza de IA (default a 0.0 si no hay infracciones)
        avg_conf = db.query(func.avg(Infraction.confianza)).scalar()
        promedio_confianza = round(float(avg_conf), 2) if avg_conf is not None else 0.0

        # 2. Distribución cuantitativa por tipo de infracción (Cruce rojo, Giro U, etc.)
        dist_query = db.query(Infraction.tipo, func.count(Infraction.id)).group_by(Infraction.tipo).all()
        infraction_distribution = [
            {"tipo": row[0], "count": row[1]} for row in dist_query
        ]

        # 3. Historial cronológico de multas (Tendencia de los últimos días)
        # Hacemos un JOIN con Video para obtener la fecha real de subida y agrupar en Python
        # para garantizar compatibilidad multiplataforma completa (SQLite/PostgreSQL)
        trend_data = db.query(Video.fecha_subida).join(Infraction).all()
        
        date_counter = Counter()
        for row in trend_data:
            dt = row[0]
            if dt:
                # Formatear la fecha en formato YYYY-MM-DD
                date_str = dt.strftime("%Y-%m-%d")
                date_counter[date_str] += 1
                
        # Convertir a lista de diccionarios ordenada cronológicamente
        tendencia_historial = [
            {"fecha": date, "count": count} for date, count in sorted(date_counter.items())
        ]
        
        # Si la lista está vacía, rellenar con la fecha de hoy para no mostrar vacíos los gráficos
        if not tendencia_historial:
            import datetime
            today = datetime.date.today().strftime("%Y-%m-%d")
            tendencia_historial = [{"fecha": today, "count": 0}]

        # 4. Obtener las últimas 5 infracciones registradas para el mini-log
        # Buscamos de forma descendente en las infracciones
        recent_infractions = db.query(Infraction).order_by(Infraction.timestamp.desc()).limit(5).all()

        return {
            "total_videos": total_videos,
            "total_infractions": total_infractions,
            "promedio_confianza": promedio_confianza,
            "infraction_distribution": infraction_distribution,
            "tendencia_historial": tendencia_historial,
            "recent_infractions": recent_infractions
        }
    except Exception as e:
        logger.error(f"[DB/Analytics] Error al recopilar estadísticas de analíticas: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor al calcular estadísticas del sistema."
        )


@router.get("/operationalization", response_model=OperationalizationResponse, responses={500: {"description": "Internal Server Error"}})
async def get_operationalization_metrics(db: Annotated[Session, Depends(get_db)]) -> dict:
    """
    Calcula y compila los indicadores de operacionalización de la variable independiente
    en tiempo real desde la base de datos SQL relacional.
    """
    logger.info("Petición recibida para compilar la matriz de operacionalización.")
    try:
        # 1. Visión Artificial e Inferencia
        avg_model_acc = db.query(func.avg(AIModel.accuracy_score)).scalar()
        accuracy_score_val = round(float(avg_model_acc) * 100, 2) if avg_model_acc is not None else 0.0
        
        avg_inf_conf = db.query(func.avg(Infraction.confianza)).scalar()
        confidence_val = round(float(avg_inf_conf) * 100, 2) if avg_inf_conf is not None else 0.0
        
        total_infractions = db.query(Infraction).count()
        infractions_with_plate = db.query(Infraction).filter(Infraction.placa_vehiculo != None, Infraction.placa_vehiculo != '').count()
        ocr_success_rate = round((infractions_with_plate / total_infractions * 100), 2) if total_infractions > 0 else 0.0
        
        # 2. Desempeño y Rendimiento
        total_videos = db.query(Video).count()
        completed_videos = db.query(Video).filter(Video.status == 'completado').count()
        video_success_rate = round((completed_videos / total_videos * 100), 2) if total_videos > 0 else 0.0
        
        avg_proc_time = db.query(func.avg(Video.tiempo_procesamiento_segundos)).scalar()
        avg_proc_time_val = round(float(avg_proc_time), 2) if avg_proc_time is not None else 0.0
        
        # 3. Equipamiento y Cobertura
        total_cameras = db.query(Camera).count()
        online_cameras = db.query(Camera).filter(Camera.status == 'online').count()
        camera_operability_rate = round((online_cameras / total_cameras * 100), 2) if total_cameras > 0 else 0.0
        
        unique_locations_online = db.query(func.count(func.distinct(Camera.location_id))).filter(Camera.status == 'online').scalar() or 0
        total_locations = db.query(Location).count()
        location_coverage_rate = round((unique_locations_online / total_locations * 100), 2) if total_locations > 0 else 0.0
        
        # 4. Gestión de Control y Auditoría
        total_officers = db.query(Officer).count()
        active_assignments = db.query(func.count(func.distinct(OfficerAssignment.badge_number))).scalar() or 0
        officer_active_rate = round((active_assignments / total_officers * 100), 2) if total_officers > 0 else 0.0
        
        total_logs = db.query(AuditLog).count()
        
        # Estructurar respuesta de indicadores
        indicadores = [
            {
                "id": "ind_precision_modelo",
                "nombre": "Tasa de Precisión de Modelos IA",
                "formula": "Promedio(AIModel.accuracy_score) * 100",
                "dimension": VISION_INFERENCE_DIMENSION,
                "valor": accuracy_score_val,
                "detalle": "Precisión promedio del catálogo de modelos IA en servicio",
                "instrumento": "Ficha de evaluación del modelo de IA"
            },
            {
                "id": "ind_confianza_infracciones",
                "nombre": "Nivel de Confianza Promedio",
                "formula": "Promedio(Infraction.confianza) * 100",
                "dimension": VISION_INFERENCE_DIMENSION,
                "valor": confidence_val,
                "detalle": "Confianza promedio obtenida en detecciones automáticas",
                "instrumento": "Registro de auditoría del servicio de IA"
            },
            {
                "id": "ind_ocr_placas",
                "nombre": "Tasa de Eficacia de Detección de Placas (OCR)",
                "formula": "(Infracciones con Placa Registrada / Total Infracciones) * 100",
                "dimension": VISION_INFERENCE_DIMENSION,
                "valor": ocr_success_rate,
                "detalle": f"{infractions_with_plate} de {total_infractions} infracciones con matrícula identificada",
                "instrumento": "Ficha técnica de validación de OCR"
            },
            {
                "id": "ind_exito_procesamiento",
                "nombre": "Tasa de Éxito en Procesamiento de Videos",
                "formula": "(Videos Completados / Total de Videos) * 100",
                "dimension": "Desempeño y Rendimiento Técnico",
                "valor": video_success_rate,
                "detalle": f"{completed_videos} de {total_videos} videos procesados correctamente",
                "instrumento": "Log de tareas de segundo plano de FastAPI"
            },
            {
                "id": "ind_velocidad_inferencia",
                "nombre": "Velocidad Promedio de Inferencia por Video",
                "formula": "Promedio(Video.tiempo_procesamiento_segundos)",
                "dimension": "Desempeño y Rendimiento Técnico",
                "valor": avg_proc_time_val,
                "detalle": f"{avg_proc_time_val} segundos promedio por análisis de video",
                "instrumento": "Temporizador de procesamiento OpenCV"
            },
            {
                "id": "ind_operatividad_camaras",
                "nombre": "Tasa de Operatividad de Cámaras de Monitoreo",
                "formula": "(Cámaras Online / Total de Cámaras) * 100",
                "dimension": "Equipamiento y Cobertura de Infraestructura Vial",
                "valor": camera_operability_rate,
                "detalle": f"{online_cameras} de {total_cameras} cámaras en línea",
                "instrumento": "Registro de control de red vial"
            },
            {
                "id": "ind_cobertura_geografica",
                "nombre": "Índice de Cobertura Geográfica de Monitoreo",
                "formula": "(Intersecciones Cubiertas con Cámara Activa / Total Intersecciones) * 100",
                "dimension": "Equipamiento y Cobertura de Infraestructura Vial",
                "valor": location_coverage_rate,
                "detalle": f"{unique_locations_online} de {total_locations} intersecciones viales vigiladas",
                "instrumento": "Base de geolocalización de intersecciones"
            },
            {
                "id": "ind_personal_vial",
                "nombre": "Tasa de Personal de Guardia Activo",
                "formula": "(Agentes Asignados a Turnos Activos / Total Agentes) * 100",
                "dimension": "Gestión de Control y Auditoría Operativa",
                "valor": officer_active_rate,
                "detalle": f"{active_assignments} de {total_officers} agentes viales con turnos asignados",
                "instrumento": "Sistema de asignación de guardia y personal"
            },
            {
                "id": "ind_auditoria_sistema",
                "nombre": "Volumen de Auditoría de Operaciones",
                "formula": "Total de Logs de Auditoría Registrados",
                "dimension": "Gestión de Control y Auditoría Operativa",
                "valor": float(total_logs),
                "detalle": f"{total_logs} transacciones registradas en la bitácora de auditoría",
                "instrumento": "Bitácora de transacciones del sistema"
            }
        ]
        
        return {"indicadores": indicadores}
        
    except Exception:
        logger.exception("[DB/Operationalization] Error al calcular indicadores de la variable independiente:")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor al calcular indicadores de operacionalización."
        )
