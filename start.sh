#!/bin/bash
set -e

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Gunicorn server with Uvicorn worker class for ASGI setup
echo "Starting server..."
gunicorn erp_system_project.asgi:application -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
