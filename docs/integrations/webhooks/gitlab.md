---
title: GitLab Webhooks
description: Configure GitLab to send push events to your Cadence webhook server
order: 2
---

# GitLab Webhook Setup

This guide covers configuring a GitLab project webhook to send push events to a running Cadence webhook server.

## Prerequisites

- Cadence webhook server running and reachable from the internet
- A GitLab project you control
- A secret token you'll use for header-based authentication

## Authentication

GitLab webhooks authenticate using a plain token in the `X-Gitlab-Token` header. Pass the same token to the Cadence server via `--secret`:

```bash
cadence webhook --port 8000 --secret "your-gitlab-token"
```

> **Note:** Unlike GitHub's HMAC-SHA256 signature, GitLab uses a simple string comparison of the token value. Keep this token secure.

## Register the Webhook on GitLab

1. Go to your project on GitLab
2. Navigate to **Settings → Webhooks** (or **Project Settings → Integrations** on older versions)
3. Fill in the form:
   - **URL:** `https://your-server.example.com/webhooks/gitlab`
   - **Secret token:** Your secret token (same value as `--secret`)
   - **Trigger:** Check **Push events**
   - **SSL verification:** Enable if your server uses a valid TLS certificate
4. Click **Add webhook**

Click **Test → Push events** to send a test event immediately.

## GitLab CI/CD Integration

To trigger Cadence analysis from a GitLab CI pipeline:

```yaml
# .gitlab-ci.yml
stages:
  - analyze

cadence-analysis:
  stage: analyze
  script:
    - |
      curl -X POST $CADENCE_URL/api/analyze/repository \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"$CI_PROJECT_URL\", \"branch\": \"$CI_COMMIT_BRANCH\"}"
  only:
    - main
    - merge_requests
```

Store `CADENCE_URL` as a CI/CD variable in **Settings → CI/CD → Variables**.

## Self-Hosted GitLab

For self-hosted GitLab instances, ensure network routing allows the GitLab server to reach your Cadence instance. If both are on the same network, you can use internal hostnames.

By default, GitLab.com blocks webhooks to private IP addresses. For self-hosted GitLab, this restriction may be relaxed in **Admin Area → Settings → Network → Outbound requests**.

## Webhook Delivery Debugging

GitLab logs all webhook deliveries under **Settings → Webhooks → (your webhook) → Recent events**. Each delivery shows the response status and body. Use the **Retry** button to replay failed deliveries.

## Monitoring

After configuring, verify events are reaching your server:

```bash
# Check recent jobs
curl http://localhost:8000/jobs

# Check Prometheus metrics
curl http://localhost:8000/metrics
```
