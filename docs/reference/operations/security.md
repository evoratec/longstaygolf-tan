---
title: Security Best Practices
description: Secure your Cadence deployment
---

# Security Best Practices

Production-grade security hardening for Cadence deployments.

## Webhook Security

### HMAC Signature Verification

```bash
# Generate strong secret (64 characters minimum)
openssl rand -hex 32 > /opt/cadence/.webhook-secret

# Set in environment
WEBHOOK_SECRET=$(cat /opt/cadence/.webhook-secret)
```

### Secret Management

**Never commit secrets to version control:**

```bash
# ✅ Good: External secret management
export CADENCE_AI_KEY=$(aws secretsmanager get-secret-value --query SecretString)

# ❌ Bad: Secrets in environment files
CADENCE_AI_KEY=sk-ant-xxx  # Don't do this
```

### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: cadence-secrets
type: Opaque
data:
  CADENCE_AI_KEY: <base64-encoded-key>
  WEBHOOK_SECRET: <base64-encoded-secret>
```

## Network Security

### TLS/SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name cadence.example.com;
    
    ssl_certificate /etc/letsencrypt/live/cadence.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cadence.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # HSTS header
    add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### IP Whitelisting

```nginx
location /metrics {
    allow 10.0.0.0/8;
    deny all;
}
```

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=1000r/m;

location /webhooks/ {
    limit_req zone=webhook_limit burst=50;
}
```

## Data Protection

### API Key Rotation

```bash
# Get new key from provider
NEW_KEY=$(curl -s https://api.anthropic.com/v1/keys -H "Authorization: Bearer $ADMIN_TOKEN")

# Update Kubernetes secret
kubectl patch secret cadence-secrets --type merge \
  -p '{"data":{"CADENCE_AI_KEY":"'$(echo -n "$NEW_KEY" | base64)'"}}'

# Verify
curl -s http://localhost:8000/health | jq .status
```

### Encryption at Transit

```bash
# Database connections
DATABASE_URL=postgresql://user:pass@db:5432/cadence?sslmode=require

# Redis connections  
REDIS_URL=rediss://redis:6379?tls=true

# API connections
API_BASE_URL=https://api.anthropic.com/v1
```

## Container Security

### Security Context

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cadence
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      
      containers:
      - name: cadence
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /var/cache/cadence
      
      volumes:
      - name: tmp
        emptyDir: {}
      - name: cache
        emptyDir: {}
```

## Host Security

### systemd Hardening

```ini
[Service]
# Capabilities
CapabilityBoundingSet=~CAP_SYS_MODULE CAP_SYS_RAWIO CAP_SYS_BOOT

# Filesystem isolation
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/cache/cadence /var/log/cadence

# Process isolation
PrivateTmp=yes
NoNewPrivileges=yes

# Resource limits
LimitNOFILE=65536
LimitNPROC=512
```

### Firewall Rules

```bash
# Allow only webhook from specific IPs
iptables -A INPUT -p tcp --dport 8000 -s 10.0.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 8000 -j DROP

# Allow HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## Access Control

### Git SSH Key Management

```bash
# Generate SSH key for private repos
ssh-keygen -t ed25519 -f /opt/cadence/.ssh/cadence_key -N ""

# Configure ssh
cat > /opt/cadence/.ssh/config <<EOF
Host github.com
    IdentityFile ~/.ssh/cadence_key
    StrictHostKeyChecking accept-new
EOF

# Set permissions
chmod 700 /opt/cadence/.ssh
chmod 600 /opt/cadence/.ssh/*
chown -R cadence:cadence /opt/cadence/.ssh
```

### Webhook Source Verification

Verify webhooks come from legitimate sources:

```bash
# GitHub's IP ranges:
curl -s https://api.github.com/meta | jq '.hooks'
```

## Deployment Checklist

- [ ] TLS certificate installed and valid
- [ ] HTTPS enforced (HTTP redirects)
- [ ] Webhook secret generated (64+ characters)
- [ ] API keys in environment variables only
- [ ] Running as non-root user
- [ ] Firewall configured (restrict internal ports)
- [ ] Resource limits set
- [ ] Audit logging enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring and alerts set up

## Common Vulnerabilities

### SQL Injection

Cadence uses parameterized queries - safe by default:

```go
// ✅ Safe: Parameterized query
db.Query("SELECT * FROM jobs WHERE id = $1", jobID)

// ❌ Unsafe: String concatenation (NOT used)
db.Query("SELECT * FROM jobs WHERE id = " + jobID)
```

### Command Injection

Cadence sanitizes git commands:

```go
// ✅ Safe: Exec with args array
cmd := exec.Command("git", "clone", sanitizedURL, dir)
```

### Cross-Site Scripting (XSS)

Reports are properly escaped - not vulnerable.

## Security Updates

### Staying Updated

```bash
# Check for updates
cadence version

# Subscribe to security advisories
# GitHub: Watch Releases → Announcements

# Auto-update
echo "0 2 * * * /opt/cadence/update-check.sh" | sudo crontab -
```

## Incident Response

### If Compromised

1. Stop Cadence immediately: `sudo systemctl stop cadence`
2. Rotate all secrets
3. Review logs: `grep "unauthorized" /var/log/cadence/main.log`
4. Restore from backup database
5. Redeploy with fresh configuration
6. Investigate root cause

## Next Steps

- [Monitoring](/docs/reference/operations/monitoring) - Detect security events
- [High Availability](/docs/reference/operations/ha) - Disaster recovery
- [Operations](/docs/reference/operations) - Overall operational guide
