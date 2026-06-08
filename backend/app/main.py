import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.video_routes import router as video_router
from app.routes.auth_routes import router as auth_router, seed_default_user
from app.routes.analytics_routes import router as analytics_router
from app.db import Base, engine, SessionLocal
from app.models.models import Video, Infraccion, User  # noqa: F401

# Inicialización de la aplicación FastAPI
app = FastAPI(
    title="Traffic Violation System API",
    description="Servicios del backend para la gestión de videos y detección automatizada de infracciones de tránsito con Inteligencia Artificial.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración del Middleware CORS para facilitar la integración con el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite conexiones desde cualquier origen para desarrollo. En producción, restringir.
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los verbos HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras HTTP
)

from fastapi.staticfiles import StaticFiles

# Registro de enrutadores modulares (APIRouter)
app.include_router(video_router, prefix="/api/v1/videos", tags=["Videos e Infracciones"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Estadísticas y Analíticas"])

# Montar carpeta de subidas estáticamente para servir fotogramas e imágenes de evidencia al frontend
base_dir = os.path.dirname(os.path.abspath(__file__))
uploads_dir = os.path.join(base_dir, "uploads")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/", tags=["Health Check"])
def read_root():
    """
    Endpoint raíz para verificación rápida del estado y funcionamiento del servidor backend.
    """
    return {
        "status": "online",
        "app_name": app.title,
        "version": app.version,
        "docs_interactive": "/docs",
        "docs_static": "/redoc"
    }

@app.on_event("startup")
def startup_event():
    """
    Se ejecuta al iniciar la aplicación.
    Asegura que el directorio de uploads local para guardar los videos exista físicamente,
    crea automáticamente las tablas en la base de datos conectada e inyecta la semilla de usuarios.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(base_dir, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    print(f"[*] Directorio de subidas inicializado correctamente en: {uploads_dir}")
    
    # Inicializar esquemas en base de datos física (PostgreSQL/SQLite)
    try:
        Base.metadata.create_all(bind=engine)
        print("[*] Tablas de base de datos creadas/verificadas con éxito en SQLAlchemy.")
        
        # Sembrar usuario administrador semilla ('admin' / 'admin123')
        db = SessionLocal()
        try:
            seed_default_user(db)
        finally:
            db.close()
            
    except Exception as e:
        print(f"[ERROR] Falló la inicialización automática de tablas relacionales: {e}")


