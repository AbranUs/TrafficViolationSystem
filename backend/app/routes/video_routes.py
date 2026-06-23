import os
import uuid
import shutil
import logging
import datetime
from typing import List, Optional, Annotated
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from app.db import get_db
from app.services.ia_service import process_video
from app.models.models import (
    Video, Infraction, VideoUploadResponse, VideoStatusResponse, InfractionSchema,
    Camera, District, VehicleOwner, Vehicle, Citation, OwnerVehicle, Location,
    CameraSchema, CameraCreateSchema, DistrictSchema, VehicleOwnerSchema, OwnerDetailSchema, LocationSchema,
    Officer, AIModel, ProcessingJob, AuditLog,
    OfficerSchema, AIModelSchema, ProcessingJobSchema, AuditLogSchema
)

# Configuración básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VideoRoutes")

router = APIRouter()

# Directorio de subidas relativo a la carpeta backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Formatos de video soportados
SUPPORTED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}

@router.post("/upload-video", status_code=201, response_model=VideoUploadResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Recibe un video subido desde el frontend en formato multipart/form-data.
    Registra el metadato del video en la base de datos SQL relacional (PostgreSQL/SQLite),
    almacena el archivo físicamente en disco y programa el procesamiento de IA en segundo plano.
    """
    logger.info(f"Petición recibida para subir video: {file.filename}")
    
    # 1. Validar nombre de archivo y extensión
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="La petición no contiene un nombre de archivo válido."
        )
        
    _, file_ext = os.path.splitext(file.filename.lower())
    if file_ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo '{file_ext}' no soportado. Formatos válidos: {', '.join(SUPPORTED_EXTENSIONS)}"
        )
        
    # 2. Asegurar que exista la carpeta de subidas
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
    except Exception as e:
        logger.error(f"Error al crear el directorio de subidas: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor al preparar el directorio de almacenamiento."
        )

    # 3. Generar identificador único global (UUID) y definir ruta del archivo
    video_id = str(uuid.uuid4())
    saved_filename = f"{video_id}{file_ext}"
    video_path = os.path.join(UPLOAD_DIR, saved_filename)
    
    # 4. Escribir el archivo en disco de forma asíncrona usando el pool de hilos
    try:
        def save_upload_file(upload_file, destination):
            with open(destination, "wb") as buffer:
                upload_file.file.seek(0)
                while True:
                    chunk = upload_file.file.read(1024 * 1024)
                    if not chunk:
                        break
                    buffer.write(chunk)

        await run_in_threadpool(save_upload_file, file, video_path)
    except Exception as e:
        logger.error(f"Error al escribir el archivo de video en disco: {e}")
        if os.path.exists(video_path):
            os.remove(video_path)
        raise HTTPException(
            status_code=500,
            detail="Error al guardar el archivo de video en el servidor."
        )
    finally:
        await file.close()

    # 5. Persistir metadatos en la base de datos SQL física
    try:
        db_video = Video(
            id=video_id,
            nombre_archivo=file.filename,
            ruta_archivo=video_path,
            status="procesando"
        )
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        logger.info(f"[DB] Registro de video '{video_id}' guardado correctamente en SQL.")
    except Exception:
        logger.exception("[DB] No se pudo guardar el registro de video en SQL.")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error al guardar el registro del video en la base de datos."
        )
        
    # 6. Agendar la tarea de procesamiento de IA en segundo plano
    background_tasks.add_task(process_video, video_path, video_id)
    
    logger.info(f"Video guardado y encolado exitosamente. ID asignado: {video_id}")
    
    return {
        "video_id": video_id,
        "filename": file.filename,
        "status": "procesando",
        "message": "Video subido con éxito. El análisis de IA se ha iniciado en segundo plano."
    }

@router.get("/infractions/{video_id}", response_model=VideoStatusResponse)
@router.get("/infracciones/{video_id}", response_model=VideoStatusResponse)
async def get_infractions(video_id: str, db: Session = Depends(get_db)) -> dict:
    """
    Retorna el estado actual y el JSON con la relación completa de infracciones
    detectadas consultando la base de datos SQL relacional.
    """
    logger.info(f"Petición de consulta de infracciones recibida para el video_id: {video_id}")
    
    try:
        video_data = db.query(Video).filter(Video.id == video_id).first()
        if not video_data:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontró ningún video con el ID '{video_id}' en nuestro sistema."
            )
            
        return {
            "video_id": video_data.id,
            "nombre_archivo": video_data.nombre_archivo,
            "fecha_subida": video_data.fecha_subida,
            "status": video_data.status,
            "infractions": video_data.infractions,
            "infracciones": video_data.infractions,
            "error_message": video_data.error_message,
            "tiempo_procesamiento_segundos": video_data.tiempo_procesamiento_segundos
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("[DB] Error consultando la base de datos relacional.")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor al consultar la base de datos."
        )

@router.get("/all-infractions", response_model=List[InfractionSchema])
async def get_all_infractions(
    placa: Optional[str] = None,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db)
) -> List[Infraction]:
    """
    Retorna todas las infracciones registradas en la base de datos,
    permitiendo búsquedas globales por número de placa o por tipo de infracción.
    """
    logger.info(f"Petición de listado general de infracciones. Filtros -> placa: {placa}, tipo: {tipo}")
    try:
        query = db.query(Infraction)
        if placa:
            query = query.filter(Infraction.placa_vehiculo.ilike(f"%{placa}%"))
        if tipo:
            query = query.filter(Infraction.tipo == tipo)
        
        return query.order_by(Infraction.timestamp.desc()).all()
    except Exception as e:
        logger.error(f"[DB] Error recuperando listado de infracciones: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error al recuperar el listado de infracciones desde la base de datos."
        )

@router.get("/cameras/list", response_model=List[CameraSchema])
async def get_cameras(db: Session = Depends(get_db)) -> List[Camera]:
    """
    Retorna la lista completa de todas las cámaras viales registradas.
    """
    logger.info("Obteniendo lista de cámaras de tráfico.")
    return db.query(Camera).all()

@router.post("/cameras/add", response_model=CameraSchema, status_code=201)
async def add_camera(payload: CameraCreateSchema, db: Session = Depends(get_db)) -> Camera:
    """
    Registra una nueva cámara vial en la base de datos vinculada a una ubicación/intersección.
    """
    logger.info(f"Registrando nueva cámara de tráfico en la dirección IP: {payload.ip_address}")
    cam_id = str(uuid.uuid4())
    db_camera = Camera(
        id=cam_id,
        ip_address=payload.ip_address,
        resolution=payload.resolution,
        status=payload.status,
        manufacturer=payload.manufacturer,
        location_id=payload.location_id
    )
    db.add(db_camera)
    try:
        db.commit()
        db.refresh(db_camera)
        logger.info(f"Cámara de tráfico registrada con ID: {cam_id}")
        return db_camera
    except Exception as e:
        db.rollback()
        logger.error(f"[DB] Error al registrar la cámara en la base de datos: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al registrar la cámara en la base de datos: {str(e)}"
        )

@router.get("/districts/list", response_model=List[DistrictSchema])
async def get_districts(db: Session = Depends(get_db)) -> List[District]:
    """
    Retorna la lista de distritos viales disponibles.
    """
    logger.info("Obteniendo lista de distritos viales.")
    return db.query(District).all()

@router.get("/locations/list", response_model=List[LocationSchema])
async def get_locations(db: Session = Depends(get_db)) -> List[Location]:
    """
    Retorna la lista de intersecciones viales disponibles.
    """
    logger.info("Obteniendo lista de intersecciones viales.")
    return db.query(Location).all()

@router.get("/citizens/search", response_model=List[VehicleOwnerSchema])
async def search_citizens(query: str, db: Session = Depends(get_db)) -> List[VehicleOwner]:
    """
    Realiza una búsqueda de ciudadanos/propietarios por DNI o Nombre Completo.
    """
    logger.info(f"Buscando ciudadanos con query: '{query}'")
    if not query.strip():
        return []
    
    return db.query(VehicleOwner).filter(
        (VehicleOwner.owner_id.ilike(f"%{query}%")) | 
        (VehicleOwner.full_name.ilike(f"%{query}%"))
    ).all()

@router.get("/citizens/detail/{owner_id}", response_model=OwnerDetailSchema)
async def get_citizen_detail(owner_id: str, db: Session = Depends(get_db)) -> dict:
    """
    Devuelve los detalles de perfil de un propietario, sus vehículos registrados
    y su historial de citaciones oficiales con multas.
    """
    logger.info(f"Obteniendo detalles del ciudadano ID: {owner_id}")
    owner = db.query(VehicleOwner).filter(VehicleOwner.owner_id == owner_id).first()
    if not owner:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró ningún propietario con DNI/ID '{owner_id}'"
        )
    
    # Obtener vehículos del propietario mediante la tabla de asociación
    vehicles_query = db.query(Vehicle).join(
        OwnerVehicle, Vehicle.plate_number == OwnerVehicle.plate_number
    ).filter(OwnerVehicle.owner_id == owner_id).all()
    
    # Obtener citaciones/multas oficiales registradas para este ciudadano
    citations = db.query(Citation).filter(Citation.owner_id == owner_id).all()
    
    return {
        "owner": owner,
        "vehicles": vehicles_query,
        "citations": citations
    }

@router.get("/officers/list", response_model=List[OfficerSchema])
async def get_officers(db: Session = Depends(get_db)) -> List[Officer]:
    """
    Retorna la lista de agentes de tránsito asignados al control vial.
    """
    logger.info("Obteniendo lista de agentes de tránsito.")
    return db.query(Officer).all()

@router.get("/ai-models/list", response_model=List[AIModelSchema])
async def get_ai_models(db: Session = Depends(get_db)) -> List[AIModel]:
    """
    Retorna el catálogo de modelos de inteligencia artificial y su precisión.
    """
    logger.info("Obteniendo catálogo de modelos de IA.")
    return db.query(AIModel).all()

@router.get("/processing-jobs/list", response_model=List[ProcessingJobSchema])
async def get_processing_jobs(db: Session = Depends(get_db)) -> List[ProcessingJob]:
    """
    Retorna la cola de trabajos de IA con sus logs técnicos correspondientes.
    """
    logger.info("Obteniendo cola de trabajos de procesamiento.")
    return db.query(ProcessingJob).order_by(ProcessingJob.start_time.desc()).all()

@router.get("/audit-logs/list", response_model=List[AuditLogSchema])
async def get_audit_logs(db: Annotated[Session, Depends(get_db)]) -> List[AuditLog]:
    """
    Retorna el registro completo de logs de auditoría para la seguridad del sistema.
    """
    logger.info("Obteniendo registro de auditoría de seguridad.")
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()

@router.get("/debug/list-videos")
async def debug_list_videos(db: Annotated[Session, Depends(get_db)]):
    videos = db.query(Video).order_by(Video.fecha_subida.desc()).all()
    return [
        {
            "id": v.id,
            "nombre_archivo": v.nombre_archivo,
            "status": v.status,
            "error_message": v.error_message,
            "tiempo_procesamiento_segundos": v.tiempo_procesamiento_segundos,
            "fecha_subida": v.fecha_subida
        }
        for v in videos
    ]
