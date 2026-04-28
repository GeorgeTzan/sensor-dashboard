from sqlmodel import Session, SQLModel
from app.db import engine
from app.models import Sensor, Measurement, Category

def seed_data():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        if session.query(Category).first():
            return
        
        c1 = Category(name="TEMPERATURE")
        c2 = Category(name="HUMIDITY")
        session.add(c1)
        session.add(c2)
        session.commit()
        session.refresh(c1)
        session.refresh(c2)
        
        s1 = Sensor(name="Living Room Temp", type="TEMPERATURE", description="Main unit", categories=[c1])
        s2 = Sensor(name="Balcony Humidity", type="HUMIDITY", description="Outdoor sensor", categories=[c2])
        session.add(s1)
        session.add(s2)
        session.commit()

if __name__ == "__main__":
    seed_data()