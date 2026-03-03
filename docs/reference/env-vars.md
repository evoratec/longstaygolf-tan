---
title: Environment Variables
description: Complete reference for all CADENCE_* and related environment variables
---

# Environment Variables Reference

This document is the single source of truth for all environment variables that configure Cadence. All configuration variables use the `CADENCE_` prefix.

## Configuration Variables

| Variable | Section | Default | Type | Required | Description | Example |
|----------|---------|---------|------|----------|-------------|---------|
| `CADENCE_CONFIG` | Core | none | string | No | Path to configuration file | `/etc/cadence/cadence.yaml` |
| `CADENCE_LOG_LEVEL` | Logging | `info` | string | No | Logging verbosity: debug, info, warn, error | `debug` |

## Detection Thresholds

| Variable | Section | Default | Type | Range | Description |
|----------|---------|---------|------|-------|-------------|
| `CADENCE_THRESHOLDS_SUSPICIOUS_ADDITIONS` | Thresholds | `500` | integer | 100-10000 | Flag commits with more lines added than this |
| `CADENCE_THRESHOLDS_SUSPICIOUS_DELETIONS` | Thresholds | `1000` | integer | 100-10000 | Flag commits with more lines deleted than this |
| `CADENCE_THRESHOLDS_MAX_ADDITIONS_PER_MIN` | Thresholds | `100` | integer | 10-500 | Flag if additions per minute exceeds this |
| `CADENCE_THRESHOLDS_MAX_DELETIONS_PER_MIN` | Thresholds | `500` | integer | 50-1000 | Flag if deletions per minute exceeds this |
| `CADENCE_THRESHOLDS_MIN_TIME_DELTA_SECONDS` | Thresholds | `60` | integer | 0-300 | Flag if commits are within N seconds of previous commit |
| `CADENCE_THRESHOLDS_MAX_FILES_PER_COMMIT` | Thresholds | `50` | integer | 10-200 | Flag commits modifying more files than this |
| `CADENCE_THRESHOLDS_MAX_ADDITION_RATIO` | Thresholds | `0.95` | float | 0.0-1.0 | Flag commits where additions are >N ratio (0=0%, 1=100%) |
| `CADENCE_THRESHOLDS_MIN_DELETION_RATIO` | Thresholds | `0.95` | float | 0.0-1.0 | Flag commits where deletions are >N ratio |
| `CADENCE_THRESHOLDS_ENABLE_PRECISION_ANALYSIS` | Thresholds | `true` | boolean | - | Enable precision/consistency analysis |

## Webhook Server

| Variable | Section | Default | Type | Required | Description | Example |
|----------|---------|---------|------|----------|-------------|---------|
| `CADENCE_WEBHOOK_ENABLED` | Webhook | `false` | boolean | No | Enable webhook server | `true` |
| `CADENCE_WEBHOOK_HOST` | Webhook | `0.0.0.0` | string | No | Host address to bind to | `0.0.0.0` |
| `CADENCE_WEBHOOK_PORT` | Webhook | `8000` | integer | No | Port to listen on | `8000` |
| `CADENCE_WEBHOOK_SECRET` | Webhook | none | string | **Yes** (if enabled) | Secret key for webhook authentication | `your-secret-key` |
| `CADENCE_WEBHOOK_MAX_WORKERS` | Webhook | `4` | integer | No | Number of concurrent webhook handlers | `8` |
| `CADENCE_WEBHOOK_READ_TIMEOUT` | Webhook | `30` | integer | No | Request read timeout (seconds) | `30` |
| `CADENCE_WEBHOOK_WRITE_TIMEOUT` | Webhook | `30` | integer | No | Response write timeout (seconds) | `30` |

## AI Analysis Configuration

| Variable | Section | Default | Type | Required | Description | Example |
|----------|---------|---------|------|----------|-------------|---------|
| `CADENCE_AI_ENABLED` | AI | `false` | boolean | No | Enable AI-powered analysis features | `true` |
| `CADENCE_AI_PROVIDER` | AI | `openai` | string | Yes (if enabled) | AI provider: `openai` or `anthropic` | `openai` |
| `CADENCE_AI_KEY` | AI | none | string | **Yes** (if enabled) | API key for selected provider | `sk-proj-...` |
| `CADENCE_AI_MODEL` | AI | (provider default) | string | No | Specific model to use | `gpt-4o-mini` |
| `CADENCE_AI_BASE_URL` | AI | (provider default) | string | No | Custom API endpoint (if self-hosted) | `https://api.custom.com/v1` |
| `CADENCE_AI_TIMEOUT` | AI | `30` | integer | No | Request timeout (seconds) | `60` |
| `CADENCE_AI_MAX_RETRIES` | AI | `3` | integer | No | Number of retry attempts | `5` |

## OpenAI Specific

| Variable | Default | Example | Purpose |
|----------|---------|---------|---------|
| `CADENCE_AI_PROVIDER=openai` | - | `openai` | Set provider to OpenAI |
| `CADENCE_AI_KEY` | - | `sk-proj-xxx` | OpenAI API key (starts with `sk-proj-`) |
| `CADENCE_AI_MODEL` | `gpt-4o-mini` | `gpt-4o-mini` or `gpt-4` | Model selection |

**Example:**
```bash
CADENCE_AI_PROVIDER=openai
CADENCE_AI_KEY=sk-proj-abc123...
CADENCE_AI_MODEL=gpt-4o-mini
```

## Anthropic (Claude) Specific

| Variable | Default | Example | Purpose |
|----------|---------|---------|---------|
| `CADENCE_AI_PROVIDER=anthropic` | - | `anthropic` | Set provider to Anthropic |
| `CADENCE_AI_KEY` | - | `sk-ant-...` | Anthropic API key (starts with `sk-ant-`) |
| `CADENCE_AI_MODEL` | `claude-sonnet-4-20250514` | `claude-opus-4-1` | Model selection |
| `CADENCE_AI_BASE_URL` | `https://api.anthropic.com/v1` | - | Usually not needed |

**Example:**
```bash
CADENCE_AI_PROVIDER=anthropic
CADENCE_AI_KEY=sk-ant-abc123...
CADENCE_AI_MODEL=claude-sonnet-4-20250514
```

## File Exclusions

| Variable | Default | Type | Description | Example |
|----------|---------|------|-------------|---------|
| `CADENCE_EXCLUDE_FILES` | (defaults) | string | Comma-separated file patterns to exclude | `*.lock,node_modules/*` |

**Example:**
```bash
CADENCE_EXCLUDE_FILES="*.log,temp/**,*.tmp"
```

## Advanced Configuration

| Variable | Default | Type | Description | Example |
|----------|---------|------|-------------|---------|
| `CADENCE_CACHE_ENABLED` | `true` | boolean | Enable analysis caching | `true` |
| `CADENCE_CACHE_TTL` | `86400` | integer | Cache time-to-live (seconds, 1 day) | `86400` |
| `CADENCE_PRECISION_ANALYSIS` | `true` | boolean | Enable precision analysis strategy | `true` |

## Strategy Configuration

| Variable | Section | Default | Type | Description |
|----------|---------|---------|------|-------------|
| `CADENCE_STRATEGIES_DISABLED` | Strategies | none | string | Comma-separated strategy names to disable |

**Example:**
```bash
CADENCE_STRATEGIES_DISABLED="emoji_usage,special_chars"
```

## Common Environment Variable Combinations

### Minimal Configuration (Local Analysis)
```bash
# No webhook, no AI, just detection
export CADENCE_LOG_LEVEL=info
```

### Development Configuration
```bash
export CADENCE_LOG_LEVEL=debug
export CADENCE_WEBHOOK_ENABLED=true
export CADENCE_WEBHOOK_PORT=8000
export CADENCE_WEBHOOK_SECRET=dev-secret
```

### Production Configuration (OpenAI)
```bash
export CADENCE_LOG_LEVEL=warn
export CADENCE_WEBHOOK_ENABLED=true
export CADENCE_WEBHOOK_PORT=8000
export CADENCE_WEBHOOK_SECRET=$(aws secretsmanager get-secret-value --secret-id cadence/webhook --query SecretString --output text)
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=openai
export CADENCE_AI_KEY=$(aws secretsmanager get-secret-value --secret-id cadence/openai-key --query SecretString --output text)
export CADENCE_AI_MODEL=gpt-4o-mini
```

### Production Configuration (Anthropic)
```bash
export CADENCE_LOG_LEVEL=warn
export CADENCE_WEBHOOK_ENABLED=true
export CADENCE_WEBHOOK_PORT=8000
export CADENCE_WEBHOOK_SECRET=$(vault kv get -field=webhook_secret secret/cadence)
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=anthropic
export CADENCE_AI_KEY=$(vault kv get -field=api_key secret/cadence/anthropic)
export CADENCE_AI_MODEL=claude-sonnet-4-20250514
```

## Setting Environment Variables

### Docker
```bash
docker run -e CADENCE_AI_KEY=sk-... -e CADENCE_WEBHOOK_PORT=8000 trycadence/cadence:latest
```

### Docker Compose
```yaml
environment:
  CADENCE_AI_ENABLED: "true"
  CADENCE_AI_PROVIDER: "openai"
  CADENCE_AI_KEY: ${CADENCE_AI_KEY}
  CADENCE_WEBHOOK_PORT: "8000"
```

### Kubernetes
```yaml
env:
- name: CADENCE_AI_KEY
  valueFrom:
    secretKeyRef:
      name: cadence-secrets
      key: ai-key
```

### systemd
Create `/etc/cadence/cadence.env`:
```bash
CADENCE_AI_ENABLED=true
CADENCE_AI_PROVIDER=openai
CADENCE_AI_KEY=sk-...
CADENCE_WEBHOOK_SECRET=secret
```

Then reference in service file:
```ini
EnvironmentFile=/etc/cadence/cadence.env
```

## Priority/Override Order

Environment variables override configuration file settings in this order (highest to lowest priority):

1. **Command-line flags** (if supported)
2. **Environment variables** (CADENCE_*)
3. **Configuration file** (.cadence.yaml)
4. **Built-in defaults**

Example:
```bash
# Config file says port=8000
# But this overrides it:
export CADENCE_WEBHOOK_PORT=9000
cadence webhook  # Will use port 9000
```

## Required vs Optional

### For Local Analysis (No Webhook/AI)
- ✅ All optional (uses defaults)

### For Webhook Server
- ✅ `CADENCE_WEBHOOK_ENABLED=true`
- ✅ `CADENCE_WEBHOOK_SECRET` (must be set)

### For AI Analysis
- ✅ `CADENCE_AI_ENABLED=true`
- ✅ `CADENCE_AI_PROVIDER` (openai or anthropic)
- ✅ `CADENCE_AI_KEY` (provider API key)
- ⚠️ `CADENCE_AI_MODEL` (optional, uses provider default)

## See Also

- [Configuration Guide](../getting-started/configuration.md) - Detailed configuration setup
- [File Exclusion Patterns](_excludes-reference.md) - File exclusion reference
- [Threshold Reference](_threshold-reference.md) - Detection threshold tuning
- [Docker Deployment](../operations/docker.md) - Docker setup with environment variables
- [Kubernetes Deployment](../operations/kubernetes.md) - Kubernetes configuration
- [systemd Deployment](../operations/systemd.md) - systemd service setup
