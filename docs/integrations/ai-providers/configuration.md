---
title: Configuration
description: Configure OpenAI or Anthropic integration for Cadence analysis
order: 1
---

# AI Configuration

Configure Cadence to use OpenAI or Anthropic for enhanced commit analysis.

## Environment Variables

Configure AI using environment variables:

```bash
# Enable AI analysis
export CADENCE_AI_ENABLED=true

# Set provider ("openai" or "anthropic")
export CADENCE_AI_PROVIDER=openai

# API key (required)
export CADENCE_AI_KEY=sk-proj-your-api-key-here

# Model to use (optional, defaults to provider default)
# OpenAI default: gpt-4o-mini
# Anthropic default: claude-sonnet-4-20250514
export CADENCE_AI_MODEL=gpt-4-turbo
```

## Configuration File

In your `.cadence.yaml`:

```yaml
ai:
  enabled: true
  provider: "openai"            # or "anthropic"
  api_key: ""                   # Or use CADENCE_AI_KEY env var
  model: ""                     # Leave empty for provider default
```

## Security Best Practices

**Never commit API keys to version control!**

### Using Environment Variables

```bash
# Set temporarily for single command
CADENCE_AI_KEY=sk-proj-... cadence analyze ./repo -o report.txt

# Set for session
export CADENCE_AI_KEY=sk-proj-...
cadence analyze ./repo1 -o report1.txt
cadence analyze ./repo2 -o report2.txt
```

### Using .env File

Create `.env` file (add to `.gitignore`):

```
CADENCE_AI_ENABLED=true
CADENCE_AI_PROVIDER=openai
CADENCE_AI_KEY=sk-proj-your-key
CADENCE_AI_MODEL=gpt-4-turbo
```

Load before running:

```bash
# Linux/macOS
source .env
cadence analyze ./repo -o report.txt

# Windows (PowerShell)
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*$|^\s*#') { return }
  $key, $value = $_ -split '=', 2
  [Environment]::SetEnvironmentVariable($key, $value)
}
cadence analyze ./repo -o report.txt
```

### Add to .gitignore

```
.env
.env.local
.env.*.local
*.key
```

### In CI/CD

Use secrets management:

**GitHub Actions:**
```yaml
env:
  CADENCE_AI_KEY: ${{ secrets.CADENCE_AI_KEY }}
```

**GitLab CI:**
```yaml
variables:
  CADENCE_AI_KEY: $CADENCE_AI_KEY  # Set in CI/CD Variables
```

## Model Selection

### OpenAI Models

**Default: gpt-4o-mini**
```bash
export CADENCE_AI_PROVIDER=openai
export CADENCE_AI_KEY=sk-proj-...
# Model defaults to gpt-4o-mini
```

**High Accuracy: gpt-4**
```bash
export CADENCE_AI_MODEL=gpt-4
```

**Balanced: gpt-4-turbo**
```bash
export CADENCE_AI_MODEL=gpt-4-turbo
```

### Anthropic Models

**Default: claude-sonnet-4-20250514**
```bash
export CADENCE_AI_PROVIDER=anthropic
export CADENCE_AI_KEY=sk-ant-...
# Model defaults to claude-sonnet-4-20250514
```

**Fast: claude-haiku**
```bash
export CADENCE_AI_MODEL=claude-haiku
```

## Disabling AI

To run without AI analysis:

```bash
# Don't set CADENCE_AI_ENABLED or set to false
export CADENCE_AI_ENABLED=false
cadence analyze ./repo -o report.txt

# Or simply omit the environment variables
cadence analyze ./repo -o report.txt
```

## Verifying Configuration

Check if AI is properly configured:

```bash
# Run analysis — if AI config is invalid, you'll see errors
cadence analyze ./test-repo -o test-report.txt --config .cadence.yaml

# Verify the key is set
echo $CADENCE_AI_KEY
```

### Common Configuration Issues

**"API key is required"**
- Verify `CADENCE_AI_KEY` is set: `echo $CADENCE_AI_KEY`
- Check for accidental whitespace
- Ensure you're in the correct shell session

**"Invalid API key"**
- Verify key format: OpenAI keys start with `sk-proj-`, Anthropic keys start with `sk-ant-`
- Check the key hasn't been revoked in your provider dashboard
- Try creating a new key

**"Unknown model"**
- Check model name spelling
- Verify the model is available for your provider and API tier
- Use the provider default by leaving `model` empty

**"Unknown provider"**
- Supported providers: `openai`, `anthropic`
- Check spelling in config or `CADENCE_AI_PROVIDER` env var

**"Rate limit exceeded"**
- Wait before retrying
- Check your account rate limits with the provider
- Consider batching requests or upgrading your API tier

## Advanced Configuration

### Custom API Base URL

For proxy or custom endpoints:

```bash
export OPENAI_API_BASE=https://your-proxy.com/v1
export CADENCE_AI_KEY=sk-proj-...
```

### Request Timeout

```bash
# Increase timeout for slow networks (seconds)
export CADENCE_AI_TIMEOUT=60
```

## Cost Optimization

### Use cheaper models for initial scans

```bash
# OpenAI
export CADENCE_AI_PROVIDER=openai
export CADENCE_AI_MODEL=gpt-4o-mini
cadence analyze ./repo -o report.txt

# Anthropic
export CADENCE_AI_PROVIDER=anthropic
export CADENCE_AI_MODEL=claude-haiku
cadence analyze ./repo -o report.txt
```

### Reserve expensive models for critical analysis

```bash
export CADENCE_AI_MODEL=gpt-4        # or claude-sonnet-4-20250514
cadence analyze ./critical-section -o critical-report.txt
```

## Next Steps

- [View examples](/docs/integrations/ai-providers/examples)
- [Understand detection strategies](/docs/cli/detection-strategies)
- [Read about webhooks integration](/docs/integrations/webhooks)
