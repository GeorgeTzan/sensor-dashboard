from sqlmodel import Session, create_engine, SQLModel
from app.models import Sensor, Measurement
import os

engine = create_engine(os.getenv("DATABASE_URL"), echo=True)

def seed_data():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        if session.query(Sensor).first():
            return
        
        s1 = Sensor(name="Living Room Temp", type="TEMPERATURE", description="Main unit")
        s2 = Sensor(name="Balcony Humidity", type="HUMIDITY", description="Outdoor sensor")
        session.add(s1)
        session.add(s2)
        session.commit()

if __name__ == "__main__":
    seed_data()