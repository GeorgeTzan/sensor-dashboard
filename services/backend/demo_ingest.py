import requests
import random
import time
import sys
import os

BASE_URL = os.getenv("INGEST_URL", "http://localhost:3000/api/ingest")
API_KEY = os.getenv("SENSOR_API_KEY", "sensor_secret_key_123")

def get_sensors():
    try:
        response = requests.get("http://localhost:8000/sensors")
        response.raise_for_status()
        return response.json()
    except Exception:
        try:
            response = requests.get("http://localhost:3000/api/proxy/sensors")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching sensors: {e}")
            return []

def ingest_measurement(sensor_id, value):
    payload = {
        "sensor_id": sensor_id,
        "value": value
    }
    headers = {
        "x-sensor-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(BASE_URL, json=payload, headers=headers)
        if response.status_code == 401:
            print(f"Error: Unauthorized. Please check your SENSOR_API_KEY.")
            sys.exit(1)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"Error ingesting data: {e}")
        return False

def main():
    print("--- Sensor Data Ingestion Simulator ---")
    print(f"Targeting API: {BASE_URL}")
    
    sensors = get_sensors()
    
    if not sensors:
        print("No sensors found. Please ensure the system is running and seeded.")
        sys.exit(1)
    
    print(f"Found {len(sensors)} sensors. Starting ingestion loop...")
    print("Press Ctrl+C to stop.\n")
    
    try:
        while True:
            for sensor in sensors:
                s_id = sensor['id']
                s_name = sensor['name']
                
                if "TEMP" in sensor['type'].upper():
                    value = round(random.uniform(18.0, 28.0), 2)
                else:
                    value = round(random.uniform(35.0, 55.0), 2)
                
                success = ingest_measurement(s_id, value)
                if success:
                    print(f"[{time.strftime('%H:%M:%S')}] OK -> {s_name}: {value}")
                
            time.sleep(5)
    except KeyboardInterrupt:
        print("\nSimulation stopped.")

if __name__ == "__main__":
    main()
