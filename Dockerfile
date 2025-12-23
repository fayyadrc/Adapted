# Single Container Dockerfile for Adapted MVP
# Builds React frontend and serves everything from Flask

# ============== Stage 1: Build Frontend ==============
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
# Use npm install for better compatibility across npm versions
RUN npm install --legacy-peer-deps
COPY frontend/ ./

# Build React app for production
# These MUST be set as build args since Vite bakes them into the bundle
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL=/api

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# ============== Stage 2: Production Server ==============
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code (preserve structure for imports like 'from backend.app import')
COPY backend/ ./backend/

# Copy frontend build from stage 1 into static folder
COPY --from=frontend-builder /app/frontend/dist ./backend/static/frontend

# Set environment variables
ENV FLASK_ENV=production
ENV STATIC_FOLDER=static/frontend
ENV PORT=8080
ENV PYTHONPATH=/app

# Expose port (Leapcell typically uses 8080)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run with Gunicorn from project root (matches import structure)
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "--threads", "4", "--timeout", "120", "--chdir", "/app", "backend.run:app"]
