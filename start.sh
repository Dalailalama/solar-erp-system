#!/bin/bash
set -e

# Wait for Postgres to be ready
echo "Waiting for database..."
while ! python -c "
import socket, sys, os
try:
    from urllib.parse import urlparse
    url = urlparse(os.environ.get('DATABASE_URL', ''))
    host = url.hostname or 'db'
    port = url.port or 5432
    s = socket.create_connection((host, port), timeout=2)
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    echo "Database not ready, retrying in 2s..."
    sleep 2
done
echo "Database is ready!"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server on port 8000..."
gunicorn erp_system_project.asgi:application -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
