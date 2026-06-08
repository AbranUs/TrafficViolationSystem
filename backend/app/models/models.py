import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.db import Base

# =====================================================================
# 1. MODELOS DE SQLALCHEMY (ORM para persistencia relacional)
# =====================================================================

class Video(Base):
    """
    Modelo ORM que mapea la tabla física de Videos cargados en el sistema.
    """
    __tablename__ = "videos"

    id = Column(String(36), primary_key=True, index=True)
    nombre_archivo = Column(String(255), nullable=False)
    fecha_subida = Column(DateTime(timezone=True), server_default=func.now())
    
    # Columnas complementarias para el flujo de estado y analíticas de la API
    status = Column(String(50), default="procesando", nullable=False)
    error_message = Column(String(1000), nullable=True)
    tiempo_procesamiento_segundos = Column(Float, nullable=True)

    # Relación uno-a-muchos con las infracciones detectadas
    infracciones = relationship("Infraccion", back_populates="video", cascade="all, delete-orphan")


class Infraccion(Base):
    """
    Modelo ORM que mapea la tabla física de Infracciones de tránsito detectadas.
    """
    __tablename__ = "infracciones"

    id = Column(String(50), primary_key=True, index=True)
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String(100), nullable=False)
    frame_path = Column(String(512), nullable=False)
    timestamp = Column(Float, nullable=False)  # Marca de tiempo en segundos dentro del video

    # Columnas complementarias para el detalle geométrico e identificaciones del incidente
    descripcion = Column(String(500), nullable=False)
    placa_vehiculo = Column(String(20), nullable=True)
    confianza = Column(Float, nullable=False)
    caja_delimitadora = Column(JSON, nullable=False)

    # Relación inversa con el video contenedor
    video = relationship("Video", back_populates="infracciones")


# =====================================================================
# 2. MODELOS DE PYDANTIC (Esquemas de serialización y respuesta HTTP)
# =====================================================================

class BoundingBoxSchema(BaseModel):
    """Representa la caja delimitadora normalizada (0.0 a 1.0) generada por la IA."""
    x_min: float = Field(..., description="Coordenada X inicial normalizada de la caja (0.0 a 1.0)")
    y_min: float = Field(..., description="Coordenada Y inicial normalizada de la caja (0.0 a 1.0)")
    x_max: float = Field(..., description="Coordenada X final normalizada de la caja (0.0 a 1.0)")
    y_max: float = Field(..., description="Coordenada Y final normalizada de la caja (0.0 a 1.0)")

    class Config:
        from_attributes = True


class InfraccionSchema(BaseModel):
    """Representa el detalle de una infracción de tránsito detectada."""
    id: str = Field(..., description="Identificador único de la infracción")
    video_id: str = Field(..., description="ID del video al que pertenece la infracción")
    tipo: str = Field(..., description="Nombre descriptivo de la infracción")
    frame_path: str = Field(..., description="Ruta física del fotograma guardado en disco (.jpg)")
    timestamp: float = Field(..., description="Segundo exacto del video donde ocurre la infracción")
    descripcion: str = Field(..., description="Descripción detallada de la violación de tránsito")
    placa_vehiculo: Optional[str] = Field(None, description="Matrícula del vehículo infractor detectado por OCR")
    confianza: float = Field(..., description="Nivel de confianza de la detección de IA (0.0 a 1.0)")
    caja_delimitadora: BoundingBoxSchema = Field(..., description="Caja delimitadora que enmarca al infractor")

    class Config:
        from_attributes = True


class VideoUploadResponse(BaseModel):
    """Esquema de respuesta HTTP al subir exitosamente un video."""
    video_id: str = Field(..., description="Identificador único global del video subido")
    filename: str = Field(..., description="Nombre original del archivo subido")
    status: str = Field(..., description="Estado inicial del procesamiento ('procesando')")
    message: str = Field(..., description="Mensaje informativo para el cliente")


class VideoStatusResponse(BaseModel):
    """Esquema de respuesta HTTP al consultar el estado de procesamiento del video."""
    video_id: str = Field(..., description="Identificador único global del video")
    nombre_archivo: str = Field(..., description="Nombre original del archivo de video")
    fecha_subida: Optional[datetime.datetime] = Field(None, description="Fecha y hora en que se cargó el video")
    status: str = Field(..., description="Estado del análisis ('procesando', 'completado', 'fallido')")
    infracciones: List[InfraccionSchema] = Field(default=[], description="Lista de infracciones de tránsito detectadas")
    error_message: Optional[str] = Field(None, description="Mensaje explicativo en caso de que ocurra un error")
    tiempo_procesamiento_segundos: Optional[float] = Field(None, description="Tiempo que le tomó a la IA procesar el video")

    class Config:
        from_attributes = True


# =====================================================================
# 3. MODELOS DE AUTENTICACIÓN Y ANALÍTICAS
# =====================================================================

class User(Base):
    """
    Modelo ORM que mapea la tabla física de Usuarios en el sistema para control de acceso.
    """
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())


class UserLoginSchema(BaseModel):
    """Esquema para recibir las credenciales de inicio de sesión."""
    username: str = Field(..., description="Nombre de usuario del administrador")
    password: str = Field(..., description="Contraseña en texto plano")


class TokenSchema(BaseModel):
    """Esquema de respuesta con el token de sesión generado."""
    access_token: str = Field(..., description="JWT Token de sesión")
    token_type: str = Field("bearer", description="Tipo de token")
    username: str = Field(..., description="Nombre del usuario autenticado")


class ViolationDistributionItem(BaseModel):
    """Representa el conteo cuantitativo para un tipo específico de infracción."""
    tipo: str = Field(..., description="Tipo de infracción")
    count: int = Field(..., description="Número total detectado")


class HistoryTrendItem(BaseModel):
    """Representa la cantidad de infracciones detectadas agrupadas cronológicamente."""
    fecha: str = Field(..., description="Fecha agrupada (e.g. YYYY-MM-DD o HH:MM)")
    count: int = Field(..., description="Número de infracciones en ese período")


class AnalyticsStatsResponse(BaseModel):
    """Esquema consolidado con todas las métricas agregadas del dashboard de analíticas."""
    total_videos: int = Field(..., description="Cantidad total de videos subidos al sistema")
    total_infracciones: int = Field(..., description="Suma total de infracciones detectadas por la IA")
    promedio_confianza: float = Field(..., description="Promedio general de certeza de la IA en detecciones (0.0 a 1.0)")
    distribucion_infracciones: List[ViolationDistributionItem] = Field(..., description="Agrupación de multas por tipología")
    tendencia_historial: List[HistoryTrendItem] = Field(..., description="Historial cronológico de multas")
    ultimas_infracciones: List[InfraccionSchema] = Field(..., description="Historial de las últimas infracciones registradas")

    class Config:
        from_attributes = True

