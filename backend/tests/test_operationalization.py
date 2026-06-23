from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine

client = TestClient(app)

def test_operationalization_endpoint():
    # Asegurar que las tablas existan
    Base.metadata.create_all(bind=engine)
    
    response = client.get("/api/v1/analytics/operationalization")
    assert response.status_code == 200
    
    data = response.json()
    assert "indicadores" in data
    
    indicadores = data["indicadores"]
    # Deben haber exactamente 9 indicadores correspondientes a las dimensiones
    assert len(indicadores) == 9
    
    # Validar campos de cada indicador
    for ind in indicadores:
        assert "id" in ind
        assert "nombre" in ind
        assert "formula" in ind
        assert "dimension" in ind
        assert "valor" in ind
        assert "detalle" in ind
        assert "instrumento" in ind
