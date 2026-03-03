---
title: Webhook Server
description: Run Cadence as an HTTP server that receives Git push events and analyzes repositories continuously
order: 0
---

# Webhook Server

The Cadence webhook server is a long-running HTTP process that receives push events from GitHub or GitLab, queues analysis jobs, and exposes results via REST or Server-Sent Events (SSE).

## How It Works

When a push event arrives, the server:

1. Validates the webhook signature (HMAC-SHA256 for GitHub, token header for GitLab)
2. Enqueues an analysis job
3. Clones the repository to a temporary directory (2-minute timeout)
4. Runs all enabled detection strategies
5. Computes metrics and suspicion scores
6. Stores the result in the job queue

Results are accessible immediately via `GET /jobs/:id` once the job completes. Jobs persist for the lifetime of the process (no disk persistence between restarts).

## Starting the Server

```bash
cadence webhook [flags]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--port` | `8000` | HTTP listen port |
| `--host` | `0.0.0.0` | Bind address |
| `--secret` | — | Webhook HMAC secret (GitHub) |
| `--workers` | `4` | Concurrent analysis workers |
| `--timeout` | `30s` | Per-request timeout |

### Minimal Example

```bash
cadence webhook --port 8000 --secret "my-secret"
```

### With AI Skills Enabled

```bash
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=openai
export CADENCE_AI_KEY=sk-...

cadence webhook --port 8000 --secret "my-secret"
```

## API Surface

The webhook server registers the following endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/webhooks/github` | POST | Receive GitHub push events |
| `/webhooks/gitlab` | POST | Receive GitLab push events |
| `/api/analyze/repository` | POST | On-demand repository analysis |
| `/api/analyze/website` | POST | On-demand website analysis |
| `/api/stream/repository` | POST | SSE streaming repository analysis |
| `/api/stream/website` | POST | SSE streaming website analysis |
| `/jobs/:id` | GET | Get job status and results |
| `/jobs` | GET | List recent jobs (up to 50) |
| `/api/results/:id` | GET | Get job result only |
| `/metrics` | GET | Prometheus-compatible metrics |
| `/api/metrics` | GET | Metrics as JSON |
| `/api/cache/stats` | GET | Cache statistics |
| `/api/cache/clear` | POST | Clear analysis result cache |
| `/api/plugins` | GET | List loaded analysis plugins |
| `/health` | GET | Health check |

Full endpoint documentation: [API Reference](/docs/integrations/webhooks/api)

## Platform Setup

- [GitHub Webhook Setup](/docs/integrations/webhooks/github)
- [GitLab Webhook Setup](/docs/integrations/webhooks/gitlab)

## Job Lifecycle

Jobs follow this state machine:

```
queued → running → completed
                → failed
```

Poll `GET /jobs/:id` until `status` is `completed` or `failed`.

```bash
# Submit a job
curl -X POST http://localhost:8000/api/analyze/repository \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/owner/repo", "branch": "main"}'
# → {"job_id": "abc123", "status": "queued"}

# Poll for result
curl http://localhost:8000/jobs/abc123
# → {"status": "completed", "result": {...}}
```

Or use SSE to receive results as they stream in:

```bash
curl -N -X POST http://localhost:8000/api/stream/repository \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/owner/repo"}'
```

## Health Check

```bash
curl http://localhost:8000/health
# → {"status": "ok"}
```
