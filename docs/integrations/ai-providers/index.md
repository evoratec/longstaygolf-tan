---
title: AI Providers
description: Use AI models to enhance Cadence detection with detailed code analysis
order: 0
---

# AI Providers

Cadence can integrate with OpenAI or Anthropic to provide deeper analysis of suspicious commits detected by its pattern-based detection engine.

## Overview

When enabled, Cadence uses AI to:

- Analyze suspicious code additions for AI-generation indicators
- Provide confidence scores and detailed reasoning
- Identify specific patterns and red flags in detected commits
- Generate expert assessment with explanations
- Summarize analysis reports in natural language
- Explain why specific strategies flagged content

AI analysis runs **after** suspicious commits are flagged by Cadence's detection strategies, making it an optional enhancement.

## How It Works

1. **Pattern Detection**: Cadence first identifies suspicious commits using 18 git or 20 web detection strategies
2. **AI Analysis** (optional): If enabled, suspicious code snippets are sent to the configured AI provider for analysis
3. **Assessment**: The AI returns:
   - Assessment: "likely AI-generated", "possibly AI-generated", or "unlikely AI-generated"
   - Confidence score: 0.0–1.0
   - Reasoning: Explanation of key indicators found
   - Indicators: Specific patterns detected

## Supported Providers

Cadence uses a pluggable provider system with database/sql-style registration:

| Provider | Default Model | Notes |
|----------|--------------|-------|
| **OpenAI** | `gpt-4o-mini` | Uses `go-openai` SDK. Fast and cost-effective. |
| **Anthropic** | `claude-sonnet-4-20250514` | Plain HTTP client. High accuracy. |

Both providers support custom model selection via the `model` config field or `CADENCE_AI_MODEL` environment variable.

## Built-in AI Skills

Cadence includes 4 AI skills that leverage the provider system:

| Skill | Description |
|-------|-------------|
| `code_analysis` | Detect AI patterns in code snippets |
| `commit_review` | Holistic review of git commits |
| `pattern_explain` | Explain why a strategy flagged content |
| `report_summary` | Natural-language summary of analysis reports |

Skills use structured prompt management with JSON extraction and text-heuristic fallback for reliable parsing.

## Getting Started

### Prerequisites

- OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys), or Anthropic API key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
- Environment variables or config file setup

### Quick Setup

```bash
# Set your API key
export CADENCE_AI_ENABLED=true
export CADENCE_AI_PROVIDER=openai   # or "anthropic"
export CADENCE_AI_KEY=sk-proj-your-key-here

# Run analysis
cadence analyze ./my-repo -o report.txt --config .cadence.yaml
```

## Configuration

See [AI Configuration](/docs/integrations/ai-providers/configuration) for detailed setup instructions, including:
- Environment variables
- Config file options
- Security best practices
- Model selection

## Usage Examples

See [AI Examples](/docs/integrations/ai-providers/examples) for:
- Running analysis with AI enabled
- Analyzing suspicious commits
- Using with webhooks
- Batch processing
- CI/CD integration

## Limitations

- **Token limits**: Large code changes are truncated at line boundaries (2000 characters) with context indication
- **API usage**: Each analysis incurs costs at provider rates
- **Rate limiting**: Subject to provider rate limits
- **Optional only**: AI analysis enhances existing detection, doesn't replace it

## Costs

AI analysis adds API calls to each suspicious commit found. Typical costs:

**OpenAI:**
- `gpt-4o-mini`: ~$0.0001–0.001 per commit analysis
- `gpt-4-turbo`: ~$0.001–0.01 per commit analysis
- `gpt-4`: ~$0.01–0.03 per commit analysis

**Anthropic:**
- `claude-sonnet-4-20250514`: ~$0.003–0.015 per commit analysis
- `claude-haiku`: ~$0.0003–0.001 per commit analysis

Check [OpenAI pricing](https://openai.com/pricing) or [Anthropic pricing](https://anthropic.com/pricing) for current rates.

## Next Steps

- [Configure AI](/docs/integrations/ai-providers/configuration)
- [View examples](/docs/integrations/ai-providers/examples)
- [Understand detection strategies](/docs/cli/detection-strategies)
