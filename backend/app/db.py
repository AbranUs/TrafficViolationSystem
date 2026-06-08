import os
import logging
import threading
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Configuración básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Database")

# Almacén en memoria thread-safe de respaldo (para compatibilidad redundante)
db_lock = threading.Lock()
videos_db = {}

# Cargar URL de la base de datos de entorno, con fallback para desarrollo
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/traffic_violations"
)

# Compatibilidad con URL de Heroku/proveedores cloud
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Declarar Base del ORM
Base = declarative_base()
engine = None
SessionLocal = None
is_sqlite_fallback = False

try:
    logger.info(f"Conectando a base de datos principal...")
    # Creamos el motor de base de datos relacional
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # PostgreSQL con configuración estándar de conexión
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    # Probar conexión inicial
    with engine.connect() as conn:
        logger.info("[DB] Conexión establecida con éxito a la base de datos relacional.")
        
except Exception as e:
    # Fallback automático a SQLite basado en archivo físico para garantizar consistencia entre hilos
    # (SQLite :memory: no es compartido por diferentes hilos de conexión independientes)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    fallback_db_path = os.path.join(base_dir, "fallback.db")
    logger.warning(f"[DB] No se pudo conectar a PostgreSQL ({e}).")
    logger.info(f"[DB] Activando base de datos SQLite física de respaldo en: {fallback_db_path}")
    
    DATABASE_URL = f"sqlite:///{fallback_db_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    is_sqlite_fallback = True

def get_db():
    """
    Generador de dependencias para inyectar la sesión de la base de datos SQL
    en las llamadas HTTP de FastAPI. Garantiza el cierre seguro al concluir.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
