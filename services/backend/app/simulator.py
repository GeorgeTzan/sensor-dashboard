import os
import time
import random
import requests
from sqlmodel import Session, select
from app.db import engine
from app.models import Sensor

API_URL = os.getenv("API_URL", "http://localhost:8000")

def get_sensor_ids():
    with Session(engine) as session:
        sensors = session.exec(select(Sensor)).all()
        return [str(s.id) for s in sensors]

def run_simulator():
    time.sleep(10)
    
    sensor_ids = get_sensor_ids()
    if not sensor_ids:
        return

    while True:
        for s_id in sensor_ids:
            value = round(random.uniform(15.0, 35.0), 2)
            payload = {"sensor_id": s_id, "value": value}
            try:
                requests.post(f"{API_URL}/measurements/ingest", json=payload)
            except Exception:
                pass
        time.sleep(3)

if __name__ == "__main__":
    run_simulator()