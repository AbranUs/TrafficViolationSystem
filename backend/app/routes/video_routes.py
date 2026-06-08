import os
import uuid
import shutil
import logging
import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.db import videos_db, db_lock, get_db
from app.services.ia_service import process_video
from app.models.models import Video, Infraccion, VideoUploadResponse, VideoStatusResponse

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
    
    # 4. Escribir el archivo en disco en bloques de 1MB para proteger la memoria RAM
    try:
        with open(video_path, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                buffer.write(chunk)
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
            status="procesando"
        )
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        logger.info(f"[DB] Registro de video '{video_id}' guardado correctamente en SQL.")
    except Exception as e:
        logger.error(f"[DB] No se pudo guardar el registro de video en SQL ({e}). Usando fallback local.")
        db.rollback()

    # 6. Registrar en la base de datos mock local de compatibilidad
    with db_lock:
        videos_db[video_id] = {
            "video_id": video_id,
            "filename": file.filename,
            "saved_path": video_path,
            "status": "procesando",
            "infracciones": [],
            "error_message": None,
            "tiempo_procesamiento_segundos": None
        }
        
    # 7. Agendar la tarea de procesamiento de IA en segundo plano
    background_tasks.add_task(process_video, video_path, video_id)
    
    logger.info(f"Video guardado y encolado exitosamente. ID asignado: {video_id}")
    
    return {
        "video_id": video_id,
        "filename": file.filename,
        "status": "procesando",
        "message": "Video subido con éxito. El análisis de IA se ha iniciado en segundo plano."
    }

@router.get("/infracciones/{video_id}", response_model=VideoStatusResponse)
async def get_infracciones(video_id: str, db: Session = Depends(get_db)):
    """
    Retorna el estado actual y el JSON con la relación completa de infracciones
    detectadas consultando la base de datos SQL o el almacén local en memoria.
    """
    logger.info(f"Petición de consulta de infracciones recibida para el video_id: {video_id}")
    
    # 1. Intentar consultar en la base de datos SQL relacional (PostgreSQL/SQLite)
    try:
        video_data = db.query(Video).filter(Video.id == video_id).first()
        if video_data:
            # Pydantic serializa de forma automática el objeto SQLAlchemy y su lista
            # de Infracciones relacionada gracias a Config.from_attributes = True
            return {
                "video_id": video_data.id,
                "nombre_archivo": video_data.nombre_archivo,
                "fecha_subida": video_data.fecha_subida,
                "status": video_data.status,
                "infracciones": video_data.infracciones,
                "error_message": video_data.error_message,
                "tiempo_procesamiento_segundos": video_data.tiempo_procesamiento_segundos
            }
    except Exception as e:
        logger.error(f"[DB] Error consultando la base de datos relacional ({e}). Intentando fallback local.")

    # 2. Fallback a la base de datos local en memoria
    with db_lock:
        mem_video = videos_db.get(video_id)
        
    if not mem_video:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontró ningún video con el ID '{video_id}' en nuestro sistema."
        )
        
    # Adaptar del diccionario local en memoria al esquema de respuesta VideoStatusResponse
    mapped_infracciones = []
    for inf in mem_video["infracciones"]:
        # Asegurar compatibilidad de campos renombrados en la respuesta Pydantic
        mapped_infracciones.append({
            "id": inf.get("id") or inf.get("infraccion_id"),
            "video_id": video_id,
            "tipo": inf["tipo"],
            "frame_path": inf.get("frame_path", ""),
            "timestamp": inf.get("timestamp") or inf.get("timestamp_segundos", 0.0),
            "descripcion": inf["descripcion"],
            "placa_vehiculo": inf.get("placa_vehiculo"),
            "confianza": inf["confianza"],
            "caja_delimitadora": inf["caja_delimitadora"]
        })

    return {
        "video_id": mem_video["video_id"],
        "nombre_archivo": mem_video["filename"],
        "fecha_subida": datetime.datetime.now(datetime.timezone.utc),
        "status": mem_video["status"],
        "infracciones": mapped_infracciones,
        "error_message": mem_video.get("error_message"),
        "tiempo_procesamiento_segundos": mem_video.get("tiempo_procesamiento_segundos")
    }
