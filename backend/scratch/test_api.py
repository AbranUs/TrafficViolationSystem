import os
import sys
import io
import time
import shutil

# Agregar la ruta del backend al PYTHONPATH para poder importar app, db y services correctamente
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine, videos_db
from scratch.generate_test_video import generate_synthetic_video

# Garantizar que las tablas de base de datos se inicialicen antes de iniciar las pruebas
# Dado que Starlette TestClient no ejecuta por defecto el evento @app.on_event("startup")
# si no se invoca dentro de un manejador de contexto 'with'.
print("[TestSetup] Creando esquemas y tablas de base de datos relacionales...")
Base.metadata.create_all(bind=engine)
print("[TestSetup] Esquemas creados con éxito.")

client = TestClient(app)

# Ruta física para guardar el video de prueba generado
SCRATCH_DIR = os.path.dirname(os.path.abspath(__file__))
TEST_VIDEO_PATH = os.path.join(SCRATCH_DIR, "video_test_infracciones.mp4")

def test_health_check():
    print("\n--- Probando Health Check (GET /) ---")
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    print("Respuesta:", data)
    assert data["status"] == "online"
    print("[OK] Health check exitoso!")

def test_upload_invalid_format():
    print("\n--- Probando Carga de Formato No Soportado ---")
    # Intentar subir un archivo con extensión inválida (.txt)
    file_data = {"file": ("test_file.txt", io.BytesIO(b"dummy text content"), "text/plain")}
    response = client.post("/api/v1/videos/upload-video", files=file_data)
    print("Respuesta de error esperado (Codigo 400):", response.json())
    assert response.status_code == 400
    assert "Formato de archivo" in response.json()["detail"]
    print("[OK] Validacion de formato invalido exitosa!")

def test_upload_and_process_real_cv_flow():
    print("\n--- Generando Video Sintetico de Prueba con OpenCV ---")
    # Generar el archivo físico .mp4 real con trayectorias de infracciones
    generate_synthetic_video(TEST_VIDEO_PATH)
    assert os.path.exists(TEST_VIDEO_PATH), "El video de prueba no pudo ser generado."
    print("[OK] Video sintetico físico de prueba generado con éxito!")

    print("\n--- Probando Carga y Procesamiento del Video Real en el Servidor ---")
    # Subir el archivo de video real cargándolo desde disco
    with open(TEST_VIDEO_PATH, "rb") as video_file:
        file_data = {"file": ("video_test_infracciones.mp4", video_file, "video/mp4")}
        response = client.post("/api/v1/videos/upload-video", files=file_data)
        
    assert response.status_code == 201
    data = response.json()
    print("Respuesta de Carga de Video:", data)
    assert "video_id" in data
    assert data["status"] == "procesando"
    video_id = data["video_id"]
    print(f"[OK] Video subido e ID de proceso asignado: {video_id}")

    # En FastAPI TestClient, las BackgroundTasks se ejecutan de forma SÍNCRONA
    # al retornar la llamada, por lo que el procesamiento real de frames ya ha concluido.
    print("\n--- Consultando Reporte de Infracciones Detectadas por el Motor de IA ---")
    response_get = client.get(f"/api/v1/videos/infracciones/{video_id}")
    assert response_get.status_code == 200
    
    result = response_get.json()
    print("\nRespuesta Detallada de Consulta (JSON Serializado por Pydantic):")
    import json
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    assert result["video_id"] == video_id
    assert result["status"] == "completado"
    assert "tiempo_procesamiento_segundos" in result
    
    infracciones = result["infracciones"]
    print(f"\n[OK] Analisis de video terminado. Infracciones detectadas físicamente: {len(infracciones)}")
    
    # Validar que detectamos las 3 infracciones viales programadas visualmente en las trayectorias del generador
    tipos_detectados = [inf["tipo"] for inf in infracciones]
    print(f"Tipos de infracciones capturadas por el motor CV: {tipos_detectados}")
    
    # 1. Semáforo en rojo
    assert "Cruce de semáforo en rojo" in tipos_detectados, "No se detectó la infracción de cruce de semáforo en rojo."
    # 2. Giro prohibido en U
    assert "Giro prohibido" in tipos_detectados, "No se detectó la infracción de giro prohibido en U."
    # 3. Estacionamiento prohibido (Invasión de paso peatonal)
    assert "Invasión de paso peatonal" in tipos_detectados, "No se detectó la infracción de invasión de zona/estacionamiento prohibido."
    
    print("\n--- Validando Persistencia Física de los Fotogramas de Infracción (Disco) ---")
    # Verificar físicamente la creación y guardado de las capturas JPG recortadas/pintadas
    for inf in infracciones:
        assert "frame_path" in inf
        assert inf["frame_path"] != ""
        assert os.path.exists(inf["frame_path"]), f"El fotograma '{inf['frame_path']}' no se guardó físicamente."
        print(f" [OK] Fotograma encontrado físicamente en: {inf['frame_path']}")
        
    print("\n[OK] ¡Las 3 infracciones viales de los vehículos simulados fueron detectadas con éxito por el motor de visión clásica!")
    print("[OK] ¡Se confirmó la creación y el guardado físico de todos los fotogramas (.jpg) de infracción en el disco!")

    # Limpieza de archivos temporales de prueba generados
    print("\n--- Limpiando Archivos Temporales de Prueba ---")
    try:
        if os.path.exists(TEST_VIDEO_PATH):
            os.remove(TEST_VIDEO_PATH)
            
        # Limpiar el archivo de uploads guardado por la ruta y sus fotogramas
        saved_path = videos_db[video_id]["saved_path"]
        if os.path.exists(saved_path):
            os.remove(saved_path)
            
        # Limpiar los frames guardados en disco
        for inf in infracciones:
            f_path = inf["frame_path"]
            if os.path.exists(f_path):
                os.remove(f_path)
                
        # Intentar borrar el directorio frames y uploads si quedan vacíos
        frames_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "frames")
        if os.path.exists(frames_dir) and not os.listdir(frames_dir):
            os.rmdir(frames_dir)
            
        uploads_dir = os.path.dirname(saved_path)
        if os.path.exists(uploads_dir) and not os.listdir(uploads_dir):
            os.rmdir(uploads_dir)
            
        # Eliminar el archivo de base de datos SQLite fallback generado por el test
        app_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app")
        fallback_db = os.path.join(app_dir, "fallback.db")
        if os.path.exists(fallback_db):
            os.remove(fallback_db)
            print("[OK] Base de datos SQLite temporal 'fallback.db' removida con éxito.")
            
        print("[OK] Limpieza de archivos de prueba finalizada.")
    except Exception as e:
        print(f"[WARN] No se pudieron limpiar algunos archivos temporales: {e}")

def test_query_non_existent():
    print("\n--- Probando Consulta de ID Inexistente ---")
    invalid_uuid = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/api/v1/videos/infracciones/{invalid_uuid}")
    print("Respuesta de error esperado (Codigo 404):", response.json())
    assert response.status_code == 404
    assert "no se encontr" in response.json()["detail"].lower()
    print("[OK] Validacion de ID inexistente exitosa!")

if __name__ == "__main__":
    print("=== INICIANDO PRUEBAS INTEGRADAS END-TO-END DE API, SQL Y VISION POR COMPUTADORA ===")
    try:
        test_health_check()
        test_upload_invalid_format()
        test_upload_and_process_real_cv_flow()
        test_query_non_existent()
        print("\n==========================================================================")
        print(" [OK] ¡TODAS LAS PRUEBAS DE INTEGRACIÓN (API + SQL + CV) SE COMPLETARON CON ÉXITO! ")
        print("==========================================================================")
    except AssertionError as e:
        print("\n==========================================================================")
        print(" [FAIL] ¡ALUNAS PRUEBAS FALLARON! ")
        print(f" Detalle: {e}")
        print("==========================================================================")
        sys.exit(1)
