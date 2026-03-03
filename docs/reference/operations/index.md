---
title: Operations Hub
description: Production deployment, operations, and infrastructure
---

# Operations & Infrastructure

Comprehensive guide for deploying, configuring, and operating Cadence in production environments.

## Core Topics

### 1. Deployment Methods
Choose and implement the right deployment method

- [Deployment Methods Overview](/docs/reference/operations/deployment-methods) - Choose your method
- [Binary Installation](/docs/reference/operations/deployment-methods/binary) - Precompiled binaries (5 min)
- [Docker Deployment](/docs/reference/operations/deployment-methods/docker) - Container setup (10 min)
- [systemd Service](/docs/reference/operations/deployment-methods/systemd) - Linux service (15 min)
- [Kubernetes](/docs/reference/operations/deployment-methods/kubernetes) - Enterprise deployment (30 min)

### 2. Networking & Load Balancing
Production networking setup for reliability

- [Networking Hub](/docs/reference/operations/networking) - Architecture overview
- [Nginx Reverse Proxy](/docs/reference/operations/networking/nginx) - SSL/TLS and load balancing
- [High Availability](/docs/reference/operations/networking/ha) - Multi-instance failover and disaster recovery

### 3. Core Operations
Ongoing operational tasks

- [Monitoring](/docs/reference/operations/monitoring) - Metrics, logging, and alerting
- [Security](/docs/reference/operations/security) - Hardening and policies
- [Troubleshooting](/docs/reference/operations/troubleshooting) - Error resolution

### 4. Advanced Topics
Optimization and migration

- [Advanced Operations Hub](/docs/reference/operations/advanced) - Performance and upgrades
- [Migration & Upgrades](/docs/reference/operations/advanced/migration) - Version upgrades and deployment migration
- [Performance Tuning](/docs/reference/operations/advanced/performance) - Throughput optimization

## Quick Decision Tree

```
What's your current situation?

├─ Just starting?
│  └─ [Deployment Methods](/docs/reference/operations/deployment-methods) →
│     Choose: Binary, Docker, systemd, or Kubernetes
│
├─ Already deployed?
│  ├─ Seeing issues?
│  │  └─ [Troubleshooting](/docs/reference/operations/troubleshooting)
│  ├─ Need monitoring?
│  │  └─ [Monitoring](/docs/reference/operations/monitoring)
│  └─ Under load?
│     └─ [Performance Tuning](/docs/reference/operations/advanced/performance)
│
├─ Need to upgrade?
│  └─ [Migration & Upgrades](/docs/reference/operations/advanced/migration)
│
├─ Need high availability?
│  └─ [High Availability](/docs/reference/operations/networking/ha)
│
└─ Need to harden security?
   └─ [Security](/docs/reference/operations/security)
```

## Deployment Comparison

| Aspect | Binary | Docker | systemd | Kubernetes |
|--------|--------|--------|---------|------------|
| **Setup Time** | 5 min | 10 min | 15 min | 30+ min |
| **Complexity** | Low | Low | Medium | High |
| **Scalability** | Single host | Multi-container | Single host | Unlimited |
| **HA Support** | Manual | Via compose | Manual | Built-in |
| **Cost** | Infrastructure only | Infrastructure + resources | Infrastructure | Infrastructure + complexity |
| **Best For** | Testing | Dev/CI-CD | Production (single) | Enterprise |

## Implementation Path

### 1. Choose Deployment
→ [Deployment Methods](/docs/reference/operations/deployment-methods)

### 2. Initial Setup
→ Follow specific deployment guide

### 3. Production Hardening
→ [Security](/docs/reference/operations/security)

### 4. Setup Monitoring
→ [Monitoring](/docs/reference/operations/monitoring)

### 5. Optimize Performance
→ [Performance Tuning](/docs/reference/operations/advanced/performance)

### 6. Setup HA (if needed)
→ [High Availability](/docs/reference/operations/networking/ha)

## Configuration Reference

### Environment Variables

Core variables for all deployments:

```bash
# AI Configuration
CADENCE_AI_PROVIDER=anthropic  # or "openai"
CADENCE_AI_KEY=sk-ant-xxx      # Your API key
CADENCE_AI_BASE_URL=https://api.anthropic.com/v1

# Webhook Server
CADENCE_WEBHOOK_PORT=8000
CADENCE_WEBHOOK_SECRET=your-secret-key
CADENCE_WEBHOOK_MAX_WORKERS=8

# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Detection Thresholds
CADENCE_THRESHOLDS_SUSPICIOUS_ADDITIONS=500
CADENCE_THRESHOLDS_MAX_ADDITIONS_PER_MIN=100
```

See [Configuration](/docs/getting-started/configuration) for complete reference.

## Debugging & Support

### Troubleshooting
→ [Troubleshooting Guide](/docs/reference/operations/troubleshooting)

### Monitoring Health
→ [Monitoring Guide](/docs/reference/operations/monitoring)

### Logs

```bash
# View recent logs
sudo journalctl -u cadence -n 50

# Follow logs in real-time
sudo journalctl -u cadence -f

# Enable debug logging
LOG_LEVEL=debug systemctl restart cadence
```

### Health Check

```bash
curl http://localhost:8000/health
```

## Related Documentation

- [Getting Started](/docs/getting-started) - Initial setup
- [CLI Commands](/docs/cli/commands) - Command reference
- [Configuration](/docs/getting-started/configuration) - Config options
- [Webhooks](/docs/integrations/webhooks) - Integration setup

## Next Steps

1. Choose your deployment method
2. Follow implementation guide
3. Setup monitoring
4. Optimize for your workload
5. Keep systems updated and secure

## Support

- **Issues:** [GitHub Issues](https://github.com/TryCadence/Cadence/issues)
- **Discussions:** [GitHub Discussions](https://github.com/TryCadence/Cadence/discussions)
- **Security:** Report privately via security policy
