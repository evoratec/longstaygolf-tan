---
title: Deployment Methods
description: Choose and implement the right deployment method for your needs
---

# Deployment Methods

Complete guide to choosing and implementing the ideal deployment method for your Cadence installation.

## Quick Comparison

| Method | Best For | Setup Time | Scalability | Expertise | Cost |
|--------|----------|-----------|-------------|-----------|------|
| **Binary** | Single server, testing, quick setup | 5 min | Single host | Minimal | Free |
| **Docker** | Cloud-native, local development, CI/CD | 10 min | Multi-container | Basic | Free (+ infra) |
| **systemd** | Linux servers, single instance, production | 15 min | Single host | Medium | Free (+ CPU) |
| **Kubernetes** | Enterprise, HA, auto-scaling, multi-region | 30 min | Unlimited | Advanced | Free (+ infra) |

## Decision Tree

```
What scale do you need?

├─ Testing/Development
│  ├─ Quick start? → Binary ✅
│  └─ Local containers? → Docker Compose ✅
│
├─ Production - Single Server
│  ├─ Max simplicity? → Binary
│  └─ Full management? → systemd ✅
│
├─ Production - Multiple Servers
│  ├─ Simple setup? → Docker + Load Balancer
│  └─ Enterprise grade? → Kubernetes ✅
│
└─ High Availability / Global
   └─ Multi-region? → Kubernetes + Helm ✅
```

## Method Overview

### 1. Binary Installation
**When:** Testing, single server, simple deployments

**Pros:**
- Minimal dependencies
- Fast startup (~1 second)
- Direct OS integration
- Easy debugging

**Cons:**
- Single process only
- Manual restart management
- Limited to one server

**Setup:** [Binary Installation](/docs/reference/operations/deployment-methods/binary)

### 2. Docker
**When:** Cloud deployments, containerized workflow, development

**Pros:**
- Environment isolation
- Easy versioning
- Multi-container orchestration
- Reproducible across machines

**Cons:**
- Slight overhead (~50MB RAM)
- Requires Docker knowledge
- Port management complexity

**Setup:** [Docker Deployment](/docs/reference/operations/deployment-methods/docker)

### 3. systemd Service
**When:** Linux production servers, single instance, traditional ops

**Pros:**
- Deep Linux integration
- Automatic restarts
- Resource limits built-in
- Simple monitoring

**Cons:**
- Linux-only
- Single instance
- Manual scaling

**Setup:** [systemd Service](/docs/reference/operations/deployment-methods/systemd)

### 4. Kubernetes
**When:** Enterprise, High Availability, auto-scaling, multiple data centers

**Pros:**
- Unlimited horizontal scaling
- Automatic failover
- Self-healing
- Multi-region support

**Cons:**
- Steep learning curve
- Infrastructure overhead
- Complexity for small deployments

**Setup:** [Kubernetes Deployment](/docs/reference/operations/deployment-methods/kubernetes)

## Implementation Guides

- [Binary Installation](/docs/reference/operations/deployment-methods/binary) - Quick 5-minute setup
- [Docker Deployment](/docs/reference/operations/deployment-methods/docker) - Containerized deployment
- [systemd Service](/docs/reference/operations/deployment-methods/systemd) - Linux service management
- [Kubernetes](/docs/reference/operations/deployment-methods/kubernetes) - Enterprise-grade deployment

## Deployment Scenarios

### Scenario 1: Quick Testing

```bash
# Just want to test Cadence?
→ Use Binary Installation
→ Download precompiled binary
→ Run locally or on test server
→ Time: 5 minutes
```

### Scenario 2: Single Production Server

```bash
# One server, production workload?
→ Use systemd Service
→ Install as system service
→ Full monitoring and restarts
→ Resources: 2+ cores, 2GB RAM
→ Time: 15 minutes
```

### Scenario 3: Small Team, Development

```bash
# Multiple developers, local testing?
→ Use Docker Compose
→ Shared docker-compose.yml
→ Consistent environment
→ Time: 10 minutes
```

### Scenario 4: Cloud Native (AWS/GCP/Azure)

```bash
# Scalable cloud deployment?
→ Use Docker + Kubernetes
→ Container registry (ECR/GCR/ACR)
→ Auto-scaling
→ Time: 30-60 minutes
```

### Scenario 5: Global High Availability

```bash
# Multiple regions, 99.9% uptime?
→ Use Kubernetes with Helm
→ Multi-region clusters
→ Automatic failover
→ Time: 2-3 hours
```

## Next Steps

1. Choose a deployment method based on your needs
2. Follow the implementation guide
3. Review [Operations Guide](/docs/reference/operations) for production setup
4. Set up [Monitoring](/docs/reference/operations/monitoring)
