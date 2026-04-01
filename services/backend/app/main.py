from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, select, Session
from typing import List
import uuid

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

@app.get("/sensors/{sensor_id}", response_model=SensorWithMeasurements)
def get_sensor_details(sensor_id: uuid.UUID, session: Session = Depends(get_session)):
    sensor = session.get(Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@app.post("/measurements/ingest", status_code=201)
def ingest_measurement(data: MeasurementCreate, session: Session = Depends(get_session)):
    sensor = session.get(Sensor, data.sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    measurement = Measurement(sensor_id=sensor.id, value=data.value)
    session.add(measurement)
    session.commit()
    return {"status": "success"}