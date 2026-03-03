# Repository Analysis

Repository analysis evaluates the overall quality and authenticity of a Git repository by examining commit patterns, code changes, and statistical anomalies across time.

## Detection Approach

Cadence doesn't look for a single "smoking gun" — instead, it applies **18 independent detection strategies** that each score commits on a 0–100 scale. A commit is flagged as suspicious when multiple strategies report high scores, indicating a pattern of suspicious behavior rather than a single anomalous value.

## Core Strategies

The repository analyzer uses these fundamental detection methods:

### Size Analysis
Examines commit size (additions and deletions) against thresholds. Commits with unusually large changes can indicate batch-generated code.

### Velocity Analysis
Measures the rate of change (additions/deletions per minute). Consistently high velocity may indicate automated code generation rather than thoughtful, manual development.

### Timing Analysis
Analyzes the time intervals between commits. Unusual patterns in commit spacing can reveal non-human behavior like:
- Regular intervals (suggesting batch operations)
- Clustering (rapid-fire commits)
- Unusual timezone patterns

### File Dispersion Analysis
Examines how many files are modified per commit. Highly dispersed changes (many files) or highly concentrated changes (few files) can indicate automation.

### Ratio Analysis
Analyzes the balance between additions and deletions. Suspicious ratios can indicate copy-paste code, bulk formatting changes, or generated content.

### Commit Message Analysis
Detects generic, vague, or auto-generated commit messages. Patterns like:
- Single word commits ("fix", "update", "refactor")
- Generic phrases ("made changes", "code review", "improvements")
- Completely missing descriptions
- Suspiciously generic English

### Naming Pattern Analysis
Examines variable and function names for patterns. Suspicious patterns include:
- Overly generic naming (var1, temp, data)
- Inconsistent naming conventions
- Missing semantic meaning
- Uniform naming patterns across unrelated components

### Structural Consistency Analysis
Detects overly uniform code structure that suggests automated generation. Real developers vary their approach; AI may produce repetitive patterns.

### Error Handling Analysis
Evaluates the presence and quality of error handling. Suspiciously absent error handling or error handling that's too generic can indicate low-effort or AI-generated code.

### File Extension Pattern Analysis
Examines if file types being modified are unusual or suggest incomplete/test code.

### Statistical Anomaly Detection
Calculates deviations from the repository's baseline patterns. If a commit drastically differs from the repository's normal behavior, it's flagged.

### Burst Pattern Analysis
Identifies clusters of rapid commits. Multiple commits in quick succession can indicate:
- Automated bulk operations
- Generated code being committed as-is
- Cleanup commits (suggesting poor initial code)

### Timing Anomaly Detection
Detects unusual commit timing (e.g., commits at exact intervals, commits at odd hours consistently, timezone inconsistencies).

## How Scores Work

Each strategy produces a suspicion score from 0-100:
- **0-30**: Not suspicious
- **31-70**: Moderately suspicious
- **71-100**: Highly suspicious

A single high score on one strategy isn't conclusive — instead, Cadence looks for **consensus across multiple strategies**. A commit flagged by 5+ strategies is much more likely to be suspicious than one flagged by just one.

## Integration with Git Analysis

Repository analysis provides high-level insights and summary statistics. For deeper analysis of individual commits and patterns, see [Git Analysis](/docs/analysis/git).

## Using Repository Analysis

Repository analysis is typically the entry point. Run it with:

```bash
cadence analyze /path/to/repo -o report.json
```

This produces a report showing:
- Summary statistics for the repository
- Flagged commits with suspicion scores
- Strategy breakdown for each flagged commit
- Timing information with phase durations
- Source metrics and severity counts
- Recommendations

Supported output formats: JSON, text, HTML, YAML, BSON.
