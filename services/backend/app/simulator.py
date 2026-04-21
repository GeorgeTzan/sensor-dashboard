import os
import time
import random
import requests
from sqlmodel import Session, select
from app.db import engine
from app.models import Sensor

API_URL = os.getenv("API_URL", "http://frontend:3000/api/ingest")
SENSOR_API_KEY = os.getenv("SENSOR_API_KEY")

def get_sensor_ids():
    with Session(engine) as session:
        sensors = session.exec(select(Sensor)).all()
        return [str(s.id) for s in sensors]

def run_simulator():
    time.sleep(10)
    
    headers = {"X-Sensor-API-Key": SENSOR_API_KEY}

    while True:
        sensor_ids = get_sensor_ids()
        for s_id in sensor_ids:
            value = round(random.uniform(15.0, 35.0), 2)
            payload = {"sensor_id": s_id, "value": value}
            try:
                requests.post(API_URL, json=payload, headers=headers)
            except Exception:
                pass
        time.sleep(30)

if __name__ == "__main__":
    run_simulator()