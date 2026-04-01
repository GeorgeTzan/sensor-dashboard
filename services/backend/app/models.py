from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
import uuid

class Sensor(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    measurements: List["Measurement"] = Relationship(back_populates="sensor")

class Measurement(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    sensor_id: uuid.UUID = Field(foreign_key="sensor.id")
    value: float
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    sensor: Sensor = Relationship(back_populates="measurements")