#!/bin/sh

echo "Starting frontend production flow..."
npm run build
exec npm run start -- -H 0.0.0.0
