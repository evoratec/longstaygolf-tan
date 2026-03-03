---
title: Networking & Load Balancing  
description: Configure networking, reverse proxy, and high availability
---

# Networking & Load Balancing

Production networking setup for Cadence with reverse proxies, load balancing, and high availability.

## Overview

Choose your networking architecture based on your deployment:

| Setup | Method | Complexity | Throughput | Cost |
|-------|--------|-----------|-----------|------|
| **Single Server** | Direct HTTP | Low | Medium | Low |
| **Production** | Nginx + HTTPS | Medium | High | Low |
| **High Availability** | HAProxy + Nginx | High | Very High | Medium |
| **Cloud Native** | Kubernetes Ingress | High | Very High | High |

## Core Components

### 1. Reverse Proxy (Nginx)

Nginx handles:
- SSL/TLS termination
- Request routing
- Rate limiting
- Load balancing across backends

**Setup:** [Nginx Reverse Proxy](/docs/reference/operations/networking/nginx)

### 2. High Availability (HA)

HAProxy provides:
- Health checking
- Automatic failover
- Multi-region support
- Session persistence

**Setup:** [High Availability](/docs/reference/operations/ha)

## Quick Setup Guide

### Scenario 1: Single Server with HTTPS

```
┌──────────────┐
│   GitHub     │
│  Webhooks    │
└──────┬───────┘
       │ HTTPS
       ▼
╔══════════════╗
║    Nginx     ║
║  (SSL/TLS)   ║
╚──────┬───────╝
       │ :8000
       ▼
┌──────────────┐
│   Cadence    │
│   Webhook    │
└──────────────┘
```

Time: 20 minutes
Cost: Low

**Setup Steps:**

1. [Install Nginx](/docs/reference/operations/networking/nginx)
2. Install SSL certificate
3. Configure proxy
4. Enable HTTPS redirect

### Scenario 2: High Availability (3+ servers)

```
┌──────────────┐
│   GitHub     │ 
│  Webhooks    │
└──────┬───────┘
       │ HTTPS
       ▼
╔══════════════════════════════╗
║  Nginx/HAProxy Load Balancer ║
║  (SSL + Health Checks)       ║
╚──────┬───────┬───────┬───────╝
       │       │       │
    :8000   :8001   :8002  
       │       │       │
       ▼       ▼       ▼
      ┌────┬────┬────┐
      │    │    │    │
    Cadence instances (3+)
    Shared Redis Cache
    Shared PostgreSQL (replicated)
```

Time: 1-2 hours
Cost: Medium (3+ servers)

**Setup Steps:**

1. Install Cadence on 3+ servers
2. Setup Redis cluster for shared cache
3. Setup PostgreSQL replication
4. Configure HAProxy with health checks
5. Setup Nginx for SSL/TLS
6. Configure DNS failover

## Common Patterns

### Pattern 1: Direct HTTPS (Single Server)

```nginx
server {
    listen 443 ssl;
    server_name cadence.example.com;
    
    ssl_certificate /etc/letsencrypt/certificate.pem;
    ssl_certificate_key /etc/letsencrypt/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
    }
}
```

### Pattern 2: Load Balanced (Multiple Servers)

```nginx
upstream cadence_backend {
    server 10.0.1.10:8000;
    server 10.0.1.11:8000;
    server 10.0.1.12:8000;
}

server {
    listen 443 ssl;
    
    location / {
        proxy_pass http://cadence_backend;
    }
}
```

### Pattern 3: Geo-Distributed (Multiple Regions)

```
Primary Region          Secondary Region
┌──────────────────    └──────────────────┐
│ Cadence x3           │ Cadence x3       │
│ Nginx LB             │ Nginx LB         │
└──────────────────→ ⟷←──────────────────┘
                  DNS Failover
```

## Deployment Checklist

- [ ] HTTPS certificate obtained (Let's Encrypt or custom)
- [ ] Nginx installed and configured
- [ ] Webhook secret configured
- [ ] Rate limiting enabled
- [ ] Health checks working
- [ ] Load balancer failover tested
- [ ] Monitoring alerts configured
- [ ] Backup/recovery plan documented

## Next Steps

- [Nginx Configuration](/docs/reference/operations/networking/nginx) - Reverse proxy setup
- [High Availability](/docs/reference/operations/ha) - Multi-instance failover
- [Monitoring](/docs/reference/operations/monitoring) - Health monitoring
