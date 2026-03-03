---
title: Monitoring & Observability
description: Set up metrics, logging, and health monitoring for Cadence
---

# Monitoring & Observability

Comprehensive monitoring and observability setup for Cadence webhook server and analysis operations.

## Health Checks

### Built-in Health Endpoint

```bash
curl http://localhost:8000/health
```

Response:

```json
{
  "status": "ok",
  "time": "2026-02-02T10:30:00Z"
}
```

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  periodSeconds: 30
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 8000
  periodSeconds: 10
  failureThreshold: 2
```

## Prometheus Metrics

### Common Metrics

- `cadence_jobs_total` - Total jobs processed
- `cadence_jobs_duration_seconds` - Job processing duration
- `cadence_queue_depth` - Jobs waiting in queue
- `cadence_analysis_errors_total` - Analysis errors
- `cadence_cache_hits_total` - Cache hit count

### Prometheus Configuration

```yaml
scrape_configs:
  - job_name: 'cadence'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Grafana Queries

```promql
# Throughput (jobs/min)
rate(cadence_jobs_total[5m])

# P95 latency
histogram_quantile(0.95, cadence_jobs_duration_seconds_bucket)

# Cache hit rate
rate(cadence_cache_hits_total[5m]) / (rate(cadence_cache_hits_total[5m]) + rate(cadence_cache_misses_total[5m]))
```

## Structured Logging

### Log Format

```json
{
  "timestamp": "2026-02-02T10:30:00Z",
  "level": "info",
  "component": "webhook",
  "message": "Job completed",
  "duration_ms": 1250
}
```

### Log Levels

- `debug` - Detailed diagnostic information
- `info` - General operational information
- `warn` - Warning messages
- `error` - Error messages
- `fatal` - Fatal errors

### Configuration

```yaml
logging:
  level: "info"
  format: "json"
  output: "stdout"
```

## Log Aggregation

### ELK Stack (Filebeat)

```yaml
filebeat.inputs:
  - type: filestream
    paths:
      - /var/log/cadence/*.log

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "cadence-%{+yyyy.MM.dd}"
```

### CloudWatch

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [{
          "file_path": "/var/log/cadence/*.log",
          "log_group_name": "/aws/cadence/webhook"
        }]
      }
    }
  }
}
```

## Alerting

### Prometheus Rules

```yaml
groups:
  - name: cadence-alerts
    rules:
      - alert: CadenceDown
        expr: up{job="cadence"} == 0
        for: 1m

      - alert: HighErrorRate
        expr: rate(cadence_analysis_errors_total[5m]) > 0.1
        for: 5m

      - alert: QueueBackup
        expr: cadence_queue_depth > 100
        for: 10m
```

### Notification Channels

- Slack
- Email
- PagerDuty

## Custom Metrics

Track:
- Webhook request latency (p50, p95, p99)
- Cache hit/miss rates
- Database query latency
- Repositories analyzed per day

## Dashboards

Key metrics to display:
- Health status
- Jobs processed (total)
- Active jobs
- Queue depth
- Error rate
- Average job duration
- P95 latency
- Memory usage
- CPU usage

## Troubleshooting Monitoring

### High Memory Usage

```bash
# Check metrics
curl http://localhost:8000/metrics | grep memory

# Reduce workers
CADENCE_WEBHOOK_MAX_WORKERS=4
```

### High Latency

```bash
# Check queue
curl http://localhost:8000/metrics | grep queue_depth

# Increase workers
CADENCE_WEBHOOK_MAX_WORKERS=16
```

### Error Rate Spike

```bash
# Check logs
journalctl -u cadence -p err -n 50

# Get metrics
curl http://localhost:8000/metrics | grep error
```

## Next Steps

- [Performance Tuning](/docs/reference/operations/advanced/performance) - Optimize throughput
- [Troubleshooting](/docs/reference/operations/troubleshooting) - Diagnose issues
- [Prometheus Docs](https://prometheus.io/docs) - Advanced setup
