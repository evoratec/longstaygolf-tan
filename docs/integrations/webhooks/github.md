---
title: GitHub Webhooks
description: Configure GitHub to send push events to your Cadence webhook server
order: 1
---

# GitHub Webhook Setup

This guide covers configuring a GitHub repository webhook to send push events to a running Cadence webhook server.

## Prerequisites

- Cadence webhook server running and reachable from the internet (or a tunnel like ngrok for development)
- A GitHub repository you control
- A webhook secret you'll use for HMAC verification

## Start the Server

```bash
cadence webhook --port 8000 --secret "your-webhook-secret"
```

The server must be reachable at a public URL. For local development:

```bash
# Using ngrok
ngrok http 8000
# Note the https://*.ngrok.io URL for the next step
```

## Register the Webhook on GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings → Webhooks → Add webhook**
3. Fill in the form:
   - **Payload URL:** `https://your-server.example.com/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Your webhook secret (same value as `--secret`)
   - **SSL verification:** Enable if your server uses a valid TLS certificate
4. Under **Which events would you like to trigger this webhook?** select:
   - **Just the push event** (recommended)
5. Click **Add webhook**

GitHub will immediately send a `ping` event. The Cadence server ignores ping events and responds 200 OK.

## Verify Signature Validation

Cadence validates all incoming GitHub webhooks using HMAC-SHA256 via the `X-Hub-Signature-256` header. If the signature does not match, the request is rejected with `403 Forbidden`.

```bash
# Test manually with curl (not recommended — use GitHub's "Redeliver" button instead)
# The signature must be computed correctly for the request to be accepted
```

Use the **Redeliver** button in GitHub's webhook delivery history to replay past events without reconfiguring.

## GitHub Actions Integration

To trigger Cadence analysis after a GitHub Actions workflow, add a step that calls the REST API directly:

```yaml
name: Cadence Analysis

on:
  push:
    branches: [main]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cadence Analysis
        run: |
          curl -X POST ${{ vars.CADENCE_URL }}/api/analyze/repository \
            -H "Content-Type: application/json" \
            -d '{"url": "${{ github.repositoryUrl }}", "branch": "${{ github.ref_name }}"}'
```

Store `CADENCE_URL` as a repository variable (`Settings → Variables → Actions`).

## Webhook Delivery Debugging

GitHub shows every webhook delivery attempt under **Settings → Webhooks → (your webhook) → Recent Deliveries**. Each delivery shows:

- Request headers and payload
- Response status code and body
- Delivery timestamp

Use the **Redeliver** button to replay failed deliveries after fixing configuration issues.

## Monitoring

After configuring, verify events are reaching your server:

```bash
# Check recent jobs
curl http://localhost:8000/jobs

# Check metrics
curl http://localhost:8000/api/metrics
```
