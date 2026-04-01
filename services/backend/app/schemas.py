from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

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

class SensorWithMeasurements(SensorRead):
    measurements: List[MeasurementRead] = []