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
# Set the API URL to same origin since Flask serves both
ENV VITE_API_URL=/api
RUN npm run build

# ============== Stage 2: Production Server ==============
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy frontend build from stage 1 into static folder
COPY --from=frontend-builder /app/frontend/dist ./static/frontend

# Set environment variables
ENV FLASK_ENV=production
ENV STATIC_FOLDER=static/frontend
ENV PORT=8080

# Expose port (Leapcell typically uses 8080)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "--threads", "4", "--timeout", "120", "run:app"]
