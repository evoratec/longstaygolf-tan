---
title: High Availability Deployment
description: Deploy Cadence for high availability and fault tolerance
---

# High Availability Deployment

Production-grade high availability setup for Cadence with multiple instances, redundancy, failover, and load balancing.

## Architecture Overview

```
GitHub/GitLab Webhooks
        │ HTTPS
        ▼
    ┌─────────────────┐
    │  Load Balancer  │ (HAProxy + Nginx)
    └────────┬────────┘
    ┌────────┴────────┐
    │        │        │
    ▼        ▼        ▼
Cadence-1 Cadence-2 Cadence-3
  :8001     :8001     :8001
    │        │        │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
 Redis Cluster   PostgreSQL
  (3+ nodes)       (Primary)
                      │
                      ▼
                  PostgreSQL
                  (Replica)
```

## Prerequisites

- 3+ servers minimum (for quorum)
- Shared Redis cluster
- PostgreSQL replication
- Load balancer (HAProxy)
- Monitoring system

## Multi-Instance Setup

### 1. Configure Multiple Instances

Create separate systemd services for each instance:

```bash
# Instance 1: Port 8001
# Instance 2: Port 8002  
# Instance 3: Port 8003
```

### 2. Shared Cache with Redis

```bash
# Install Redis
sudo apt-get install -y redis-server

# Configure cluster
cat <<EOF | sudo tee /etc/redis/redis-cluster.conf
port 6379
cluster-enabled yes
appendonly yes
maxmemory 2gb
maxmemory-policy allkeys-lru
EOF
```

### 3. PostgreSQL Replication

```bash
# Primary configuration
listen_addresses = '*'
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10

# Replica configuration
standby_mode = 'on'
primary_conninfo = 'host=primary.example.com user=replicator'
```

### 4. Load Balancer (HAProxy)

```ini
# /etc/haproxy/haproxy.cfg

global
    maxconn 4096
    daemon

defaults
    mode http
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend cadence_front
    bind *:80
    bind *:443 ssl crt /etc/ssl/cadence.pem
    http-request redirect scheme https code 301 if !{ ssl_fc }
    default_backend cadence_back

backend cadence_back
    balance roundrobin
    option httpchk GET /health HTTP/1.1
    
    server cadence1 10.0.1.10:8001 check fall 3 rise 2
    server cadence2 10.0.1.11:8001 check fall 3 rise 2
    server cadence3 10.0.1.12:8001 check fall 3 rise 2

listen stats
    bind *:8404
    stats enable
    stats uri /stats
```

### 5. Verify Failover

Test automatic failover:

```bash
# Stop one instance
sudo systemctl stop cadence-webhook@1

# Verify others still handle traffic
curl http://noslop.example.com/health

# Restart
sudo systemctl start cadence-webhook@1
```

## Monitoring & Alerting

### Prometheus Rules

```yaml
groups:
- name: cadence_ha
  rules:
  - alert: CadenceNodeDown
    expr: up{job="cadence"} == 0
    for: 2m
    annotations:
      summary: "Cadence instance down"
  
  - alert: ClusterDegraded
    expr: count(up{job="cadence"}) < 2
    for: 1m
    annotations:
      summary: "Less than 2 instances running"
```

## Disaster Recovery

### Backup Strategy

```bash
# Daily backups
0 2 * * * pg_dump cadence | gzip > /backups/pg-$(date +%Y%m%d).sql.gz
redis-cli BGSAVE && cp /var/lib/redis/dump.rdb /backups/redis-$(date +%Y%m%d).rdb
```

### Recovery Procedure

```bash
# Restore PostgreSQL
gunzip < /backups/pg-20240202.sql.gz | psql -d cadence

# Restore Redis
cp /backups/redis-20240202.rdb /var/lib/redis/dump.rdb
systemctl restart redis-server

# Verify health
for i in 1 2 3; do
  curl -s http://cadence-$i:8000/health | jq .
done
```

## Multi-Region Setup

For global high availability:

```
Region 1 (US-East)       Region 2 (EU-West)
┌──────────────────┐     ┌──────────────────┐
│  Cadence x3      │     │  Cadence x3      │
│  Redis Cluster   │◄────►  Redis Cluster   │
│  Postgres Prim   │     │  Postgres Sec    │
└──────────────────┘     └──────────────────┘
        │                          │
        └──────────────┬───────────┘
                   DNS Failover
```

## Next Steps

- [Nginx Reverse Proxy](/docs/reference/operations/networking/nginx) - Load balancing
- [Monitoring](/docs/reference/operations/monitoring) - Health monitoring
- [Performance Tuning](/docs/reference/operations/advanced/performance) - Optimization
