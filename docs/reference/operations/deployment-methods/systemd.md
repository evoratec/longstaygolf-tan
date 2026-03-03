---
title: systemd Service Setup
description: Deploy Cadence as a systemd service on Linux
---

# systemd Service Setup

Run Cadence as a system-managed service on Linux using systemd for automatic startup, restart, and monitoring.

## Quick Start

### 1. Create systemd Service File

Create `/etc/systemd/system/cadence-webhook.service`:

```ini
[Unit]
Description=Cadence Webhook Server
Documentation=https://noslop.tech/docs
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=cadence
Group=cadence
WorkingDirectory=/opt/cadence

# Path to cadence binary
ExecStart=/usr/local/bin/cadence webhook \
  --config /etc/cadence/.cadence.yaml

# Restart policy
Restart=on-failure
RestartSec=5s
StartLimitInterval=60s
StartLimitBurst=10

# Resource limits
MemoryMax=2G
MemoryHigh=1.5G
CPUQuota=200%
CPUQuotaPeriodSec=1s

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/etc/cadence /var/log/cadence /var/cache/cadence

# Environment
Environment="CADENCE_AI_ENABLED=true"
Environment="CADENCE_AI_PROVIDER=openai"
EnvironmentFile=/etc/cadence/cadence.env

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cadence

[Install]
WantedBy=multi-user.target
```

### 2. Create Configuration Files

Create `/etc/cadence/.cadence.yaml`:

```yaml
thresholds:
  suspicious_additions: 500
  suspicious_deletions: 1000
  max_additions_per_min: 100
  max_deletions_per_min: 500
  min_time_delta_seconds: 60

webhook:
  enabled: true
  host: "0.0.0.0"
  port: 8000
  secret: "your-webhook-secret"
  max_workers: 8

ai:
  enabled: true
  provider: "openai"
```

Create `/etc/cadence/cadence.env`:

```bash
CADENCE_AI_KEY=sk-proj-your-api-key
CADENCE_WEBHOOK_SECRET=your-secret-key
```

### 3. Create System User

```bash
# Create dedicated user and group
sudo useradd --system \
  --home /var/lib/cadence \
  --shell /usr/sbin/nologin \
  --comment "Cadence webhook service" \
  cadence

# Set permissions
sudo mkdir -p /etc/cadence /var/log/cadence /var/cache/cadence
sudo chown -R cadence:cadence /etc/cadence /var/log/cadence /var/cache/cadence
sudo chmod 750 /etc/cadence
sudo chmod 640 /etc/cadence/cadence.env
```

### 4. Enable and Start Service

```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable cadence-webhook

# Start the service
sudo systemctl start cadence-webhook

# Check status
sudo systemctl status cadence-webhook
```

## Service Management

### View Status

```bash
sudo systemctl status cadence-webhook
sudo systemctl is-active cadence-webhook
sudo systemctl is-enabled cadence-webhook
```

### View Logs

```bash
# Show recent logs
sudo journalctl -u cadence-webhook -n 50

# Follow logs in real-time
sudo journalctl -u cadence-webhook -f

# Show logs since last boot
sudo journalctl -u cadence-webhook -b

# Filter by priority level
sudo journalctl -u cadence-webhook -p err    # Only errors
sudo journalctl -u cadence-webhook -p info   # Info and above
```

### Control Service

```bash
# Start service
sudo systemctl start cadence-webhook

# Stop service
sudo systemctl stop cadence-webhook

# Restart service
sudo systemctl restart cadence-webhook

# Reload configuration without restarting
sudo systemctl reload cadence-webhook

# Disable auto-start on boot
sudo systemctl disable cadence-webhook
```

## Advanced Configuration

### Resource Limits

Limit CPU and memory usage:

```ini
[Service]
MemoryMax=2G              # Hard memory limit
MemoryHigh=1.5G           # Soft memory limit
MemoryAccounting=true
CPUQuota=200%             # 2 CPU cores max
CPUQuotaPeriodSec=1s
```

### Automatic Restart

Configure automatic restart behavior:

```ini
[Service]
Restart=on-failure        # Restart on non-zero exit
RestartSec=5s             # Wait 5s before restart
StartLimitInterval=60s    # Time window for burst limit
StartLimitBurst=10        # Max 10 restarts per 60s
```

### Security Hardening

```ini
[Service]
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/etc/cadence /var/log/cadence
```

## Multiple Instances

Run multiple webhook instances for load balancing:

Create `/etc/systemd/system/cadence-webhook@.service`:

```ini
[Unit]
Description=Cadence Webhook Server instance %i
After=network.target

[Service]
Type=simple
User=cadence
WorkingDirectory=/opt/cadence
ExecStart=/usr/local/bin/cadence webhook \
  --config /etc/cadence/cadence-%i.yaml \
  --port 800%i

Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Start multiple instances:

```bash
sudo systemctl start cadence-webhook@{0,1,2}
```

## Troubleshooting

### Service Won't Start

```bash
# Check configuration syntax
cadence webhook --help

# Test configuration
sudo -u cadence /usr/local/bin/cadence webhook \
  --config /etc/cadence/.cadence.yaml

# View detailed error logs
sudo journalctl -u cadence-webhook -n 100 -p err
```

### Permission Denied Errors

```bash
# Fix file ownership
sudo chown cadence:cadence /etc/cadence/.cadence.yaml
sudo chmod 600 /etc/cadence/cadence.env

# Fix port binding (if < 1024)
sudo setcap cap_net_bind_service=+ep /usr/local/bin/cadence
```

### Memory Issues

Reduce worker count and set memory limits:

```ini
[Service]
MemoryMax=1G
Environment="CADENCE_WEBHOOK_MAX_WORKERS=4"
```

## Next Steps

- [Nginx Reverse Proxy](/docs/reference/operations/networking/nginx) - Add HTTPS and load balancing
- [Monitoring](/docs/reference/operations/monitoring) - Set up Prometheus metrics
- [High Availability](/docs/reference/operations/ha) - Multi-instance setup
