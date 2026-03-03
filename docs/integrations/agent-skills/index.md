---
title: Agent Skills
description: Embed Cadence's AI detection capabilities into agents and automation workflows
order: 0
---

# Agent Skills

Cadence exposes its analysis capabilities through an AI skills system that operates at two levels:

- **Internal skills** — four Go-native skills that run as part of the Cadence analysis pipeline, backed by OpenAI or Anthropic
- **External skills** — two skills exposed via `skills.json` for consumption by Claude, ChatGPT, and compatible agent frameworks

## How Skills Work

Skills are discrete, purpose-built AI prompts that take structured input (a code snippet, a commit, a detection result, or a full report) and return structured JSON output.

Internally, each skill is executed by the `SkillRunner`, which:

1. Formats the input with a system prompt specific to that skill
2. Calls the configured AI provider (OpenAI or Anthropic)
3. Parses the structured JSON response
4. Returns the result alongside any AI-generated fields

## Prerequisites

To use skills, AI must be enabled:

```bash
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=openai      # or: anthropic
export CADENCE_AI_KEY=sk-...           # your provider API key
export CADENCE_AI_MODEL=gpt-4o-mini   # optional: override default model
```

| Variable | Default | Description |
|----------|---------|-------------|
| `CADENCE_AI_ENABLED` | `false` | Must be `true` to activate skills |
| `CADENCE_AI_PROVIDER` | `openai` | Provider: `openai` or `anthropic` |
| `CADENCE_AI_KEY` | — | API key for the chosen provider |
| `CADENCE_AI_MODEL` | `gpt-4o-mini` (OpenAI) / `claude-3-haiku-20240307` (Anthropic) | Model override |

## Skill Guides

- [Internal Skills](/docs/integrations/agent-skills/internal) — `code_analysis`, `commit_review`, `pattern_explain`, `report_summary`
- [External Skills](/docs/integrations/agent-skills/external) — `skills.json`, Claude tool-use, ChatGPT function calling
