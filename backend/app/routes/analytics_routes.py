import logging
from collections import Counter, defaultdict
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import get_db
from app.models.models import Video, Infraction, AnalyticsStatsResponse

logger = logging.getLogger("AnalyticsRoutes")
router = APIRouter()

@router.get("/stats", response_model=AnalyticsStatsResponse)
async def get_analytics_stats(db: Session = Depends(get_db)) -> dict:
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
