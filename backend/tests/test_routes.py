import io
import os
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine, SessionLocal
from app.models.models import Video, Infraction, Camera, Location, District

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Clean tables to ensure tests are isolated
    db.query(Infraction).delete()
    db.query(Video).delete()
    db.query(Camera).delete()
    db.query(Location).delete()
    db.query(District).delete()
    db.commit()
    db.close()
    yield

# Test health check / root
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

# Test analytics stats route
def test_analytics_stats():
    db = SessionLocal()
    video = Video(id="test_vid", nombre_archivo="test.mp4", ruta_archivo="tmp/test.mp4", status="finalizado")
    db.add(video)
    db.commit()
    
    infraction = Infraction(
        id="inf_1",
        video_id="test_vid",
        tipo="Cruce de semáforo en rojo",
        frame_path="tmp/inf1.jpg",
        timestamp=2.5,
        descripcion="Test desc",
        placa_vehiculo="ABC-1234",
        confianza=0.92,
        caja_delimitadora={"x_min": 0.1, "y_min": 0.1, "x_max": 0.3, "y_max": 0.3}
    )
    db.add(infraction)
    db.commit()
    db.close()
    
    response = client.get("/api/v1/analytics/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_videos"] == 1
    assert data["total_infractions"] == 1
    assert data["promedio_confianza"] == 0.92
    assert len(data["infraction_distribution"]) == 1
    assert data["infraction_distribution"][0]["tipo"] == "Cruce de semáforo en rojo"
    assert len(data["tendencia_historial"]) >= 1

# Test video upload route
@patch("app.routes.video_routes.process_video")
def test_upload_video(mock_process_video):
    video_content = b"fake video bytes"
    file = {"file": ("test.mp4", io.BytesIO(video_content), "video/mp4")}
    
    response = client.post("/api/v1/videos/upload-video", files=file)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "procesando"
    assert data["filename"] == "test.mp4"
    assert "video_id" in data
    mock_process_video.assert_called_once()
    
    # Clean up uploaded file if it exists
    uploads_dir = os.path.join("backend", "uploads")
    if os.path.exists(uploads_dir):
        for f in os.listdir(uploads_dir):
            if f.endswith(".mp4") and f != "video_test_infracciones.mp4":
                try:
                    os.remove(os.path.join(uploads_dir, f))
                except Exception:
                    pass

# Test upload invalid extension
def test_upload_video_invalid_ext():
    file = {"file": ("test.txt", io.BytesIO(b"some text"), "text/plain")}
    response = client.post("/api/v1/videos/upload-video", files=file)
    assert response.status_code == 400
    assert "no soportado" in response.json()["detail"]

# Test infractions by video ID
def test_get_infractions_by_video_id():
    db = SessionLocal()
    video = Video(id="test_vid2", nombre_archivo="test2.mp4", ruta_archivo="tmp/test2.mp4", status="finalizado")
    db.add(video)
    db.commit()
    db.close()
    
    # 404 test
    response = client.get("/api/v1/videos/infracciones/nonexistent")
    assert response.status_code == 404
    
    # 200 test
    response = client.get("/api/v1/videos/infracciones/test_vid2")
    assert response.status_code == 200
    data = response.json()
    assert data["video_id"] == "test_vid2"
    assert data["status"] == "finalizado"

# Test get all infractions
def test_get_all_infractions():
    db = SessionLocal()
    video = Video(id="test_vid3", nombre_archivo="test3.mp4", ruta_archivo="tmp/test3.mp4", status="finalizado")
    db.add(video)
    db.commit()
    
    bbox = {"x_min": 0.1, "y_min": 0.1, "x_max": 0.3, "y_max": 0.3}
    inf1 = Infraction(id="inf_2", video_id="test_vid3", tipo="Cruce de semáforo en rojo", frame_path="tmp/2.jpg", timestamp=1.0, descripcion="D", placa_vehiculo="ABC-1234", confianza=0.9, caja_delimitadora=bbox)
    inf2 = Infraction(id="inf_3", video_id="test_vid3", tipo="Giro prohibido", frame_path="tmp/3.jpg", timestamp=2.0, descripcion="D", placa_vehiculo="XYZ-9876", confianza=0.8, caja_delimitadora=bbox)
    db.add(inf1)
    db.add(inf2)
    db.commit()
    db.close()
    
    # Test all
    response = client.get("/api/v1/videos/all-infractions")
    assert response.status_code == 200
    assert len(response.json()) == 2
    
    # Test filter by plate
    response = client.get("/api/v1/videos/all-infractions?placa=ABC")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["placa_vehiculo"] == "ABC-1234"
    
    # Test filter by type
    response = client.get("/api/v1/videos/all-infractions?tipo=Giro prohibido")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["tipo"] == "Giro prohibido"

# Test cameras
def test_cameras_endpoints():
    db = SessionLocal()
    # Create location first because camera location_id is foreign key
    loc = Location(id="loc_1", name="Calle Principal 123", latitude=12.34, longitude=56.78)
    db.add(loc)
    db.commit()
    db.close()
    
    # Add camera
    payload = {
        "ip_address": "192.168.1.50",
        "resolution": "1080p",
        "status": "activo",
        "manufacturer": "Hikvision",
        "location_id": "loc_1"
    }
    response = client.post("/api/v1/videos/cameras/add", json=payload)
    assert response.status_code == 201
    assert response.json()["ip_address"] == "192.168.1.50"
    
    # List cameras
    response = client.get("/api/v1/videos/cameras/list")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["ip_address"] == "192.168.1.50"
