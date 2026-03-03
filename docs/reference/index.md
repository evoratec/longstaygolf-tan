# Reference

Advanced reference documentation for users, developers, and system administrators.

## Documentation Sections

### [API Reference](/docs/reference/api)
REST API endpoints, webhook payloads, job management, SSE streaming, and error response formats.

### [Architecture](/docs/reference/architecture)
System design, component overview, data flow diagrams, and internal architecture documentation.

### [Build & Development](/docs/reference/build-development)
Developer guide for building from source, cross-platform builds, version management, and contributing to Cadence.

### [Operations](/docs/reference/operations)
Production deployment, hosting, and infrastructure management. Includes deployment methods, networking, monitoring, security, and performance tuning.

### [Troubleshooting](/docs/reference/operations/troubleshooting)
Solutions for common issues including installation problems, analysis errors, network issues, and performance optimization.

### [Disclaimer](/docs/reference/disclaimer)
Important information about Cadence's limitations, accuracy considerations, false positives/negatives, and ethical use.

## Configuration Overview

Cadence uses YAML configuration files for persistent settings. Create with:

```bash
cadence config init
```

This creates `.cadence.yaml` with all configurable options.

## Default Configuration

The default configuration that Cadence uses:

```yaml
thresholds:
  # SIZE-BASED DETECTION
  suspicious_additions: 500
  suspicious_deletions: 1000
  
  # VELOCITY-BASED DETECTION
  max_additions_per_min: 100
  max_deletions_per_min: 500
  
  # TIMING-BASED DETECTION
  min_time_delta_seconds: 60
  
  # FILE DISPERSION DETECTION
  max_files_per_commit: 50
  
  # RATIO-BASED DETECTION
  max_addition_ratio: 0.95
  min_deletion_ratio: 0.95
  min_commit_size_ratio: 100
  
  # PRECISION ANALYSIS
  enable_precision_analysis: true

# File patterns to exclude
exclude_files:
  - package-lock.json
  - yarn.lock

# Optional: Webhook server
webhook:
  enabled: false
  host: "0.0.0.0"
  port: 8000
  secret: "your-secret"
  max_workers: 4

# Optional: AI analysis
ai:
  enabled: false
  provider: "openai"            # or "anthropic"
  model: ""                     # Leave empty for provider default

# Optional: Strategy configuration
strategies:
  # Enable/disable specific strategies
  # disabled_strategies:
  #   - "strategy_name"
```

## Configuration Loading

Cadence loads configuration in this order:

1. **Explicit flag** - `--config /path/to/config.yaml`
2. **Current directory** - `.cadence.yaml` (auto-detected)
3. **Environment variable** - `CADENCE_CONFIG` path
4. **Built-in defaults** - If no config found

## Environment Variables

Configure Cadence via environment variables (prefix: `CADENCE_`):

```bash
# Configuration file
export CADENCE_CONFIG="/path/to/cadence.yaml"

# Detection thresholds
export CADENCE_THRESHOLDS_SUSPICIOUS_ADDITIONS=500
export CADENCE_THRESHOLDS_MAX_ADDITIONS_PER_MIN=100

# Webhook settings
export CADENCE_WEBHOOK_PORT=8080
export CADENCE_WEBHOOK_SECRET="secret"
export CADENCE_WEBHOOK_MAX_WORKERS=4

# AI settings
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=openai    # or "anthropic"
export CADENCE_AI_KEY="sk-..."
export CADENCE_AI_MODEL=gpt-4o-mini  # or leave empty for default

# Exclude files
export CADENCE_EXCLUDE_FILES="*.lock,node_modules/*"
```

## Build Information

Version information is automatically injected during build:

- **Version** - From Git tags (e.g., `v0.3.0`)
- **Commit** - Short Git commit hash
- **Build Time** - UTC timestamp

View with:

```bash
cadence version
```

## Next Steps

- [Advanced Configuration](/docs/reference/advanced-configuration) - All configuration options
- [Build & Development](/docs/reference/build-development) - Building and development
- [Operations](/docs/reference/operations) - Deployment and infrastructure
- [Troubleshooting](/docs/reference/troubleshooting) - Common issues and solutions
- [Disclaimer](/docs/reference/disclaimer) - Limitations and ethical use
