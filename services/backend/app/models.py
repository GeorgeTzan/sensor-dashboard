from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
import uuid

class SensorCategoryLink(SQLModel, table=True):
    sensor_id: uuid.UUID = Field(foreign_key="sensor.id", primary_key=True)
    category_id: uuid.UUID = Field(foreign_key="category.id", primary_key=True)

class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    sensors: List["Sensor"] = Relationship(back_populates="categories", link_model=SensorCategoryLink)

class Sensor(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    measurements: List["Measurement"] = Relationship(back_populates="sensor")
    categories: List[Category] = Relationship(back_populates="sensors", link_model=SensorCategoryLink)

class Measurement(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    sensor_id: uuid.UUID = Field(foreign_key="sensor.id")
    value: float
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    sensor: Sensor = Relationship(back_populates="measurements")