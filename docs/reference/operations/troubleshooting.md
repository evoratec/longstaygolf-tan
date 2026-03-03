---
title: Troubleshooting & Error Resolution
description: Common errors, solutions, and diagnostics
---

# Troubleshooting & Error Resolution

Comprehensive guide for resolving common Cadence issues including installation, operational errors, network problems, configuration issues, and analysis errors.

## Installation & Build Issues

### "Command not found: go"

Go is not installed or not in PATH.

**Solutions:**
1. Install Go from [golang.org/dl](https://golang.org/dl)
2. Verify: `go version`
3. Add to PATH if needed

### Build Fails on Windows

**Solutions:**
1. Run PowerShell as Administrator:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\scripts\build.ps1
   ```
2. Or use the Makefile: `make build`
3. Install Go for Windows (not the WSL version)

### Build Fails on macOS/Linux

**Solutions:**
1. Install dependencies:
   ```bash
   # macOS
   brew install git golang libgit2

   # Ubuntu/Debian
   sudo apt-get install git golang-go libgit2-dev
   ```
2. Clean module cache: `go clean -modcache && go mod tidy`

### "Command not found: cadence"

The binary isn't in PATH.

**Solutions:**
1. Use the full path: `./bin/cadence --help`
2. Add to PATH:
   ```bash
   # Linux/macOS
   export PATH="$(pwd)/bin:$PATH"

   # Windows PowerShell
   $env:PATH += ";$(Get-Location)\bin"
   ```
3. Install globally: `make install` or `sudo cp bin/cadence /usr/local/bin/`

## Webhook Server Issues

### ERR_WEBHOOK_INVALID_SIGNATURE

**Message:** "Webhook signature verification failed"

**Solutions:**
1. Verify webhook secret is set: `echo $WEBHOOK_SECRET`
2. Check GitHub settings match
3. Verify format: `sha256=abc123...`
4. Regenerate secret if needed

### ERR_WEBHOOK_TIMEOUT

**Message:** "Webhook processing exceeded timeout"

**Causes:** Repository too large, network issues, insufficient workers

**Solutions:**
```bash
# Increase workers
MAX_WORKERS=16  # Previous: 4

# Check queue depth
curl http://localhost:8000/metrics | grep cadence_queue_depth

# Monitor AI latency
LOG_LEVEL=debug cadence webhook
```

### Webhook Not Receiving Events

**Solutions:**
1. Verify server is running: `curl http://localhost:8000/health`
2. Check firewall/network from another machine: `curl http://your-server.com:8000/health`
3. Verify the webhook is configured and active in GitHub/GitLab repository settings
4. Check "Recent Deliveries" in webhook settings to confirm events were sent

### Job Status Shows "failed"

**Problem:** Webhook job fails during analysis.

**Solutions:**
1. Check job details for the error field:
   ```bash
   curl http://localhost:8000/jobs/<job-id>
   ```
2. Common causes: repository access denied, invalid branch name, 5-minute timeout, configuration errors
3. Increase workers if jobs are backlogged:
   ```bash
   cadence webhook --workers 8 --secret "secret"
   ```

## Network Errors

### ERR_CONNECTION_REFUSED

**Message:** "Cannot connect to [host:port]"

**Solutions:**
```bash
# Check service status
sudo systemctl status cadence
sudo journalctl -u cadence -n 20

# Verify port binding
sudo netstat -tlnp | grep cadence

# Test connectivity
curl http://localhost:8000/health
nc -zv localhost 8000

# Check firewall
sudo ufw allow 8000
sudo iptables -L | grep 8000
```

### ERR_TLS_CERTIFICATE_INVALID

**Message:** "TLS certificate verification failed"

**Solutions:**
```bash
# Check certificate expiration
openssl s_client -connect cadence.example.com:443 -showcerts

# Renew certificate
sudo certbot renewal --dry-run
sudo certbot renew

# Add CA certificate (for self-signed)
curl --cacert /path/to/ca.pem https://noslop.example.com/health
```

## Repository Analysis Errors

### ERR_GIT_CLONE_FAILED

**Message:** "Failed to clone repository"

**Solutions:**
```bash
# Verify URL is accessible (correct format — do NOT include .git suffix)
# cadence analyze https://github.com/owner/repo        ✓
# cadence analyze https://github.com/owner/repo.git    ✗

git clone https://github.com/owner/repo /tmp/test-clone

# Check disk space
df -h /var/cache/cadence

# For private repos: cache credentials then clone once
git config --global credential.helper store
git clone https://github.com/owner/private-repo

# Or use SSH key
cp ~/.ssh/id_rsa /opt/cadence/.ssh/id_rsa
chmod 600 /opt/cadence/.ssh/id_rsa
GIT_SSH_COMMAND="ssh -i /opt/cadence/.ssh/id_rsa" git clone git@github.com:owner/repo
```

### ERR_REPOSITORY_TOO_LARGE

**Message:** "Repository exceeds maximum size"

**Solutions:**
```bash
# Check repository size
du -sh /tmp/cadence-clone

# Use shallow clone for speed
GIT_DEPTH=1000 cadence analyze https://github.com/owner/repo

# Cleanup git objects
git gc --aggressive --prune=now
```

### ERR_NO_COMMITS_FOUND

**Message:** "Repository has no commits or branch not found"

**Solutions:**
```bash
# Verify branch exists
git ls-remote https://github.com/owner/repo | grep refs/heads/main

# Check repository
git clone --depth 1 https://github.com/owner/repo
cd repo && git log | head
```

### Clone Takes Too Long or Times Out

**Solutions:**
1. Specify a branch to limit history analyzed:
   ```bash
   cadence analyze https://github.com/owner/repo/tree/main
   ```
2. Use a local copy if available:
   ```bash
   cadence analyze /path/to/local/repo -o report.json
   ```
3. Test network speed: `curl -w "Time: %{time_total}s\n" -o /dev/null https://github.com`

## AI Provider Errors

### ERR_AI_API_KEY_INVALID

**Message:** "Invalid API key for AI provider"

**Solutions:**
```bash
# Verify key is set with correct format
echo $CADENCE_AI_KEY  # Should show sk-ant-xxx... or sk-proj-...

# Test API connection
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CADENCE_AI_KEY" ...

# Check if loaded in service
systemctl show cadence -p Environment | grep CADENCE_AI_KEY

# Update and restart if missing
sudo systemctl daemon-reload
sudo systemctl restart cadence
```

Also verify your configuration:
```yaml
ai:
  enabled: true
  provider: "openai"   # or "anthropic"
  # API key via CADENCE_AI_KEY environment variable
```

### ERR_AI_RATE_LIMIT

**Message:** "API rate limit exceeded"

**Solutions:**
```bash
# Reduce batch size
BATCH_SIZE=1

# Add delay between analyses
sleep 5  # Between webhook requests

# Reduce workers
MAX_WORKERS=2
```

Additional options:
- Use a cheaper/faster model to reduce token usage: `model: gpt-4o-mini`
- Disable AI for large repositories: set `ai.enabled: false` in config
- Check usage: [console.anthropic.com](https://console.anthropic.com) or [platform.openai.com](https://platform.openai.com)

### ERR_AI_PROVIDER_UNAVAILABLE

**Message:** "AI provider service is unavailable"

**Solutions:**
```bash
# Check provider status
curl https://status.anthropic.com

# Test connectivity
curl -I https://api.anthropic.com/v1

# Check DNS
nslookup api.anthropic.com
dig api.anthropic.com

# Configure retry policy
RETRY_COUNT=5
RETRY_BACKOFF_INITIAL=2s
```

## Database Errors

### ERR_DATABASE_CONNECTION_FAILED

**Message:** "Cannot connect to database"

**Solutions:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql postgresql://user:pass@localhost:5432/cadence

# Check credentials
sudo -u postgres psql -c "\du cadence"

# Check port binding
sudo netstat -tlnp | grep postgres
```

### ERR_DATABASE_QUERY_TIMEOUT

**Solutions:**
```bash
# Increase timeout
ALTER SYSTEM SET statement_timeout = '60s';
SELECT pg_reload_conf();

# Check slow queries
SELECT query FROM pg_stat_statements WHERE mean_exec_time > 1000;

# Add indexes
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
```

## File Analysis Issues

### Analysis Produces No Results

**Solutions:**
```bash
# Check thresholds are appropriate
cadence config

# Verify repository has commits
git log --oneline | head -20

# Lower thresholds to detect something
cadence analyze /repo --suspicious-additions 100 -o report.json
```

### Analysis Very Slow

**Solutions:**
```bash
# Check repository size
du -sh .git
git rev-list --count HEAD

# Analyze recent history only
cadence analyze /repo --branch main -o report.json

# Exclude large files
# Add to cadence.yaml:
exclude_files:
  - "*.lock"
  - "node_modules/**"
  - "dist/**"
```

## Configuration Issues

### "Config file not found"

**Solutions:**
```bash
# Create default config
cadence config init

# Specify config explicitly
cadence analyze /repo --config /path/to/cadence.yaml

# Check file exists and is readable
ls -la .cadence.yaml
cat .cadence.yaml

# Ensure valid YAML syntax
```

### Configuration Values Ignored

**Solutions:**
```bash
# Check command-line flags override config
# Flags > environment variables > config file

# Verify config file is being used
cadence analyze /repo --config ./cadence.yaml  # Use explicit path

# Check environment variables don't override
env | grep CADENCE
```

## Resource & Performance Issues

### ERR_OUT_OF_MEMORY

**Message:** "Out of memory, process killed"

**Solutions:**
```bash
# Check current usage and limits
free -h
ps aux | grep cadence
ulimit -v

# For Docker
docker run -m 2g cadence:latest

# For systemd
MemoryMax=2G

# Reduce cache
CACHE_MAX_SIZE=500m

# Reduce workers
MAX_WORKERS=2
```

### ERR_CPU_THROTTLED

**Message:** "CPU quota exceeded"

**Solutions:**
```bash
# Check CPU limits
cat /proc/limits | grep cadence

# For Docker
docker run --cpus 4 cadence:latest

# For systemd
CPUQuota=400%

# Reduce workers if shared system
MAX_WORKERS=2

# Monitor CPU
top -u cadence
```

### Webhook Server Slow

**Solutions:**
1. Increase worker count: `cadence webhook --workers 8 --secret "secret"`
2. Monitor job queue depth:
   ```bash
   curl http://localhost:8000/jobs
   curl http://localhost:8000/metrics | grep cadence_queue_depth
   ```
3. If AI analysis is the bottleneck, see [ERR_AI_RATE_LIMIT](#err_ai_rate_limit)

## Health Check Failures

### Health Check Endpoint

```bash
curl http://localhost:8000/health

# Expected response
{
  "status": "ok",
  "timestamp": "2026-02-02T10:30:00Z",
  "uptime_seconds": 3600,
  "jobs_processed": 127,
  "active_jobs": 2,
  "queue_depth": 5
}
```

**If returns error:**

```bash
# 1. Check service is running
sudo systemctl status cadence

# 2. Check port
sudo netstat -tlnp | grep 8000

# 3. Check logs
sudo journalctl -u cadence -n 50

# 4. Try direct connection
curl -v http://127.0.0.1:8000/health
curl -v http://localhost:8000/health

# 5. Check localhost resolution
cat /etc/hosts | grep localhost
```

## Quick Diagnostic Script

```bash
#!/bin/bash
# diagnose.sh

echo "=== System Resources ==="
free -h
df -h /var/cache/cadence

echo "=== Service Status ==="
systemctl status cadence

echo "=== Port Status ==="
netstat -tlnp | grep 8000

echo "=== Recent Logs ==="
journalctl -u cadence -n 20

echo "=== API Health ==="
curl -s http://localhost:8000/health | jq .

echo "=== Environment ==="
systemctl show cadence -p Environment

echo "=== Database ==="
psql $STATE_DB -c "SELECT 1" && echo "OK" || echo "FAILED"

echo "=== Cache ==="
redis-cli ping && echo "OK" || echo "FAILED"
```

## Getting Help

If you encounter an issue not listed here:

1. **Check logs:** `journalctl -u cadence -n 100`
2. **Enable debug logging:** `LOG_LEVEL=debug systemctl restart cadence`
3. **Gather diagnostics:** `./diagnose.sh > diagnostics.txt`
4. **Open an issue on GitHub** with:
   - Full error message
   - Steps to reproduce
   - System info (OS, Go version, deployment type)
   - Diagnostics output

**Resources:**
- [Installation Guide](/docs/getting-started/installation)
- [CLI Commands](/docs/cli/commands)
- [Advanced Configuration](/docs/reference/advanced-configuration)
- [GitHub Issues](https://github.com/TryCadence/Cadence/issues)
- [GitHub Discussions](https://github.com/TryCadence/Cadence/discussions)

## Next Steps

- [Monitoring](/docs/reference/operations/monitoring) - Continuous health monitoring
- [Security](/docs/reference/operations/security) - Security hardening
- [Performance](/docs/reference/operations/advanced/performance) - Optimization
- [Build & Development](/docs/reference/build-development) - Building from source
