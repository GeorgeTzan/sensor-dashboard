#!/bin/sh

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
npx @better-auth/cli migrate --yes

echo "Setting up initial users and roles..."
npx ts-node setup-roles.ts
npx ts-node create-admin.ts || echo "Admin already exists or failed"

echo "Starting frontend application..."
exec npm run dev -- -H 0.0.0.0
