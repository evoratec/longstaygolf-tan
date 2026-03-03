---
title: Advanced Operations
description: Migration, performance tuning, and optimization
---

# Advanced Operations

Advanced topics for production operations including migration, performance optimization, and troubleshooting.

## Key Topics

### Migration & Upgrades
Moving between versions and deployment methods

- [Migration & Upgrades](/docs/reference/operations/advanced/migration) - Version upgrades, deployment migration
- Upgrade paths and compatibility
- Zero-downtime deployments
- Rollback procedures

**When to use:** Upgrading Cadence versions, moving from Docker to Kubernetes

### Performance Tuning
Optimization for maximum throughput and minimum latency

- [Performance Tuning](/docs/reference/operations/advanced/performance) - Worker optimization, caching, resource management
- Worker pool tuning
- Memory and CPU optimization
- Database performance
- Caching strategies

**When to use:** Slow analysis, insufficient throughput, high latency p99

## Quick Links

- [Troubleshooting](/docs/reference/operations/troubleshooting) - Error resolution
- [Monitoring](/docs/reference/operations/monitoring) - Metrics and observability
- [Security](/docs/reference/operations/security) - Hardening and policies

## Optimization Decision Tree

```
Are you experiencing issues?
├─ Slow analysis?
│  ├─ High resource usage? → [Performance Tuning](/docs/reference/operations/advanced/performance)
│  └─ Broken features? → [Troubleshooting](/docs/reference/operations/troubleshooting)
│
├─ Need to upgrade?
│  ├─ Major version? → [Migration](/docs/reference/operations/advanced/migration)
│  └─ Minor version? → [Migration](/docs/reference/operations/advanced/migration)
│
└─ Normal operations?
   ├─ Monitor and maintain → [Monitoring](/docs/reference/operations/monitoring)
   └─ Harden security → [Security](/docs/reference/operations/security)
```

## Next Steps

1. Identify your specific need (upgrade, optimization, troubleshooting)
2. Navigate to the appropriate guide
3. Follow the step-by-step procedures
4. Monitor your changes with [Monitoring](/docs/reference/operations/monitoring)
