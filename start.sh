#!/bin/bash
set -e

mkdir -p /app/db

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server on port 8000..."
gunicorn erp_system_project.asgi:application -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
