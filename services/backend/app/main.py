from fastapi import FastAPI
from sqlmodel import create_engine, SQLModel
import os
from app.models import Sensor, Measurement

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

app = FastAPI(title="Sensor Dashboard API")

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.get("/health")
def health_check():
    return {"status": "online"}