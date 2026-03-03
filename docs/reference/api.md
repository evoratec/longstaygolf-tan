---
title: API Reference
description: Complete API endpoint documentation
---

# API Reference

Comprehensive reference for all Cadence API endpoints and webhooks.

## Webhook Server Endpoints

### Webhook Receivers

#### POST `/webhooks/github`

Receive GitHub push events.

**Security:**
- HMAC-SHA256 signature verification required
- Header: `X-Hub-Signature-256`

**Request:**

```http
POST /webhooks/github HTTP/1.1
Host: cadence.example.com
X-Hub-Signature-256: sha256=abcdef1234567890
Content-Type: application/json

{
  "repository": { "full_name": "owner/repo", "url": "https://..." },
  "ref": "refs/heads/main",
  "commits": [
    {
      "id": "abc1234...",
      "message": "Add feature",
      "author": { "name": "John", "email": "john@example.com" }
    }
  ],
  "pusher": { "name": "john" }
}
```

**Response (202 Accepted):**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Analysis job queued"
}
```

#### POST `/webhooks/gitlab`

Receive GitLab push events.

**Security:**
- Token verification via `X-Gitlab-Token` header
- Or HMAC signature verification

**Request:**

```http
POST /webhooks/gitlab HTTP/1.1
Host: cadence.example.com
X-Gitlab-Token: your-webhook-token
Content-Type: application/json

{
  "project": {
    "id": 1,
    "name": "repo",
    "web_url": "https://gitlab.com/owner/repo"
  },
  "ref": "refs/heads/main",
  "commits": [...]
}
```

**Response (202 Accepted):**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "pending"
}
```

### Job Management

#### GET `/jobs/:id`

Get job status and results.

**Parameters:**
- `id` (path, required) - Job UUID

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "repo": "owner/repo",
  "branch": "main",
  "timestamp": "2026-02-02T10:30:00Z",
  "error": null,
  "result": {
    "total_commits": 50,
    "suspicious_commits": 3,
    "suspicions": [
      {
        "commit_hash": "abc1234",
        "message": "Velocity anomaly detected",
        "severity": "high",
        "confidence": 0.85,
        "reasons": ["velocity", "timing"]
      }
    ],
    "overall_score": 0.72,
    "assessment": "suspicious"
  }
}
```

#### GET `/jobs`

List recent analysis jobs.

**Query Parameters:**
- `limit` (optional) - Maximum jobs to return (default: 10, max: 100)
- `offset` (optional) - Pagination offset (default: 0)
- `status` (optional) - Filter by status: pending, processing, completed, failed
- `repo` (optional) - Filter by repository name

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "repo": "owner/repo",
    "branch": "main",
    "timestamp": "2026-02-02T10:30:00Z",
    "result": {
      "suspicious_commits": 3,
      "overall_score": 0.72
    }
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "processing",
    "repo": "owner/repo-2",
    "branch": "develop",
    "timestamp": "2026-02-02T10:28:00Z"
  }
]
```

### Server Management

#### GET `/health`

Health check endpoint.

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2026-02-02T10:30:00Z",
  "uptime_seconds": 86400,
  "jobs_processed": 1247,
  "active_jobs": 3,
  "queue_depth": 12
}
```

#### GET `/metrics`

Prometheus-compatible metrics.

**Response (200 OK):**

```
# HELP cadence_jobs_total Total jobs processed
# TYPE cadence_jobs_total counter
cadence_jobs_total 1247

# HELP cadence_jobs_active Currently processing jobs
# TYPE cadence_jobs_active gauge
cadence_jobs_active 3

# HELP cadence_queue_depth Jobs waiting in queue
# TYPE cadence_queue_depth gauge
cadence_queue_depth 12

# HELP cadence_jobs_duration_seconds Job processing duration
# TYPE cadence_jobs_duration_seconds histogram
cadence_jobs_duration_seconds_bucket{le="0.1"} 50
cadence_jobs_duration_seconds_bucket{le="1"} 800
cadence_jobs_duration_seconds_bucket{le="5"} 1200
cadence_jobs_duration_seconds_bucket{le="+Inf"} 1247

# HELP cadence_analysis_errors_total Analysis errors encountered
# TYPE cadence_analysis_errors_total counter
cadence_analysis_errors_total 12
```

### Streaming Endpoints

#### GET `/api/stream/repository`

Real-time SSE stream for repository analysis.

**Query Parameters:**
- `url` (required) - Repository URL or path to analyze

**Response (200 OK, text/event-stream):**

```
data: {"event":"start","repo":"owner/repo"}

data: {"event":"fetch","message":"Fetching repository..."}

data: {"event":"progress","commits_analyzed":10,"total_commits":100}

data: {"event":"detection","commit":"abc1234","suspicion":"velocity_high"}

data: {"event":"progress","commits_analyzed":50,"total_commits":100}

data: {"event":"ai_analysis","in_progress":true}

data: {"event":"complete","suspicious_count":3,"overall_score":0.72}
```

**Client Example (JavaScript):**

```javascript
const eventSource = new EventSource(
  '/api/stream/repository?url=https://github.com/owner/repo'
);

eventSource.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log(`${data.event}: ${JSON.stringify(data)}`);
});

eventSource.addEventListener('error', (event) => {
  console.error('Stream error:', event);
  eventSource.close();
});
```

#### GET `/api/stream/website`

Real-time SSE stream for website analysis.

**Query Parameters:**
- `url` (required) - Website URL to analyze

**Response (200 OK, text/event-stream):**

```
data: {"event":"start","url":"https://example.com"}

data: {"event":"fetch","message":"Downloading page..."}

data: {"event":"parse","elements":1247}

data: {"event":"strategy","name":"generic_language","score":0.65}

data: {"event":"strategy","name":"overused_phrases","score":0.82}

data: {"event":"complete","strategies_triggered":8,"overall_score":0.72}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "invalid_request",
  "message": "Missing required field: repository",
  "details": {
    "field": "repository",
    "reason": "required"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "invalid_signature",
  "message": "Webhook signature verification failed"
}
```

### 404 Not Found

```json
{
  "error": "not_found",
  "message": "Job 550e8400-... not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "rate_limited",
  "message": "Too many requests",
  "retry_after": 60
}
```

### 500 Internal Server Error

```json
{
  "error": "internal_error",
  "message": "Analysis failed due to internal error",
  "details": {
    "component": "analyzer",
    "reason": "git_clone_failed"
  }
}
```

## Status Codes Reference

| Code | Meaning | When | Action |
|------|---------|------|--------|
| 200 | OK | Successful request | Use response data |
| 202 | Accepted | Job queued | Poll `/jobs/:id` for results |
| 400 | Bad Request | Invalid parameters | Check request format |
| 401 | Unauthorized | Invalid signature | Verify webhook secret |
| 404 | Not Found | Resource doesn't exist | Check resource ID |
| 429 | Too Many Requests | Rate limited | Wait and retry |
| 500 | Internal Error | Server error | Retry later, check logs |
| 503 | Service Unavailable | Server overloaded | Retry with backoff |

## Job Status Values

| Status | Meaning | Final | Description |
|--------|---------|-------|-------------|
| `pending` | Job queued | No | Waiting for available worker |
| `processing` | Currently analyzing | No | Worker actively processing |
| `completed` | Success | Yes | Analysis complete, results available |
| `failed` | Error occurred | Yes | Check `error` field for details |
| `cancelled` | Manually cancelled | Yes | Job was cancelled by user |
| `timeout` | Exceeded time limit | Yes | Job exceeded 5-minute timeout |

## Severity Levels

| Severity | Score Range | Meaning |
|----------|-------------|---------|
| `low` | 0.0 - 0.4 | Few patterns detected |
| `medium` | 0.4 - 0.7 | Multiple patterns detected |
| `high` | 0.7 - 1.0 | Many patterns detected |

## Filter Rules (for GET /jobs)

```bash
# Get completed jobs
GET /jobs?status=completed

# Get failed jobs
GET /jobs?status=failed

# Get jobs for specific repo
GET /jobs?repo=owner/repo

# Combine filters
GET /jobs?status=completed&repo=owner/repo

# Pagination
GET /jobs?limit=50&offset=100
```

## Webhook Signature Verification

### GitHub (HMAC-SHA256)

```go
import (
  "crypto/hmac"
  "crypto/sha256"
  "encoding/hex"
)

func verifyGitHubSignature(payload []byte, signature, secret string) bool {
  h := hmac.New(sha256.New, []byte(secret))
  h.Write(payload)
  computed := "sha256=" + hex.EncodeToString(h.Sum(nil))
  return hmac.Equal([]byte(signature), []byte(computed))
}
```

### Node.js Example

```javascript
const crypto = require('crypto');

function verifyGitHubSignature(payload, signature, secret) {
  const computed = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(signature, computed);
}
```

## Rate Limiting

**Limits per endpoint:**
- Webhooks: 100 requests/minute per secret
- Job queries: 1000 requests/minute
- Metrics: 10000 requests/minute

**Rate limit headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1643798400
```

## Next Steps

- [Webhook Setup](/docs/integrations/webhooks) - Configuration guide
- [Agent Skills](/docs/integrations/agent-skills) - Programmatic integration
- [Monitoring](/docs/operations/monitoring) - Track API usage
