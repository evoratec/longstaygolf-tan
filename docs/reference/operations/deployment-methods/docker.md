---
title: Docker Deployment
description: Deploy Cadence using Docker containers
---

# Docker Deployment

Run Cadence in Docker containers for consistent, reproducible deployments across environments.

## Quick Start

### 1. Basic Docker Run

```bash
docker run -d \
  --name cadence-webhook \
  -p 8000:8000 \
  -e CADENCE_AI_KEY="sk-..." \
  -e CADENCE_AI_PROVIDER="openai" \
  -e CADENCE_WEBHOOK_SECRET="webhook-secret" \
  -v /path/to/config:/etc/cadence \
  trycadence/cadence:latest \
  webhook --config /etc/cadence/.cadence.yaml
```

### 2. Check Server Status

```bash
docker exec cadence-webhook cadence version
curl http://localhost:8000/health
```

## Docker Compose Setup

Complete production-ready Docker Compose configuration:

```yaml
version: '3.8'

services:
  cadence-webhook:
    image: trycadence/cadence:latest
    container_name: cadence-webhook
    ports:
      - "8000:8000"
    environment:
      CADENCE_AI_ENABLED: "true"
      CADENCE_AI_PROVIDER: "openai"
      CADENCE_AI_KEY: ${CADENCE_AI_KEY}
      CADENCE_WEBHOOK_PORT: "8000"
      CADENCE_WEBHOOK_SECRET: ${CADENCE_WEBHOOK_SECRET}
      CADENCE_WEBHOOK_HOST: "0.0.0.0"
      CADENCE_WEBHOOK_MAX_WORKERS: "8"
    volumes:
      - ./config/.cadence.yaml:/etc/cadence/.cadence.yaml:ro
      - ./data:/data
      - ./logs:/var/log/cadence
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    networks:
      - cadence
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  reverse-proxy:
    image: nginx:alpine
    container_name: cadence-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - cadence-webhook
    networks:
      - cadence
    restart: unless-stopped

networks:
  cadence:
    driver: bridge

volumes:
  cadence-data:
```

## Environment Variables

Configure Cadence via environment variables in Docker:

```bash
# AI Configuration
CADENCE_AI_ENABLED=true
CADENCE_AI_PROVIDER=openai          # or "anthropic"
CADENCE_AI_KEY=sk-proj-...
CADENCE_AI_MODEL=gpt-4o-mini        # optional

# Webhook Server
CADENCE_WEBHOOK_PORT=8000
CADENCE_WEBHOOK_HOST=0.0.0.0
CADENCE_WEBHOOK_SECRET=your-secret
CADENCE_WEBHOOK_MAX_WORKERS=8
CADENCE_WEBHOOK_READ_TIMEOUT=30
CADENCE_WEBHOOK_WRITE_TIMEOUT=30

# Detection Thresholds
CADENCE_THRESHOLDS_SUSPICIOUS_ADDITIONS=500
CADENCE_THRESHOLDS_MAX_ADDITIONS_PER_MIN=100
CADENCE_THRESHOLDS_MIN_TIME_DELTA_SECONDS=60

# File Exclusions
# CADENCE_EXCLUDE_FILES=*.lock,node_modules/*
```

## Volume Mounts

Mount important directories for persistence and configuration:

```bash
docker run -d \
  -v /path/to/config:/etc/cadence      # Configuration files
  -v /path/to/data:/data               # Analysis cache
  -v /path/to/logs:/var/log/cadence    # Application logs
  trycadence/cadence:latest
```

## Building Custom Docker Image

Create a custom Docker image with your configuration:

```dockerfile
FROM trycadence/cadence:latest

# Copy custom configuration
COPY .cadence.yaml /etc/cadence/.cadence.yaml

# Set environment defaults
ENV CADENCE_WEBHOOK_PORT=8000
ENV CADENCE_AI_ENABLED=true

# Run webhook server
CMD ["webhook", "--config", "/etc/cadence/.cadence.yaml"]
```

Build and run:

```bash
docker build -t my-cadence:latest .
docker run -d -p 8000:8000 \
  -e CADENCE_AI_KEY="sk-..." \
  my-cadence:latest
```

## Docker Networking

### Container to Container Communication

```yaml
services:
  cadence:
    networks:
      - cadence
    
  monitoring:
    networks:
      - cadence
    # Can reach cadence via hostname "cadence"

networks:
  cadence:
    driver: bridge
```

### Access from Host

```bash
# Using container IP
docker inspect cadence-webhook | grep "IPAddress"

# Using port mapping (recommended)
curl http://localhost:8000/health
```

### Expose Multiple Services

```yaml
services:
  cadence-webhook:
    ports:
      - "8000:8000"
    
  cadence-analysis:
    ports:
      - "8001:8000"
```

## Production Best Practices

### 1. Resource Limits

```yaml
services:
  cadence:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 2. Restart Policy

```yaml
restart_policy:
  condition: on-failure
  delay: 5s
  max_attempts: 5
  window: 120s
```

### 3. Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 4. Logging Configuration

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    labels: "cadence.service=webhook"
```

## Troubleshooting

### Container Won't Start

```bash
docker logs cadence-webhook
docker logs -f cadence-webhook  # Follow logs
```

### Out of Memory

Increase memory limit and limit workers:

```bash
docker run -d \
  -m 2g \
  -e CADENCE_WEBHOOK_MAX_WORKERS=4 \
  cadence:latest
```

### Network Issues

Test connectivity:

```bash
docker exec cadence-webhook \
  curl -i http://localhost:8000/health

docker network inspect cadence-network
```

## Next Steps

- [Kubernetes Deployment](/docs/reference/operations/deployment-methods/kubernetes) - Scale to multiple instances
- [Monitoring](/docs/reference/operations/monitoring) - Set up metrics collection
- [Nginx Reverse Proxy](/docs/reference/operations/networking/nginx) - Production HTTPS setup
