---
title: Internal Skills
description: The four built-in Go AI skills — code_analysis, commit_review, pattern_explain, and report_summary
order: 1
---

# Internal Skills

Cadence ships four built-in AI skills implemented in Go. Each skill targets a specific point in the analysis pipeline and produces structured JSON output consumed by the report engine.

All skills require AI to be enabled — see [Agent Skills overview](/docs/integrations/agent-skills) for setup.

---

## code_analysis

**Purpose:** Determine whether a given code snippet is likely AI-generated.

**Invoked on:** Individual code blocks extracted during analysis

**Input fields passed to the model:**
- The raw code snippet (truncated to 2,000 characters)
- File path / language context

**Output fields:**

| Field | Type | Description |
|-------|------|-------------|
| `is_ai_generated` | boolean | Whether the code is likely AI-generated |
| `confidence` | float | Confidence score (0.0–1.0) |
| `reasoning` | string | Brief explanation of the assessment |
| `indicators` | string[] | Specific patterns that contributed to the judgment |

**Model budget:** 1,024 output tokens max

**Example output:**

```json
{
  "is_ai_generated": true,
  "confidence": 0.87,
  "reasoning": "Uniform naming conventions and boilerplate comment structure are consistent with LLM output",
  "indicators": ["camelCase throughout", "every function has a docstring", "no typos or asymmetric indentation"]
}
```

---

## commit_review

**Purpose:** Provide a holistic assessment of a commit across four dimensions.

**Invoked on:** Individual commits during repository analysis

**Input fields passed to the model:**
- Commit message
- Diff shape (lines added/removed per file)
- File scope (paths changed)
- Representative code quality sample

**Output fields:**

| Field | Type | Description |
|-------|------|-------------|
| `commit_message_score` | float | Quality score for the commit message (0.0–1.0) |
| `code_score` | float | Quality/authenticity score for the code changes (0.0–1.0) |
| `summary` | string | One-sentence assessment |
| `flags` | string[] | Any notable concerns (e.g., "generic commit message", "AI boilerplate detected") |

**Example output:**

```json
{
  "commit_message_score": 0.4,
  "code_score": 0.78,
  "summary": "Code changes appear genuine but the commit message is unusually generic",
  "flags": ["generic commit message: 'Update files'"]
}
```

---

## pattern_explain

**Purpose:** Explain why a specific detection strategy fired and assess false positive likelihood.

**Invoked on:** Each detection produced during analysis

**Input fields passed to the model:**
- Strategy name and category
- The detection's evidence payload
- Relevant code or metadata snippet

**Output fields:**

| Field | Type | Description |
|-------|------|-------------|
| `explanation` | string | Human-readable explanation of the detection |
| `false_positive_likelihood` | float | Estimated probability this is a false positive (0.0–1.0) |
| `suggestions` | string[] | Recommended next steps for the reviewer |

**Model budget:** 512 output tokens max

**Example output:**

```json
{
  "explanation": "The commit pattern strategy detected uniformly structured commits across 14 files with identical formatting, which is more consistent with AI-generated batches than organic development",
  "false_positive_likelihood": 0.12,
  "suggestions": [
    "Review commit history for batch-generated commits",
    "Check whether the author used a code generation tool"
  ]
}
```

---

## report_summary

**Purpose:** Generate a human-readable narrative summary of a complete analysis report.

**Invoked on:** The full `AnalysisReport` at the end of a pipeline run

**Input fields passed to the model:**
- Suspicion score
- All detections with their strategies
- Metrics (commit count, files changed, contributor stats)

**Output fields:**

| Field | Type | Description |
|-------|------|-------------|
| `risk_level` | string | One of: `none`, `low`, `medium`, `high`, `critical` |
| `summary` | string | 2–4 sentence narrative for a technical reviewer |
| `next_steps` | string[] | Prioritized recommendations |
| `highlighted_findings` | string[] | The most significant detections |

**Example output:**

```json
{
  "risk_level": "high",
  "summary": "This repository shows strong indicators of AI-assisted development across 73% of recent commits. The commit pattern and code uniformity strategies both fired with high confidence. Human review of the flagged commits is strongly recommended before merging.",
  "next_steps": [
    "Review commit range a1b2c3..d4e5f6 for AI-generated content",
    "Verify contributor identity for the top 2 committers",
    "Consider enabling stricter commit message policy"
  ],
  "highlighted_findings": [
    "commit_pattern: 14 commits with identical structure",
    "code_analysis: 8 of 12 sampled files scored >0.8 AI confidence"
  ]
}
```

---

## Running Skills Programmatically

If you're embedding Cadence as a library, you can invoke skills directly via the `SkillRunner`:

```go
runner := ai.NewSkillRunner(provider)

result, err := runner.RunByName(ctx, "report_summary", map[string]any{
    "report": report,
})
```

The four skill names are: `code_analysis`, `commit_review`, `pattern_explain`, `report_summary`.
