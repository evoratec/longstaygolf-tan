---
title: Performance Tuning
description: Optimize Cadence for maximum throughput and minimum latency
---

# Performance Tuning Guide

Optimize Cadence for production workloads with configuration tuning, resource management, and monitoring.

## Performance Baseline

| Metric | Value | Notes |
|--------|-------|-------|
| Throughput | 10-160 jobs/min | Depends on repo size and workers |
| Memory (idle) | ~50MB | Just the binary |
| Memory (active) | 200MB-1GB | Varies with repo size |
| Latency (small repo) | 2-5s | 10-50 commits |
| Latency (medium repo) | 10-30s | 100-500 commits |
| Latency (large repo) | 30-120s | 1000+ commits |

## Key Optimization Areas

### 1. Worker Pool Tuning (HIGHEST IMPACT)

**Formula:** Workers = (CPU Cores × 1.5) - 1

```bash
# 4-core machine
MAX_WORKERS=5

# 8-core machine  
MAX_WORKERS=11

# 16-core machine
MAX_WORKERS=23
```

### 2. Memory Management

```bash
# Limit cache size
CACHE_MAX_SIZE=1gb

# Garbage collection tuning
GOGC=50    # Aggressive GC
GOGC=200   # For throughput

# Set hard limit (systemd)
MemoryMax=2G
```

### 3. Caching Strategy

```bash
# Multi-level caching
L1_CACHE: In-memory (fast, limited)
L2_CACHE: Redis (distributed)
L3_CACHE: Database (persistent)

# Cache invalidation
CACHE_TTL=3600  # 1 hour
CACHE_INVALIDATE_ON_PUSH=true
```

### 4. Database Optimization

```sql
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_timestamp ON jobs(created_at DESC);

-- Connection pooling
pool_size = 50
```

### 5. Detection Strategy Selection

```bash
# Run only needed strategies for speed
cadence analyze repo --strategy velocity,timing,size

# Strategy performance ranking:
# Fast: Velocity, Timing, Size (100-500ms)
# Medium: Pattern, Ratio (500ms-2s)
# Slow: Error Handling, Template (5-10s)
```

## Monitoring Performance

### Key Metrics

```bash
# Throughput (jobs/min)
rate(cadence_jobs_total[5m])

# Average latency
rate(cadence_jobs_duration_seconds_sum[5m]) / rate(cadence_jobs_total[5m])

# P95 latency (target: <30s)
histogram_quantile(0.95, cadence_jobs_duration_seconds_bucket)

# Queue depth (target: <10)
cadence_queue_depth

# Cache hit rate (target: >60%)
rate(cadence_cache_hits_total[5m]) / (rate(cadence_cache_hits_total[5m]) + rate(cadence_cache_misses_total[5m]))
```

### Performance Rules

```yaml
- alert: HighLatency
  expr: histogram_quantile(0.95, cadence_jobs_duration_seconds_bucket) > 30
  for: 5m

- alert: LowThroughput
  expr: rate(cadence_jobs_total[5m]) < 5
  for: 10m
  
- alert: QueueBackup
  expr: cadence_queue_depth > 100
  for: 10m
```

## Scaling

### Single Machine Max
- Per 8-core CPU: ~80 jobs/min
- Memory: Use caching for unlimited scale
- Storage: SSD essential for large repos

### Horizontal Scaling
When single machine maxes out:

```yaml
# Kubernetes replicas
replicas: 5  # 5 × 8-core = 40 cores = ~320 jobs/min
```

## Quick Start Optimization

1. **Set MAX_WORKERS** to (cores × 1.5) - 1
2. **Enable Redis** for shared caching
3. **Monitor** throughput and latency
4. **Adjust** based on metrics
5. **Scale** replicas when needed

## Full Optimization Guide

See [Performance Tuning](/docs/reference/operations/advanced/performance) for:
- Detailed worker tuning procedures
- Memory leak detection
- CPU affinity configuration
- Disk I/O optimization
- Network optimization
- AI provider optimization
- Load testing procedures
- Benchmarking methodology

## Next Steps

- [Monitoring](/docs/reference/operations/monitoring) - Real-time tracking
- [High Availability](/docs/reference/operations/ha) - Multi-instance scaling
- [Troubleshooting](/docs/reference/operations/troubleshooting) - Diagnose issues
