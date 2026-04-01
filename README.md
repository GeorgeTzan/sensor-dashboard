# Sensor Dashboard

This project is a web application for monitoring and managing sensor data, built for the Web Applications and Databases course at the University of Ioannina (Spring 2026).

It allows users to view real-time measurements like temperature and humidity through a dashboard, while providing administrative tools for managing sensors and user accounts.

## Tech stack

The application is split into a frontend that handles authentication and a backend that manages the data.

- Frontend: Next.js 16 (React 19) with Tailwind CSS 4 and Shadcn UI.
- Authentication: BetterAuth for session management and role-based access.
- Charts: Recharts for time-series visualization.
- Data fetching: React Query for automatic updates.
- Backend: FastAPI (Python) for the core data logic.
- Database: PostgreSQL.
- Deployment: Docker Compose for running all services together.

## Architecture

We use a Backend-For-Frontend (BFF) pattern. The browser only talks to the Next.js server. Next.js checks if the user is logged in and then fetches data from the internal FastAPI service. This keeps the database and the core API hidden from the public internet.

## API endpoints

### Backend (Internal)

These are used by the Next.js server and the sensor simulator.

- GET /sensors: List all available sensors.
- GET /sensors/{id}: Get detailed info and history for a specific sensor.
- POST /sensors: Create a new sensor (Admin only).
- POST /measurements/ingest: The bonus endpoint for receiving automated data from external sources.
- GET /users: List active users (Admin only).

### Frontend (Public Proxy)

- /api/proxy/*: All requests to these routes are verified for a valid user session before being forwarded to the backend.
- /api/ingest: A special endpoint open to the public internet for external hardware sensors. Instead of a user session, it requires a secret API Key to allow data through to the backend.

## Bonus implementation

To satisfy the bonus requirement for automated data ingestion, the project includes a sensor simulator service. This service runs in a separate container and sends randomized measurement data to the `/measurements/ingest` endpoint every few seconds, simulating real hardware.

## Setup

To start the entire system, ensure you have Docker installed and run:

docker compose up --build

The dashboard will be available at http://localhost:3000.
