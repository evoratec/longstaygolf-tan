---
title: Understanding Results
description: How to read and interpret Cadence analysis reports, score breakdowns, and detection details.
order: 5
---

# Understanding Results

Cadence analysis reports contain a layered set of information — a top‑level verdict, per-strategy detections, and source-specific metrics. This page explains every field so you can act on results with confidence.

---

## Output Formats

Cadence's report engine supports five output formats: `text`, `json`, `html`, `yaml`, and `bson`. Which formats are accessible depends on the command.

### `cadence analyze` — file extension selects format

The `--output`/`-o` flag is **required**. The file extension determines the format:

| Extension | Format |
|-----------|--------|
| `.json` | Structured JSON |
| `.txt` or `.text` | Human-readable text |

```bash
# Save as JSON (CI-friendly)
cadence analyze github.com/owner/repo -o report.json --config .cadence.yaml

# Save as plain text
cadence analyze github.com/owner/repo -o report.txt --config .cadence.yaml
```

Any other extension (e.g., `.bson`, `.html`, `.yaml`) will return an error from the CLI — those formats exist in the underlying reporter but are not yet surfaced as recognized extensions.

### `cadence web` — flag selects format

The `--output`/`-o` flag is optional. Format is controlled by the `--json`/`-j` flag:

| Flags | Format | Output |
|-------|--------|--------|
| *(none)* | Text | stdout |
| `--json` / `-j` | JSON | stdout |
| `-o report.txt` | Text | `reports/report.txt` |
| `--json -o report.json` | JSON | `reports/report.json` |

```bash
# Print human-readable text to terminal
cadence web https://example.com

# Save JSON report to file
cadence web https://example.com --json -o report.json
```

### Output location

When `-o` is used, the file is written inside a `reports/` subdirectory (e.g., `-o report.json` → `reports/report.json`). This directory is created automatically.

---

## Top-Level Fields

Every report has these top-level fields, regardless of source type:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique UUID for this analysis run |
| `sourceType` | string | `"github"`, `"web"`, or `"webhook"` |
| `sourceId` | string | Repository path, URL, or identifier |
| `analyzedAt` | timestamp | When the analysis started |
| `timing` | object | Detailed timing breakdown (see below) |
| `overallScore` | float (0–100) | Composite suspicion score |
| `assessment` | string | Human-readable verdict |
| `suspicionRate` | float (0–1) | Fraction of strategies that triggered |
| `totalDetections` | int | Total strategies evaluated |
| `detectionCount` | int | Strategies that flagged suspicious activity |
| `passedDetections` | int | Strategies that did not flag anything |
| `highSeverityCount` | int | Triggered high-severity strategies |
| `mediumSeverityCount` | int | Triggered medium-severity strategies |
| `lowSeverityCount` | int | Triggered low-severity strategies |
| `sourceMetrics` | object | Source-specific aggregate metrics |
| `detections` | array | Per-strategy results |

---

## Score and Assessment

### `overallScore`

The overall score (0–100) is a **weighted sum** of all triggered detections, capped at 100:

| Severity | Score Contribution |
|----------|--------------------|
| High | `0.4 × confidence` per detection |
| Medium | `0.2 × confidence` per detection |
| Low | `0.1 × confidence` per detection |

`confidence` is a per-strategy weight (0.0–1.0) reflecting how reliable that strategy's signal is. If a strategy does not set confidence, it defaults to `0.5`.

### `assessment`

The assessment string is derived from `overallScore` (for git/repository analysis):

| Score Range | Assessment |
|-------------|------------|
| 70–100 | `"Suspicious Activity Detected"` |
| 40–69 | `"Moderate Suspicion"` |
| 0–39 | `"Low Suspicion"` |

For **web and webhook** analysis, the assessment is derived from the `suspicionRate` (fraction of triggered strategies):

| Suspicion Rate | Assessment |
|----------------|------------|
| ≥ 0.7 (70%) | `"Likely AI-Generated"` |
| ≥ 0.4 (40%) | `"Suspicious Activity"` |
| < 0.4 (40%) | `"Likely Human-Written"` |
| *(content too short)* | `"Content too short for reliable analysis"` |

### `suspicionRate`

```
suspicionRate = detectionCount / totalDetections
```

This is a straightforward ratio — it does **not** account for severity or confidence. Use `overallScore` for a weighted view of risk.

---

## Detections

Each entry in the `detections` array represents one strategy's evaluation result:

| Field | Type | Description |
|-------|------|-------------|
| `strategy` | string | Strategy identifier (e.g., `"commit_message_analysis"`) |
| `detected` | bool | `true` if the strategy flagged suspicious activity |
| `severity` | string | `"high"`, `"medium"`, or `"low"` |
| `score` | float (0–1) | Strategy-level suspicion score |
| `confidence` | float (0–1) | How reliable this strategy's signal is (used as scoring weight) |
| `category` | string | Detection category (e.g., `"linguistic"`, `"behavioral"`) |
| `description` | string | Human-readable explanation of the finding |
| `examples` | []string | Specific examples from the source that contributed to the detection |

### Reading a detection (JSON)

```json
{
  "strategy": "commit_message_analysis",
  "detected": true,
  "severity": "high",
  "score": 0.87,
  "confidence": 0.9,
  "category": "linguistic",
  "description": "Commit messages show uniform formatting and vocabulary inconsistent with organic development",
  "examples": [
    "feat: implement complete authentication system",
    "feat: add full test suite with 100% coverage"
  ]
}
```

### Interpreting severity

| Severity | Meaning | Recommended Action |
|----------|---------|-------------------|
| **High** | Strong signal of inauthentic activity | Manually review the flagged examples |
| **Medium** | Moderate signal worth investigating | Correlate with other detections |
| **Low** | Weak or ambiguous signal | Consider context; may be a false positive |

Strategies with `detected: false` appear in the report as passed checks — they confirm the source passed that signal's test.

---

## Source Metrics

`sourceMetrics` contains aggregate statistics computed across all analyzed items:

| Field | Type | Description |
|-------|------|-------------|
| `itemsAnalyzed` | int | Total items examined (commits or word count) |
| `itemsFlagged` | int | Items that triggered at least one detection |
| `uniqueAuthors` | int | Number of distinct commit authors (git only) |
| `averageScore` | float (0–1) | Mean per-item suspicion score |
| `coverageRate` | float (0–1) | Fraction of items that were analyzed |
| `strategiesUsed` | int | Total strategies that ran |
| `strategiesHit` | int | Strategies that produced a detection |
| `extra` | object | Source-type-specific additional metrics |

### Git-specific `extra` fields

| Key | Description |
|-----|-------------|
| `timeSpan` | Duration string covering the repository's history |
| `velocity` | Average commits per time unit |

### Web-specific `extra` fields

| Key | Description |
|-----|-------------|
| `wordCount` | Total words in the analyzed content |
| `characterCount` | Total character count |
| `headingCount` | Number of headings detected |

---

## Timing

The `timing` object records how long each phase of the analysis took:

```json
{
  "timing": {
    "startedAt": "2024-01-15T10:00:00Z",
    "completedAt": "2024-01-15T10:00:04.5Z",
    "durationMs": 4500,
    "durationSeconds": 4.5,
    "phases": [
      { "name": "fetch",    "startedAt": "...", "durationMs": 1200 },
      { "name": "analyze",  "startedAt": "...", "durationMs": 3100 },
      { "name": "report",   "startedAt": "...", "durationMs": 200  }
    ]
  }
}
```

---

## Sample Text Report

The text format printed by default (or to `.txt`) looks like this:

```
═══════════════════════════════════════════════════════════
CADENCE ANALYSIS REPORT - github
═══════════════════════════════════════════════════════════

Source ID:      github.com/owner/repo
Analysis ID:    a1b2c3d4-...
Started At:     2024-01-15 10:00:00.000 UTC
Completed At:   2024-01-15 10:00:04.500 UTC
Duration:       4.50s

Phase Breakdown:
  ├─ fetch:       1.20s
  ├─ analyze:     3.10s
  └─ report:      200ms

─────────────────────────────────────────────────────────────
ASSESSMENT
─────────────────────────────────────────────────────────────
Overall Score:  72.4%
Assessment:     Suspicious Activity Detected
Suspicion Rate: 60.0%

─────────────────────────────────────────────────────────────
STATISTICS
─────────────────────────────────────────────────────────────
Total Detections:     9
Detected:             5
Passed:               4
  ├─ High Severity:   2
  ├─ Medium Severity: 2
  └─ Low Severity:    1

─────────────────────────────────────────────────────────────
SOURCE METRICS
─────────────────────────────────────────────────────────────
Items Analyzed:       147
Items Flagged:        5
Unique Authors:       1
Average Score:        0.62
Coverage Rate:        100.0%
Strategies Used:      9
Strategies Triggered: 5
  timeSpan: 6 hours
  velocity: 24.5 commits/hour

─────────────────────────────────────────────────────────────
HIGH SEVERITY DETECTIONS
─────────────────────────────────────────────────────────────
• commit_message_analysis [linguistic] (87% score, 90% weight)
  Commit messages show uniform formatting inconsistent with organic development
  Examples: feat: implement complete auth system, feat: add full test suite
```

---

## Acting on Results

**Start with high-severity detections.** These carry the most scoring weight and the clearest signals. For each:

1. Read the `description` to understand what the strategy found.
2. Review the `examples` — these are direct quotes from the source.
3. Decide whether the finding is a true positive or an explainable pattern (e.g., a team using standardised commit conventions).

**Correlate across detections.** A single triggered strategy may be a false positive. Multiple triggered strategies — especially across different categories (`linguistic`, `behavioral`, `structural`) — are much more diagnostic.

**Use `suspicionRate` for a quick triage.** If under 20%, the source passed most checks with low confidence findings; if over 60%, multiple independent signals align.

**Save JSON for pipelines.** Use `-o report.json` in CI so downstream tools can parse `overallScore`, `highSeverityCount`, and `assessment` programmatically.

---

## Related Pages

- [Quick Start](./quick-start.md) — running your first analysis
- [Quick Reference](./quick-reference.md) — all flags and environment variables
- [Detection Reference](../plugins/detection-reference.md) — full field documentation and category constants
