from fastapi import FastAPI, Depends, HTTPException, Query
from sqlmodel import SQLModel, select, Session, func
from typing import List, Optional
import uuid
from datetime import datetime, timedelta

from app.db import engine
from app.models import Sensor, Measurement, Category, SensorCategoryLink
from app.schemas import (
    SensorRead, 
    SensorWithMeasurements, 
    MeasurementCreate, 
    SensorCreate, 
    SensorUpdate,
    CategoryRead
)
from app.deps import get_session

app = FastAPI(title="Sensor Dashboard API")

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.get("/health")
def health_check():
    return {"status": "online"}

@app.get("/categories", response_model=List[CategoryRead])
def get_categories(session: Session = Depends(get_session)):
    return session.exec(select(Category)).all()

@app.get("/sensors", response_model=List[SensorRead])
def get_sensors(session: Session = Depends(get_session)):
    sensors = session.exec(select(Sensor)).all()
    return sensors

@app.post("/sensors", response_model=SensorRead, status_code=201)
def create_sensor(data: SensorCreate, session: Session = Depends(get_session)):
    if not data.category_ids:
        raise HTTPException(status_code=400, detail="At least one category is required")
        
    categories = session.exec(select(Category).where(Category.id.in_(data.category_ids))).all()
    if not categories:
        raise HTTPException(status_code=400, detail="Invalid categories")
    
    sensor = Sensor(
        name=data.name, 
        description=data.description, 
        type=data.type,
        categories=categories
    )
    session.add(sensor)
    session.commit()
    session.refresh(sensor)
    return sensor

@app.put("/sensors/{sensor_id}", response_model=SensorRead)
def update_sensor(sensor_id: uuid.UUID, data: SensorUpdate, session: Session = Depends(get_session)):
    sensor = session.get(Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    if data.name is not None:
        sensor.name = data.name
    if data.description is not None:
        sensor.description = data.description
    if data.type is not None:
        sensor.type = data.type
    
    if data.category_ids is not None:
        categories = session.exec(select(Category).where(Category.id.in_(data.category_ids))).all()
        sensor.categories = categories
        
    session.add(sensor)
    session.commit()
    session.refresh(sensor)
    return sensor

@app.delete("/sensors/{sensor_id}")
def delete_sensor(sensor_id: uuid.UUID, session: Session = Depends(get_session)):
    sensor = session.get(Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    measurements = session.exec(select(Measurement).where(Measurement.sensor_id == sensor_id)).all()
    for m in measurements:
        session.delete(m)
    
    session.delete(sensor)
    session.commit()
    return {"status": "success"}

@app.get("/sensors/{sensor_id}", response_model=SensorWithMeasurements)
def get_sensor_details(
    sensor_id: uuid.UUID, 
    resolution: str = Query("hour", enum=["hour", "day", "month"]),
    session: Session = Depends(get_session)
):
    sensor = session.get(Sensor, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    trunc_map = {
        "hour": "hour",
        "day": "day",
        "month": "month"
    }
    
    trunc_unit = trunc_map.get(resolution, "hour")
    
    query = (
        select(
            func.date_trunc(trunc_unit, Measurement.timestamp).label("ts"),
            func.avg(Measurement.value).label("val")
        )
        .where(Measurement.sensor_id == sensor_id)
        .group_by("ts")
        .order_by("ts")
    )
    
    results = session.exec(query).all()
    
    return {
        "id": sensor.id,
        "name": sensor.name,
        "description": sensor.description,
        "type": sensor.type,
        "categories": sensor.categories,
        "measurements": [
            {
                "id": uuid.uuid4(),
                "value": round(float(row.val), 2),
                "timestamp": row.ts
            } for row in results
        ]
    }

@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    total_sensors = session.exec(select(func.count(Sensor.id))).one()
    
    avg_temp_query = (
        select(func.avg(Measurement.value))
        .join(Sensor)
        .where(Sensor.type == "TEMPERATURE")
    )
    avg_temp = session.exec(avg_temp_query).one()
    
    avg_hum_query = (
        select(func.avg(Measurement.value))
        .join(Sensor)
        .where(Sensor.type == "HUMIDITY")
    )
    avg_hum = session.exec(avg_hum_query).one()
    
    alerts_query = select(func.count(Measurement.id)).where(
        (Measurement.value > 40) | (Measurement.value < 0)
    )
    active_alerts = session.exec(alerts_query).one()

    return {
        "total_sensors": total_sensors,
        "avg_temp": round(float(avg_temp), 1) if avg_temp is not None else 0,
        "avg_humidity": round(float(avg_hum), 1) if avg_hum is not None else 0,
        "active_alerts": active_alerts
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

@app.get("/users")
def get_users(session: Session = Depends(get_session)):
    from sqlalchemy import text
    try:
        result = session.exec(text("SELECT id, name, email, role, username FROM \"user\"")).all()
        users = [{"id": row[0], "name": row[1], "email": row[2], "role": row[3], "username": row[4]} for row in result]
    except Exception:
        session.rollback()
        result = session.exec(text("SELECT id, name, email, username FROM \"user\"")).all()
        users = [{"id": row[0], "name": row[1], "email": row[2], "role": "user", "username": row[3]} for row in result]
    return users