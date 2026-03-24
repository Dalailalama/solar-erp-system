# Stage 1: Build Vue3 Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
# Copy npm package control files
COPY package.json package-lock.json* ./
# Install npm dependencies
RUN npm install
# Copy frontend and configuration files needed for Vite
COPY . .
# Build Vue3 components (outputs to static/dist/assets)
RUN npm run build

# Stage 2: Build Django Backend
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install essential system packages required for Postgres and python builds
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libffi-dev \
    python3-dev \
    pkg-config \
    zlib1g-dev \
    libjpeg-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files from local repository
COPY . .

# Copy built static assets from Stage 1 into the target output directory
COPY --from=frontend-builder /app/static/dist /app/static/dist

# Ensure the executable bits are set on the start script
RUN chmod +x start.sh

# Expose Django port
EXPOSE 8000

# Set entrypoint mapping to our startup script
ENTRYPOINT ["./start.sh"]
