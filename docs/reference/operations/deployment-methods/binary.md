---
title: Binary Installation
description: Install Cadence from precompiled binaries
---

# Binary Installation

Quick installation of Cadence using precompiled binaries without Docker or Kubernetes.

## Supported Platforms

| OS | Architecture | Status | Download |
|----|--------------|--------|----------|
| macOS | arm64 (Apple Silicon) | ✅ Supported | `cadence-darwin-arm64` |
| macOS | amd64 (Intel) | ✅ Supported | `cadence-darwin-amd64` |
| Linux | amd64 (x64) | ✅ Supported | `cadence-linux-amd64` |
| Linux | arm64 | ✅ Planned | Coming soon |
| Windows | amd64 | ⚠️ Via WSL | Use WSL2 + Linux binary |

## Prerequisites

- One of the supported operating systems above
- 2+ CPU cores
- 2GB+ RAM
- Outbound HTTPS access (for webhooks and AI APIs)
- Disk space for cache (~5GB recommended)

## Quick Start (5 minutes)

### 1. Download Binary

**macOS (Apple Silicon):**

```bash
# Download
curl -L -o cadence https://github.com/your-org/cadence/releases/download/v0.3.0/cadence-darwin-arm64
chmod +x cadence

# Verify (optional)
./cadence version
```

**macOS (Intel):**

```bash
curl -L -o cadence https://github.com/your-org/cadence/releases/download/v0.3.0/cadence-darwin-amd64
chmod +x cadence
```

**Linux:**

```bash
curl -L -o cadence https://github.com/your-org/cadence/releases/download/v0.3.0/cadence-linux-amd64
chmod +x cadence
```

### 2. Test Installation

```bash
./cadence version
# Output: Cadence v0.3.0
```

### 3. Run Webhook Server

```bash
# Set required environment variables
export CADENCE_AI_KEY="sk-ant-your-key"
export CADENCE_WEBHOOK_SECRET="your-secret-key"

# Start webhook server
./cadence webhook
# Now listening on http://localhost:8000
```

## Configuration

### Environment Variables

```bash
# AI Configuration
CADENCE_AI_PROVIDER=anthropic           # or "openai"
CADENCE_AI_KEY=sk-ant-xxx               # Your API key
CADENCE_AI_BASE_URL=https://api.anthropic.com/v1

# Webhook Server
CADENCE_WEBHOOK_PORT=8000
CADENCE_WEBHOOK_HOST=0.0.0.0
CADENCE_WEBHOOK_SECRET=your-secret-key
CADENCE_WEBHOOK_MAX_WORKERS=8

# Logging
LOG_LEVEL=info                          # debug, info, warn, error
```

### Configuration File

Alternatively, create `.cadence.yaml`:

```yaml
ai:
  enabled: true
  provider: anthropic
  key: sk-ant-xxx
  baseUrl: https://api.anthropic.com/v1

webhook:
  enabled: true
  host: 0.0.0.0
  port: 8000
  secret: your-secret-key
  maxWorkers: 8

thresholds:
  suspicious_additions: 500
  suspicious_deletions: 1000
  max_additions_per_min: 100
  max_deletions_per_min: 500
```

Run with config:

```bash
./cadence webhook --config .cadence.yaml
```

## Usage Examples

### Start Webhook Server

```bash
./cadence webhook
```

### Analyze Repository

```bash
./cadence analyze https://github.com/owner/repo -o report.json
```

### Check Configuration

```bash
./cadence config
```

## System Integration

### macOS - Keep Running with launchd

Create `~/Library/LaunchAgents/com.cadence.webhook.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cadence.webhook</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/cadence</string>
        <string>webhook</string>
        <string>--config</string>
        <string>~/.cadence/config.yaml</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/cadence.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/cadence-error.log</string>
</dict>
</plist>
```

Load it:

```bash
launchctl load ~/Library/LaunchAgents/com.cadence.webhook.plist
launchctl start com.cadence.webhook
```

### Linux - Background Process

Run in background with logging:

```bash
nohup ./cadence webhook > cadence.log 2>&1 &
echo $! > cadence.pid
```

Or use `screen`/`tmux`:

```bash
screen -S cadence -d -m ./cadence webhook
```

## Troubleshooting

### "Command not found: cadence"

The binary isn't in PATH. Either:

1. Use full path: `./cadence version`
2. Move to PATH: `sudo cp cadence /usr/local/bin/`
3. Add current directory to PATH: `export PATH="$PATH:$(pwd)"`

### Port Already in Use

```bash
# Find what's using port 8000
lsof -i :8000

# Use different port
./cadence webhook --port 8080
```

### Permission Denied

```bash
# Make binary executable
chmod +x cadence
```

### API Key Invalid

```bash
# Verify key format
echo $CADENCE_AI_KEY
# Should start with: sk-ant- (Anthropic) or sk-proj- (OpenAI)

# Verify key is set
env | grep CADENCE_AI_KEY
```

## Monitoring

### Health Check

```bash
curl http://localhost:8000/health
# Output: {"status":"ok",...}
```

### Metrics

```bash
curl http://localhost:8000/metrics
# Prometheus-format metrics
```

## Upgrading

### Backup Current Binary

```bash
cp cadence cadence.backup
```

### Download New Version

```bash
curl -L -o cadence-new https://github.com/your-org/cadence/releases/download/v0.4.0/cadence-linux-amd64
chmod +x cadence-new
```

### Switch

```bash
mv cadence-new cadence
./cadence version  # Verify
```

## Next Steps

- [Configuration](/docs/reference/advanced-configuration) - Advanced options
- [Monitoring](/docs/reference/operations/monitoring) - Set up monitoring
- [High Availability](/docs/reference/operations/ha) - Multi-instance setup
