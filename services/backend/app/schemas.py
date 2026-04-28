from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class CategoryRead(BaseModel):
    id: uuid.UUID
    name: str

class MeasurementCreate(BaseModel):
    sensor_id: uuid.UUID
    value: float

class MeasurementRead(BaseModel):
    id: uuid.UUID
    value: float
    timestamp: datetime

class SensorRead(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    type: str
    categories: List[CategoryRead] = []

class SensorWithMeasurements(SensorRead):
    measurements: List[MeasurementRead] = []

class SensorCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    category_ids: List[uuid.UUID] = []

class SensorUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    category_ids: Optional[List[uuid.UUID]] = None