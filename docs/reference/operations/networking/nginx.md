---
title: Nginx Reverse Proxy
description: Set up Nginx as reverse proxy for Cadence webhook server
---

# Nginx Reverse Proxy Configuration

Production-grade Nginx configuration for Cadence webhook server with SSL/TLS, load balancing, rate limiting, and logging.

## Basic Setup

### 1. Install Nginx

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

**CentOS/RHEL:**

```bash
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Create Cadence Upstream Configuration

Create `/etc/nginx/conf.d/cadence-upstream.conf`:

```nginx
upstream cadence_webhook {
    keepalive 32;
    server 127.0.0.1:8001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8002 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8003 weight=1 max_fails=3 fail_timeout=30s;
}
```

### 3. Main Cadence Server Block

Create `/etc/nginx/sites-available/cadence`:

```nginx
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name cadence.example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cadence.example.com;

    ssl_certificate /etc/letsencrypt/live/cadence.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cadence.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS header
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=1000r/m;

    # Webhook endpoints
    location /webhooks/ {
        limit_req zone=webhook_limit burst=50 nodelay;
        
        proxy_pass http://cadence_webhook;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://cadence_webhook;
        access_log off;
    }

    # Metrics
    location /metrics {
        proxy_pass http://cadence_webhook;
        allow 10.0.0.0/8;
        deny all;
    }

    # Catch-all
    location / {
        proxy_pass http://cadence_webhook;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

### 4. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/cadence /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/TLS Setup with Let's Encrypt

### Install Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
sudo certbot certonly --nginx -d cadence.example.com
```

### Auto-Renewal

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
sudo certbot renew --dry-run
```

## Advanced Configuration

### Load Balancing Strategies

```nginx
upstream cadence_webhook {
    least_conn;  # Route to server with fewest connections
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}
```

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=1000r/m;
limit_req_zone $http_x_github_delivery zone=github_limit:10m rate=100r/m;

location /webhooks/github {
    limit_req zone=webhook_limit burst=50 nodelay;
    limit_conn addr_limit 10;
    proxy_pass http://cadence_webhook;
}
```

## Monitoring & Logging

```nginx
access_log /var/log/nginx/cadence_access.log;
error_log /var/log/nginx/cadence_error.log warn;

# Custom log format
log_format cadence '$remote_addr [$time_local] "$request" $status $body_bytes_sent rt=$request_time urt="$upstream_response_time"';
access_log /var/log/nginx/cadence_access.log cadence;
```

## Troubleshooting

### Configuration Validation

```bash
sudo nginx -t
sudo nginx -T | grep cadence
```

### Connection Issues

```bash
curl -I http://127.0.0.1:8001/health
```

## Next Steps

- [High Availability](/docs/reference/operations/ha) - Multi-node failover
- [Monitoring](/docs/reference/operations/monitoring) - Metrics collection
