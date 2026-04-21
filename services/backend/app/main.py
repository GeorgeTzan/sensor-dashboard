from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, select, Session
from typing import List, Optional
import uuid
from pydantic import BaseModel

from app.db import engine
from app.models import Sensor, Measurement
from app.schemas import SensorRead, SensorWithMeasurements, MeasurementCreate
from app.deps import get_session

app = FastAPI(title="Sensor Dashboard API")

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.get("/health")
def health_check():
    return {"status": "online"}

@app.get("/sensors", response_model=List[SensorRead])
def get_sensors(session: Session = Depends(get_session)):
    sensors = session.exec(select(Sensor)).all()
    return sensors

class SensorCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str

@app.post("/sensors", response_model=SensorRead, status_code=201)
def create_sensor(data: SensorCreate, session: Session = Depends(get_session)):
    sensor = Sensor(name=data.name, description=data.description, type=data.type)
    session.add(sensor)
    session.commit()
    session.refresh(sensor)
    return sensor

@app.get("/sensors/{sensor_id}", response_model=SensorWithMeasurements)
def get_sensor_details(sensor_id: uuid.UUID, session: Session = Depends(get_session)):
    sensor = session.get(Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    from sqlmodel import select
    measurements = session.exec(select(Measurement).where(Measurement.sensor_id == sensor_id).order_by(Measurement.timestamp.desc())).all()
    
    return {
        "id": sensor.id,
        "name": sensor.name,
        "description": sensor.description,
        "type": sensor.type,
        "measurements": [
            {
                "id": m.id,
                "value": m.value,
                "timestamp": m.timestamp
            } for m in measurements
        ]
    }

@app.post("/measurements/ingest", status_code=201)
def ingest_measurement(data: MeasurementCreate, session: Session = Depends(get_session)):
    sensor = session.get(Sensor, data.sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    measurement = Measurement(sensor_id=sensor.id, value=data.value)
    session.add(measurement)
    session.commit()
    return {"status": "success"}

class UserRead(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = None

@app.get("/users", response_model=List[UserRead])
def get_users(session: Session = Depends(get_session)):
    from sqlalchemy import text
    try:
        result = session.exec(text("SELECT id, name, email, role FROM \"user\"")).all()
        users = [{"id": row[0], "name": row[1], "email": row[2], "role": row[3]} for row in result]
    except Exception:
        session.rollback()
        result = session.exec(text("SELECT id, name, email FROM \"user\"")).all()
        users = [{"id": row[0], "name": row[1], "email": row[2], "role": "user"} for row in result]
    return users