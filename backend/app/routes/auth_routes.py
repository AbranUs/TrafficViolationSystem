import hashlib
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.models import User, UserLoginSchema, TokenSchema

logger = logging.getLogger("AuthRoutes")
router = APIRouter()

# Sal y algoritmo nativo de cifrado SHA256 (seguro y auto-contenido sin dependencias de NPM o pip)
SALT: str = "TrafficViolationSaltSystemKey"

def get_password_hash(password: str) -> str:
    """Genera el hash SHA-256 de una contraseña en texto plano combinada con la sal."""
    salted_pwd = password + SALT
    return hashlib.sha256(salted_pwd.encode('utf-8')).hexdigest()

def seed_default_user(db: Session) -> None:
    """
    Función de semilla. Crea un usuario administrador por defecto
    ('admin' / 'admin123') la primera vez si la tabla 'users' está vacía.
    """
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            logger.info("[Auth] No se encontró usuario administrador. Generando usuario semilla...")
            hashed = get_password_hash("admin123")
            db_user = User(
                id=str(uuid.uuid4()),
                username="admin",
                hashed_password=hashed
            )
            db.add(db_user)
            db.commit()
            logger.info("[Auth] ¡Usuario de prueba 'admin' creado exitosamente en base de datos!")
    except Exception:
        logger.exception("[Auth] Error al inyectar usuario por defecto en base de datos:")
        db.rollback()

@router.post("/login", response_model=TokenSchema)
async def login(payload: UserLoginSchema, db: Session = Depends(get_db)) -> dict:
    """
    Verifica las credenciales provistas por el cliente contra la base de datos SQL.
    Si son válidas, genera un token mock JWT/seguro para control de sesión en el frontend.
    """
    logger.info(f"Petición de inicio de sesión recibida para el usuario: {payload.username}")
    
    # Buscar el usuario en base de datos
    user = db.query(User).filter(User.username == payload.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos."
        )
        
    # Verificar contraseña cifrada
    incoming_hash = get_password_hash(payload.password)
    if incoming_hash != user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos."
        )
        
    # Generar un token único simple (simulando JWT de sesión segura)
    session_token = f"session_token_{user.id}_{uuid.uuid4().hex[:8]}"
    
    logger.info(f"Inicio de sesión exitoso para el usuario: {payload.username}")
    
    return {
        "access_token": session_token,
        "token_type": "bearer",
        "username": user.username
    }
