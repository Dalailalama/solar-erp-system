#!/bin/bash
set -e

PROJECT_DIR="/root/solar-erp-system"
REPO_URL="https://github.com/Dalailalama/solar-erp-system.git"

echo "========== STEP 1: Install system dependencies =========="
apt update && apt install -y python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib libpq-dev build-essential libffi-dev libjpeg-dev zlib1g-dev

echo "========== STEP 2: Clone repo & setup =========="
rm -rf $PROJECT_DIR
git clone $REPO_URL $PROJECT_DIR
cd $PROJECT_DIR

# Create .env
cat > .env << 'EOF'
SECRET_KEY=django-insecure-24mTi3JnE3qsEmubl8g7yHzQvvaYtXr9Kp2Wm4Nz
DEBUG=False
ALLOWED_HOSTS=212.38.94.125,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://212.38.94.125
DATABASE_URL=postgres://ultrarays_user:UltrabuildPasshaha890@localhost:5432/ultrarays_db
CORS_ALLOWED_ORIGINS=http://212.38.94.125
DJANGO_VITE_DEV_MODE=False
VITE_DEV_SERVER_URL=http://127.0.0.1:5173
VITE_DEV_SERVER_HOST=127.0.0.1
VITE_DEV_SERVER_PROTOCOL=http
VITE_DEV_SERVER_PORT=5173
VITE_BACKEND_ORIGIN=http://212.38.94.125
VITE_WS_ORIGIN=ws://212.38.94.125
EOF

# Setup Postgres DB
sudo -u postgres psql -c "CREATE USER ultrarays_user WITH PASSWORD 'UltrabuildPasshaha890';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE ultrarays_db OWNER ultrarays_user;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ultrarays_db TO ultrarays_user;" 2>/dev/null || true

# Build frontend
npm install
npm run build

# Setup Python venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Django setup
python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "========== STEP 3: Create systemd service & start =========="
cat > /etc/systemd/system/solar.service << EOF
[Unit]
Description=Solar ERP Django App
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=$PROJECT_DIR
Environment="PATH=$PROJECT_DIR/venv/bin:/usr/bin"
EnvironmentFile=$PROJECT_DIR/.env
ExecStart=$PROJECT_DIR/venv/bin/gunicorn erp_system_project.asgi:application -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable solar
systemctl restart solar

echo ""
echo "========== DONE! =========="
echo "Your app is live at: http://212.38.94.125:8000/"
echo "Check status: systemctl status solar"
echo "Check logs:   journalctl -u solar -f"
