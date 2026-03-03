---
title: API Reference
description: Complete reference for all Cadence webhook server HTTP endpoints
order: 3
---

# Webhook Server API Reference

The Cadence webhook server exposes 15 HTTP endpoints across five categories: webhook receivers, on-demand analysis, job management, observability, and administration.

## Base URL

All endpoints are relative to the server's listen address, e.g. `http://localhost:8000`.

---

## Webhook Receivers

### `POST /webhooks/github`

Receive a GitHub push event. Validates the `X-Hub-Signature-256` header using HMAC-SHA256 before enqueuing an analysis job.

**Request headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Hub-Signature-256` | Yes | HMAC-SHA256 of the request body using the configured secret |
| `X-GitHub-Event` | Yes | Must be `push` (ping events are accepted and ignored) |
| `Content-Type` | Yes | `application/json` |

**Response:**

```json
{"job_id": "abc123", "status": "queued"}
```

Returns `403` if signature validation fails.

---

### `POST /webhooks/gitlab`

Receive a GitLab push event. Validates the `X-Gitlab-Token` header by string comparison.

**Request headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Gitlab-Token` | Yes | Must match the configured secret token |
| `Content-Type` | Yes | `application/json` |

**Response:**

```json
{"job_id": "abc123", "status": "queued"}
```

Returns `403` if the token does not match.

---

## On-Demand Analysis

### `POST /api/analyze/repository`

Analyze a Git repository by URL. The server clones the repository (2-minute timeout), runs all detection strategies, and stores the result.

**Request body:**

```json
{
  "url": "https://github.com/owner/repo",
  "branch": "main"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Repository URL (HTTPS or SSH) |
| `branch` | No | Branch to analyze (default: repository default branch) |

**Response:**

```json
{"job_id": "abc123", "status": "queued"}
```

Poll `GET /jobs/abc123` for results.

---

### `POST /api/analyze/website`

Analyze a website by URL for AI-generated content signatures.

**Request body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{"job_id": "abc123", "status": "queued"}
```

The result's `assessment` field will be one of:
- `"Likely AI-Generated"` — suspicion score ≥ 0.7
- `"Suspicious Activity"` — suspicion score ≥ 0.4
- `"Likely Human-Written"` — suspicion score < 0.4

---

### `POST /api/stream/repository`

Analyze a repository with results streamed via Server-Sent Events (SSE). The connection stays open and emits events as detection strategies complete.

**Request body:** Same as `/api/analyze/repository`

**Response:** `text/event-stream`

```
data: {"type":"progress","strategy":"commit-pattern","detections":2}

data: {"type":"complete","result":{...}}
```

The SSE write timeout is disabled — connections remain open until analysis completes or the client disconnects.

---

### `POST /api/stream/website`

Analyze a website with SSE streaming.

**Request body:** Same as `/api/analyze/website`

**Response:** `text/event-stream` (same format as `/api/stream/repository`)

---

## Job Management

### `GET /jobs/:id`

Get the status and result of a specific job.

**Response (`status: queued` or `running`):**

```json
{"job_id": "abc123", "status": "running"}
```

**Response (`status: completed`):**

```json
{
  "job_id": "abc123",
  "status": "completed",
  "result": {
    "source_id": "abc123",
    "source_type": "git",
    "detections": [...],
    "metrics": {...},
    "suspicion_score": 0.82,
    "strategy_results": [...]
  }
}
```

Returns `404` if the job ID is not found.

---

### `GET /jobs`

List recent jobs. Returns up to 50 jobs ordered by creation time (most recent first).

**Response:**

```json
[
  {"job_id": "abc123", "status": "completed", "created_at": "..."},
  {"job_id": "def456", "status": "running", "created_at": "..."}
]
```

---

### `GET /api/results/:id`

Get only the analysis result for a completed job (without job metadata).

Returns `404` if the job is not found or not yet completed.

---

## Observability

### `GET /metrics`

Prometheus-compatible metrics endpoint. Suitable for scraping by a Prometheus instance.

```
# HELP cadence_jobs_total Total number of analysis jobs processed
# TYPE cadence_jobs_total counter
cadence_jobs_total{status="completed"} 42
cadence_jobs_total{status="failed"} 1
...
```

---

### `GET /api/metrics`

Same metrics as `/metrics` but returned as JSON.

```json
{
  "jobs_total": {"completed": 42, "failed": 1},
  "cache_hits": 17,
  "cache_misses": 8,
  ...
}
```

---

## Administration

### `GET /api/cache/stats`

Returns cache hit/miss statistics and the number of cached entries.

```json
{
  "hits": 17,
  "misses": 8,
  "size": 25
}
```

---

### `POST /api/cache/clear`

Clears all cached analysis results. Useful after configuration changes.

**Response:**

```json
{"cleared": true}
```

---

### `GET /api/plugins`

Lists all registered analysis plugins (loaded via the plugin API).

```json
[
  {
    "name": "my-custom-detector",
    "category": "commit",
    "description": "Detects patterns specific to our codebase"
  }
]
```

Returns an empty array `[]` if no plugins are registered.

---

### `GET /health`

Health check endpoint. Returns `200 OK` when the server is ready to accept requests.

```json
{"status": "ok"}
```
