---
title: Usage Examples
description: Practical examples using Cadence with AI analysis (OpenAI and Anthropic)
order: 2
---

# AI Examples

Practical examples for using Cadence with AI analysis via OpenAI or Anthropic.

## Basic Usage

### Simple Repository Analysis

```bash
# Set up API key
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=openai
export CADENCE_AI_KEY=sk-proj-your-key-here

# Run analysis with AI
cadence analyze ./my-project -o report.txt --config .cadence.yaml
```

### Without AI

```bash
# Disable AI analysis
export CADENCE_AI_ENABLED=false
cadence analyze ./my-project -o report.txt --config .cadence.yaml
```

## Model Selection

### OpenAI (Default: gpt-4o-mini)

```bash
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=openai
export CADENCE_AI_KEY=sk-proj-...

# Uses gpt-4o-mini by default
cadence analyze ./repo -o report.txt

# Or use GPT-4 for critical code
export CADENCE_AI_MODEL=gpt-4
cadence analyze ./security-critical-code -o critical-report.txt
```

### Anthropic (Default: claude-sonnet-4-20250514)

```bash
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=anthropic
export CADENCE_AI_KEY=sk-ant-...

# Uses claude-sonnet-4-20250514 by default
cadence analyze ./repo -o report.txt
```

## Output Formats

### JSON Report with AI Insights

```bash
export CADENCE_AI_ENABLED=true
export CADENCE_AI_KEY=sk-proj-...

cadence analyze ./repo -o report.json --config .cadence.yaml
```

### Text Report

```bash
cadence analyze ./repo -o report.txt --config .cadence.yaml
```

Includes AI findings in the HIGH/MEDIUM/LOW SEVERITY sections for each flagged detection.

## Multiple Repositories

### Batch Analysis

```bash
#!/bin/bash
export CADENCE_AI_ENABLED=true
export CADENCE_AI_KEY=sk-proj-...

repos=("repo1" "repo2" "repo3")

for repo in "${repos[@]}"; do
  echo "Analyzing $repo..."
  cadence analyze "./$repo" -o "report-$repo.json" --config .cadence.yaml
done
```

### Analyze Changed Files Only

```bash
export CADENCE_AI_KEY=sk-proj-...

for repo in $(find . -maxdepth 2 -name ".git" -type d); do
  repo_dir=$(dirname "$repo")
  echo "Analyzing $repo_dir..."
  cadence analyze "$repo_dir" -o "report-$(basename $repo_dir).txt" --config .cadence.yaml
done
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Cadence AI Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  cadence:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for analysis

      - name: Install Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.24'

      - name: Install Cadence
        run: go install github.com/TryCadence/Cadence/cmd/cadence@latest

      - name: Create config
        run: cadence config init

      - name: Run Cadence Analysis
        env:
          CADENCE_AI_ENABLED: true
          CADENCE_AI_PROVIDER: openai  # or "anthropic"
          CADENCE_AI_KEY: ${{ secrets.CADENCE_AI_KEY }}
          CADENCE_AI_MODEL: gpt-4o-mini
        run: |
          cadence analyze . \
            --output report.json \
            --config .cadence.yaml \
            --suspicious-additions 500 \
            --max-additions-pm 100

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: cadence-report
          path: reports/report.json

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('reports/report.json', 'utf8'));
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🔍 Cadence Analysis: Score ${report.overallScore.toFixed(1)} — ${report.assessment}`
            });
```

### GitLab CI

```yaml
cadence_analysis:
  image: golang:1.24
  script:
    - go install github.com/TryCadence/Cadence/cmd/cadence@latest
    - cadence analyze ./src --output report.json --config .cadence.yaml
  artifacts:
    paths:
      - reports/report.json
    expire_in: 30 days
  only:
    - merge_requests
    - main
  variables:
    CADENCE_AI_ENABLED: "true"
    CADENCE_AI_PROVIDER: "openai"  # or "anthropic"
    CADENCE_AI_KEY: $CADENCE_AI_KEY
```

## Webhook Integration

### With Cadence Webhook Server

```bash
# Start webhook server with AI enabled
export CADENCE_AI_ENABLED=true
export CADENCE_AI_KEY=sk-proj-...

cadence webhook --port 8000 --secret your-webhook-secret
```

The webhook server automatically applies AI analysis to all received push events when AI is enabled. Results are also available via SSE streaming at `/api/stream/repository` and `/api/stream/website`.

## Configuration Files

### .cadence.yaml with AI

```yaml
thresholds:
  suspicious_additions: 500
  suspicious_deletions: 1000
  max_additions_per_min: 100
  max_deletions_per_min: 500
  min_time_delta_seconds: 60

ai:
  enabled: true
  provider: "openai"            # or "anthropic"
  model: ""                     # Leave empty for provider default

webhook:
  enabled: true
  port: 8000
  secret: your-webhook-secret
```

### Run with Config File

```bash
export CADENCE_AI_KEY=sk-proj-...
cadence analyze ./repo -o report.json --config .cadence.yaml
```

## Cost-Effective Workflows

### Two-Tier Analysis

Combine models for efficiency:

```bash
#!/bin/bash
export CADENCE_AI_KEY=sk-proj-...

# Phase 1: Quick scan with cheaper model
echo "Phase 1: Quick scan..."
export CADENCE_AI_MODEL=gpt-4o-mini
cadence analyze ./repo --output quick-scan.json --config .cadence.yaml

# Phase 2: Deep dive on flagged areas with better model
echo "Phase 2: Deep analysis..."
export CADENCE_AI_MODEL=gpt-4
cadence analyze ./flagged-sections --output detailed-scan.json --config .cadence.yaml
```

### Disable AI for Known-Good Code

```bash
# Skip AI on vendor/dependencies
export CADENCE_AI_ENABLED=false
cadence analyze ./node_modules -o report.txt --config .cadence.yaml

# Enable for source code
export CADENCE_AI_ENABLED=true
export CADENCE_AI_KEY=sk-proj-...
cadence analyze ./src -o report.txt --config .cadence.yaml
```

## Troubleshooting

### Verify Configuration

```bash
# Check if keys are set
echo $CADENCE_AI_KEY
echo $CADENCE_AI_PROVIDER
```

### Test API Connection

```bash
# OpenAI test
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $CADENCE_AI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }' | jq .

# Anthropic test
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CADENCE_AI_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hello"}]
  }' | jq .
```

### Handle Rate Limiting

```bash
#!/bin/bash
retry_with_backoff() {
  local max_attempts=3
  local timeout=1
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if cadence analyze ./repo -o report.json --config .cadence.yaml 2>/dev/null; then
      return 0
    fi
    echo "Attempt $attempt failed, retrying in ${timeout}s..."
    sleep $timeout
    timeout=$((timeout * 2))
    attempt=$((attempt + 1))
  done

  return 1
}

retry_with_backoff
```

## Next Steps

- [AI Configuration](/docs/integrations/ai-providers/configuration)
- [CLI overview](/docs/cli)
- [Set up webhooks](/docs/integrations/webhooks)
- [Read CLI commands](/docs/cli/commands)
