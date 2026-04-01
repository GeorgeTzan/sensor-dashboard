from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import uuid
import pytest

from app.main import app
from app.deps import get_session
from app.models import Sensor

sqlite_url = "sqlite://"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False}, poolclass=StaticPool)

def get_session_override():
    with Session(engine) as session:
        yield session

app.dependency_overrides[get_session] = get_session_override

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        sensor = Sensor(id=uuid.UUID("11111111-1111-1111-1111-111111111111"), name="Test Sensor", type="TEMPERATURE")
        session.add(sensor)
        session.commit()
    yield
    SQLModel.metadata.drop_all(engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "online"}

def test_get_sensors():
    response = client.get("/sensors")
    assert response.status_code == 200
    sensors = response.json()
    assert len(sensors) == 1
    assert sensors[0]["name"] == "Test Sensor"

def test_get_sensor_details():
    response = client.get("/sensors/11111111-1111-1111-1111-111111111111")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Sensor"
    assert "measurements" in response.json()

def test_get_invalid_sensor():
    response = client.get("/sensors/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404

def test_ingest_measurement():
    payload = {
        "sensor_id": "11111111-1111-1111-1111-111111111111",
        "value": 25.5
    }
    response = client.post("/measurements/ingest", json=payload)
    assert response.status_code == 201
    assert response.json() == {"status": "success"}

def test_ingest_measurement_invalid_sensor():
    payload = {
        "sensor_id": "00000000-0000-0000-0000-000000000000",
        "value": 25.5
    }
    response = client.post("/measurements/ingest", json=payload)
    assert response.status_code == 404