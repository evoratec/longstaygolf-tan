---
title: Documentation
description: Learn how to use Cadence to detect AI-generated content
category: Reference
difficulty: Beginner
time_estimate: 5 min
prerequisites: []
---

# Welcome to Cadence

Cadence is an open-source CLI tool that detects AI-generated content in Git repositories and websites. It uses **38 pattern-based detection strategies** combined with optional AI validation to identify suspicious content with confidence scores and detailed reporting.

> [!TIP] New here? Start with the [Quick Start guide](/docs/getting-started/quick-start) to analyze your first repository in under 5 minutes.

---

## Documentation Sections

### [Getting Started](/docs/getting-started)
Installation, quick start guides, and basic configuration to get you up and running.

### [CLI Reference](/docs/cli)
Complete command-line interface documentation including all commands and detection strategies.

### [Analysis](/docs/analysis)
Deep-dive guides for analyzing Git repositories and websites with best practices.

### [Integrations](/docs/integrations)
Connect Cadence to CI/CD pipelines, webhook-based workflows, and AI agent platforms.

### [Reference](/docs/reference)
Advanced configuration, development guides, and troubleshooting resources.

### [Community](/docs/community)
Contributing guidelines, security policy, and community resources.

---

## Quick Start

```bash
# Clone and build
git clone https://github.com/TryCadence/Cadence.git
cd Cadence && make build

# Analyze a Git repository
./bin/cadence analyze --repo /path/to/repo

# Analyze a remote GitHub repo
./bin/cadence analyze --repo https://github.com/user/repo

# Analyze a website
./bin/cadence analyze --url https://example.com
```

> [!NOTE] On Windows, use `.\scripts\build.ps1` or `go build -o cadence.exe ./cmd/cadence` instead of `make build`.

---

## Key Capabilities

| Capability | Details |
|-----------|---------|
| **Git Detection** | 18 strategies — size, velocity, timing, merge commits, dispersion, ratio, precision, commit messages, naming patterns, structural consistency, burst patterns, error handling, templates, file extensions, statistical anomalies, timing anomalies, emoji usage, special characters |
| **Web Detection** | 20 strategies — overused phrases, generic language, excessive structure, perfect grammar, boilerplate text, repetitive patterns, missing nuance, excessive transitions, uniform sentence length, AI vocabulary, emoji overuse, special characters, missing alt text, semantic HTML, accessibility markers, heading hierarchy, hardcoded values, form issues, link text quality, generic styling |
| **Confidence Scoring** | 0.0–1.0 scores with severity levels and per-finding reasoning |
| **Output Formats** | JSON, text, HTML, YAML, and BSON |
| **Streaming** | SSE endpoints for real-time analysis progress |
| **AI Validation** | Optional OpenAI / Anthropic analysis on top of heuristic detections |
| **Webhook Server** | Fiber-based HTTP server with signature verification, job queue, caching |
| **Plugin System** | Register custom `StrategyPlugin` implementations at runtime |
| **Configuration** | YAML config with thresholds, exclusions, strategy toggles, and env var overrides |

---

## Learning Paths

<details>
<summary><strong>Analyze a Git repository</strong></summary>

1. [Installation](/docs/getting-started/installation) — Build or download the binary
2. [Quick Start](/docs/getting-started/quick-start) — Run your first analysis
3. [Repository Analysis](/docs/analysis/repository) — Understand output and scoring
4. [Git Analysis Guide](/docs/analysis/git) — Deep-dive into Git-specific strategies

</details>

<details>
<summary><strong>Analyze a website</strong></summary>

1. [Installation](/docs/getting-started/installation) — Build or download the binary
2. [Quick Start](/docs/getting-started/quick-start) — Run your first analysis
3. [Web Analysis Guide](/docs/analysis/web) — URL scanning, depth control, and selectors

</details>

<details>
<summary><strong>Set up AI-enhanced analysis</strong></summary>

1. [AI Providers](/docs/integrations/ai-providers) — Overview of OpenAI + Anthropic support
2. [AI Configuration](/docs/integrations/ai-providers/configuration) — API keys, model selection, skill toggles
3. [AI Examples](/docs/integrations/ai-providers/examples) — Real-world usage patterns

</details>

<details>
<summary><strong>Deploy as a service</strong></summary>

1. [Configuration](/docs/getting-started/configuration) — Set up `cadence.yml`
2. [Webhooks](/docs/integrations/webhooks) — Run a webhook server for GitHub/GitLab push events
3. [Agent Skills](/docs/integrations/agent-skills) — Expose skills to AI assistants and pipelines

</details>

<details>
<summary><strong>Contribute to Cadence</strong></summary>

1. [Build & Development](/docs/reference/build-development) — Clone, build, and test locally
2. [Contributing](/docs/community/contributing) — PR guidelines and code standards

</details>

---

## Quick Links

| Section | Popular Pages |
|---------|--------------|
| **Getting Started** | [Installation](/docs/getting-started/installation) · [Quick Start](/docs/getting-started/quick-start) · [Configuration](/docs/getting-started/configuration) · [Quick Reference](/docs/getting-started/quick-reference) |
| **CLI** | [Commands](/docs/cli/commands) · [Detection Strategies](/docs/cli/detection-strategies) |
| **Analysis** | [Repository Analysis](/docs/analysis/repository) · [Git Analysis](/docs/analysis/git) · [Web Analysis](/docs/analysis/web) |
| **Integrations** | [Webhooks](/docs/integrations/webhooks) · [Agent Skills](/docs/integrations/agent-skills) · [AI Providers](/docs/integrations/ai-providers) |
| **Reference** | [API Reference](/docs/reference/api) · [Architecture](/docs/reference/architecture) · [Troubleshooting](/docs/reference/troubleshooting) |

---

## Architecture Overview

Cadence uses a source-agnostic, extensible pipeline built in Go 1.24+:

```
Sources → Detectors → Runner → Reporter
  │           │          │         │
  ├─ Git      ├─ 18 Git  ├─ Sync   ├─ JSON
  └─ Web      ├─ 20 Web  └─ SSE    ├─ Text
               └─ Plugin            ├─ HTML
                                    ├─ YAML
                                    └─ BSON
```

**Core Pipeline:**
- **Sources** — `GitRepositorySource`, `WebsiteSource` (extensible)
- **Detectors** — `GitDetector` (18 strategies), `WebDetector` (20 strategies), `PluginDetector`
- **Runners** — `DefaultDetectionRunner` (sync), `StreamingRunner` (async SSE)

**Supporting Systems:**
- **AI** — Provider registry (OpenAI + Anthropic), 4 built-in skills
- **Webhook Server** — Fiber HTTP with HMAC-SHA256, job queue, SSE streaming
- **Config** — YAML with env var overrides via spf13/viper
- **Plugin System** — Runtime strategy registration with enable/disable
- **Caching** — In-memory TTL cache with LRU eviction
- **Metrics** — Prometheus-compatible with per-source/strategy tracking