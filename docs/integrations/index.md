---
title: Integrations
description: Connect Cadence to Git platforms, AI providers, AI assistants, and automation workflows
order: 3
---

## Integrations

Cadence provides four integration surfaces: a **webhook server** for continuous Git platform monitoring, **AI providers** (OpenAI and Anthropic) for enhanced detection, an **AI skills system** for embedding detection into agents and pipelines, and a **plugin API** for extending detection with custom strategies.

## Integration Surfaces

### AI Providers

Connect Cadence to OpenAI or Anthropic to add AI-powered analysis on top of pattern-based detection. AI analysis runs after suspicious items are flagged, providing confidence scores, reasoning, and detailed indicators.

**Best for:**
- Deeper analysis of flagged commits with natural-language explanations
- Higher confidence scoring using LLM reasoning
- Report summarization and pattern explanation

**Guides:** [Overview](/docs/integrations/ai-providers) · [Configuration](/docs/integrations/ai-providers/configuration) · [Examples](/docs/integrations/ai-providers/examples)

---

### Webhook Server

Run Cadence as a long-running HTTP server that receives push events from GitHub or GitLab, queues analysis jobs, and returns results via REST or Server-Sent Events.

**Best for:**
- Continuous repository monitoring on every push
- CI/CD pipeline integration
- Self-hosted Git platforms (GitHub, GitLab, Gitea, Forgejo)

**Guides:** [Overview](/docs/integrations/webhooks) · [GitHub Setup](/docs/integrations/webhooks/github) · [GitLab Setup](/docs/integrations/webhooks/gitlab) · [API Reference](/docs/integrations/webhooks/api)

---

### Agent Skills

Cadence exposes four internal AI skills and two external skills (via `skills.json`) compatible with Claude, ChatGPT, and custom automation tools.

**Best for:**
- AI coding assistants invoking detection directly in conversation
- On-demand analysis without a running server
- Embedding detection results into automation pipelines

**Guides:** [Overview](/docs/integrations/agent-skills) · [Internal Skills](/docs/integrations/agent-skills/internal) · [External Skills](/docs/integrations/agent-skills/external)

---

### Analysis Plugins

Extend Cadence's detection pipeline by implementing the `StrategyPlugin` interface. Plugins register with the `PluginManager` and participate in all analysis runs.

**Best for:**
- Custom detection strategies unique to your codebase or policy
- Domain-specific heuristics not covered by built-in detectors
- Wrapping third-party analysis tools in the Cadence pipeline

**Guides:** [Overview](/docs/plugins) · [Writing Plugins](/docs/plugins/writing-plugins)

---

## Quick Start

### Start the Webhook Server

```bash
cadence webhook --port 8000 --secret "your-webhook-secret"
```

### Enable AI Analysis

```bash
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=openai   # or: anthropic
export CADENCE_AI_KEY=sk-...
cadence analyze /path/to/repo -o report.json --config .cadence.yaml
```

### Run On-Demand Analysis via API

```bash
curl -X POST http://localhost:8000/api/analyze/repository \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/owner/repo", "branch": "main"}'
```
