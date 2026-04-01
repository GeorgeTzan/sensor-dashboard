#!/bin/bash
COMMAND=$1

if [ "$COMMAND" == "dump" ]; then
    docker exec -t sensor-db pg_dump -U admin sensor_dashboard > dump.sql
    echo "Database dumped to dump.sql"
elif [ "$COMMAND" == "seed" ]; then
    docker exec -t sensor-backend /app/.venv/bin/python -m app.seed
    echo "Database seeded with initial data"
fi