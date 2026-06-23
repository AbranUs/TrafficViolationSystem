import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, func, Integer, Double, Date, Boolean, Table
from sqlalchemy.orm import relationship
from app.db import Base

# Constants for SQLAlchemy cascade and delete options to resolve SonarQube duplication issues
ONDELETE_SET_NULL = "SET NULL"
CASCADE_ALL_DELETE_ORPHAN = "all, delete-orphan"

# =====================================================================
# TABLAS DE ASOCIACIÓN Y RELACIÓN DE MUCHOS A MUCHOS
# =====================================================================

user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('role_id', String(36), ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
)


# =====================================================================
# 1. MODELOS DE SQLALCHEMY (ORM)
# =====================================================================

class Role(Base):
    __tablename__ = "roles"
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    roles = relationship("Role", secondary=user_roles)


class District(Base):
    __tablename__ = "districts"
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    locations = relationship("Location", back_populates="district")
    officers = relationship("Officer", back_populates="district")


class Location(Base):
    __tablename__ = "locations"
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    district_id = Column(String(36), ForeignKey("districts.id", ondelete=ONDELETE_SET_NULL), nullable=True)
    
    district = relationship("District", back_populates="locations")
    cameras = relationship("Camera", back_populates="location")


class Camera(Base):
    __tablename__ = "cameras"
    id = Column(String(36), primary_key=True, index=True)
    ip_address = Column(String(45), nullable=False)
    resolution = Column(String(50), nullable=False)
    status = Column(String(50), default="offline")
    manufacturer = Column(String(100), nullable=True)
    location_id = Column(String(36), ForeignKey("locations.id", ondelete=ONDELETE_SET_NULL), nullable=True)
    
    location = relationship("Location", back_populates="cameras")


class AIModel(Base):
    __tablename__ = "ai_models"
    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    trained_at = Column(DateTime, nullable=True)
    accuracy_score = Column(Float, nullable=True)
    videos = relationship("Video", back_populates="ai_model")


class Video(Base):
    __tablename__ = "videos"
    id = Column(String(36), primary_key=True, index=True)
    nombre_archivo = Column(String(255), nullable=False)
    ruta_archivo = Column(String(512), nullable=True)
    fecha_subida = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default="procesando", nullable=False)
    error_message = Column(String(1000), nullable=True)
    tiempo_procesamiento_segundos = Column(Float, nullable=True)
    ai_model_id = Column(String(36), ForeignKey("ai_models.id", ondelete=ONDELETE_SET_NULL), nullable=True)
    
    ai_model = relationship("AIModel", back_populates="videos")
    infractions = relationship("Infraction", back_populates="video", cascade=CASCADE_ALL_DELETE_ORPHAN)
    jobs = relationship("ProcessingJob", back_populates="video", cascade=CASCADE_ALL_DELETE_ORPHAN)


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"
    id = Column(String(36), primary_key=True, index=True)
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False)
    logs = Column(String(4000), nullable=True)
    
    video = relationship("Video", back_populates="jobs")


class ViolationType(Base):
    __tablename__ = "violation_types"
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    base_fine = Column(Float, nullable=False)
    point_deduction = Column(Integer, default=0)
    description = Column(String(500), nullable=True)


class Infraction(Base):
    __tablename__ = "infractions"
    id = Column(String(50), primary_key=True, index=True)
    video_id = Column(String(36), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String(100), nullable=False)
    frame_path = Column(String(512), nullable=False)
    timestamp = Column(Float, nullable=False)
    descripcion = Column(String(500), nullable=False)
    placa_vehiculo = Column(String(20), nullable=True)
    confianza = Column(Float, nullable=False)
    caja_delimitadora = Column(JSON, nullable=False)
    
    video = relationship("Video", back_populates="infractions")
    citations = relationship("Citation", back_populates="infraction", cascade=CASCADE_ALL_DELETE_ORPHAN)


class Vehicle(Base):
    __tablename__ = "vehicles"
    plate_number = Column(String(20), primary_key=True, index=True)
    brand = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    color = Column(String(50), nullable=True)
    vehicle_type = Column(String(50), nullable=True)
    registration_date = Column(Date, nullable=True)
    citations = relationship("Citation", back_populates="vehicle")


class VehicleOwner(Base):
    __tablename__ = "vehicle_owners"
    owner_id = Column(String(50), primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=True)
    email = Column(String(100), nullable=True)
    telephone = Column(String(50), nullable=True)
    citations = relationship("Citation", back_populates="owner")


class OwnerVehicle(Base):
    __tablename__ = "owners_vehicles"
    owner_id = Column(String(50), ForeignKey("vehicle_owners.owner_id", ondelete="CASCADE"), primary_key=True)
    plate_number = Column(String(20), ForeignKey("vehicles.plate_number", ondelete="CASCADE"), primary_key=True)
    purchase_date = Column(Date, nullable=True)
    is_active_owner = Column(Boolean, default=True)


class Citation(Base):
    __tablename__ = "citations"
    citation_id = Column(String(50), primary_key=True, index=True)
    infraction_id = Column(String(50), ForeignKey("infractions.id", ondelete="CASCADE"), nullable=False)
    owner_id = Column(String(50), ForeignKey("vehicle_owners.owner_id", ondelete="CASCADE"), nullable=False)
    plate_number = Column(String(20), ForeignKey("vehicles.plate_number", ondelete=ONDELETE_SET_NULL), nullable=True)
    issue_date = Column(DateTime(timezone=True), server_default=func.now())
    fine_amount = Column(Float, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(50), default="pendiente")
    
    infraction = relationship("Infraction", back_populates="citations")
    owner = relationship("VehicleOwner", back_populates="citations")
    vehicle = relationship("Vehicle", back_populates="citations")
    payments = relationship("Payment", back_populates="citation", cascade=CASCADE_ALL_DELETE_ORPHAN)
    appeals = relationship("CitationAppeal", back_populates="citation", cascade=CASCADE_ALL_DELETE_ORPHAN)


class Payment(Base):
    __tablename__ = "payments"
    payment_id = Column(String(50), primary_key=True, index=True)
    citation_id = Column(String(50), ForeignKey("citations.citation_id", ondelete="CASCADE"), nullable=False)
    amount_paid = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=True)
    transaction_number = Column(String(100), unique=True, nullable=True)
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
    
    citation = relationship("Citation", back_populates="payments")


class CitationAppeal(Base):
    __tablename__ = "citation_appeals"
    appeal_id = Column(String(50), primary_key=True, index=True)
    citation_id = Column(String(50), ForeignKey("citations.citation_id", ondelete="CASCADE"), nullable=False)
    appeal_date = Column(DateTime(timezone=True), server_default=func.now())
    reason = Column(String(1000), nullable=False)
    status = Column(String(50), default="en_proceso")
    resolution_date = Column(DateTime, nullable=True)
    resolution_notes = Column(String(1000), nullable=True)
    
    citation = relationship("Citation", back_populates="appeals")


class Officer(Base):
    __tablename__ = "officers"
    badge_number = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    rank = Column(String(100), nullable=True)
    district_id = Column(String(36), ForeignKey("districts.id", ondelete=ONDELETE_SET_NULL), nullable=True)
    
    district = relationship("District", back_populates="officers")
    assignments = relationship("OfficerAssignment", back_populates="officer")


class OfficerAssignment(Base):
    __tablename__ = "officer_assignments"
    assignment_id = Column(String(36), primary_key=True, index=True)
    badge_number = Column(String(50), ForeignKey("officers.badge_number", ondelete="CASCADE"), nullable=False)
    location_id = Column(String(36), ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    shift_start = Column(DateTime, nullable=True)
    shift_end = Column(DateTime, nullable=True)
    
    officer = relationship("Officer", back_populates="assignments")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    log_id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete=ONDELETE_SET_NULL), nullable=True)
    action = Column(String(100), nullable=False)
    table_name = Column(String(100), nullable=False)
    details = Column(String(2000), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


# =====================================================================
# 2. MODELOS DE PYDANTIC (ESQUEMAS DE SERIALIZACIÓN)
# =====================================================================

class BoundingBoxSchema(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float

    class Config:
        from_attributes = True


class InfractionSchema(BaseModel):
    id: str
    video_id: str
    tipo: str
    frame_path: str
    timestamp: float
    descripcion: str
    placa_vehiculo: Optional[str] = None
    confianza: float
    caja_delimitadora: BoundingBoxSchema

    class Config:
        from_attributes = True


class VideoUploadResponse(BaseModel):
    video_id: str
    filename: str
    status: str
    message: str


class VideoStatusResponse(BaseModel):
    video_id: str
    nombre_archivo: str
    fecha_subida: Optional[datetime.datetime] = None
    status: str
    infractions: List[InfractionSchema] = []
    infracciones: List[InfractionSchema] = []
    error_message: Optional[str] = None
    tiempo_procesamiento_segundos: Optional[float] = None

    class Config:
        from_attributes = True


class UserLoginSchema(BaseModel):
    username: str
    password: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    username: str


# Nuevos Esquemas Pydantic
class DistrictSchema(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class LocationSchema(BaseModel):
    id: str
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district_id: Optional[str] = None
    district: Optional[DistrictSchema] = None

    class Config:
        from_attributes = True


class CameraSchema(BaseModel):
    id: str
    ip_address: str
    resolution: str
    status: str
    manufacturer: Optional[str] = None
    location_id: Optional[str] = None
    location: Optional[LocationSchema] = None

    class Config:
        from_attributes = True


class CameraCreateSchema(BaseModel):
    ip_address: str
    resolution: str
    status: str
    manufacturer: Optional[str] = None
    location_id: Optional[str] = None


class VehicleSchema(BaseModel):
    plate_number: str
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    vehicle_type: Optional[str] = None
    registration_date: Optional[datetime.date] = None

    class Config:
        from_attributes = True


class VehicleOwnerSchema(BaseModel):
    owner_id: str
    full_name: str
    address: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentSchema(BaseModel):
    payment_id: str
    amount_paid: float
    payment_method: Optional[str] = None
    transaction_number: Optional[str] = None
    payment_date: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class CitationAppealSchema(BaseModel):
    appeal_id: str
    appeal_date: datetime.datetime
    reason: str
    status: str
    resolution_date: Optional[datetime.datetime] = None
    resolution_notes: Optional[str] = None

    class Config:
        from_attributes = True


class CitationSchema(BaseModel):
    citation_id: str
    infraction_id: str
    owner_id: str
    plate_number: Optional[str] = None
    issue_date: Optional[datetime.datetime] = None
    fine_amount: float
    due_date: datetime.date
    status: str
    infraction: Optional[InfractionSchema] = None
    payments: List[PaymentSchema] = []
    appeals: List[CitationAppealSchema] = []

    class Config:
        from_attributes = True


class OwnerDetailSchema(BaseModel):
    owner: VehicleOwnerSchema
    vehicles: List[VehicleSchema] = []
    citations: List[CitationSchema] = []

    class Config:
        from_attributes = True


# Esquemas de Estadísticas y Analíticas
class ViolationDistributionItem(BaseModel):
    tipo: str
    count: int


class HistoryTrendItem(BaseModel):
    fecha: str
    count: int


class AnalyticsStatsResponse(BaseModel):
    total_videos: int
    total_infractions: int
    promedio_confianza: float
    infraction_distribution: List[ViolationDistributionItem]
    tendencia_historial: List[HistoryTrendItem]
    recent_infractions: List[InfractionSchema]

    class Config:
        from_attributes = True


class OfficerAssignmentSchema(BaseModel):
    assignment_id: str
    badge_number: str
    location_id: str
    shift_start: Optional[datetime.datetime] = None
    shift_end: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class OfficerSchema(BaseModel):
    badge_number: str
    name: str
    rank: Optional[str] = None
    district_id: Optional[str] = None
    district: Optional[DistrictSchema] = None
    assignments: List[OfficerAssignmentSchema] = []

    class Config:
        from_attributes = True


class AIModelSchema(BaseModel):
    id: str
    name: str
    version: str
    trained_at: Optional[datetime.datetime] = None
    accuracy_score: Optional[float] = None

    class Config:
        from_attributes = True


class ProcessingJobSchema(BaseModel):
    id: str
    video_id: str
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    status: str
    logs: Optional[str] = None

    class Config:
        from_attributes = True


class AuditLogSchema(BaseModel):
    log_id: str
    user_id: Optional[str] = None
    action: str
    table_name: str
    details: Optional[str] = None
    timestamp: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


class OperationalizationIndicator(BaseModel):
    id: str
    nombre: str
    formula: str
    dimension: str
    valor: float
    detalle: str
    instrumento: str


class OperationalizationResponse(BaseModel):
    indicadores: List[OperationalizationIndicator]

