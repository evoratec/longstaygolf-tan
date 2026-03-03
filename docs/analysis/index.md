# Analysis Overview

Cadence performs three types of analysis to detect suspicious or AI-generated content:

## Repository Analysis

Analyzes Git repositories for suspicious commit patterns that may indicate AI-generated or low-effort code. This includes examining:

- **Commit metadata** - authors, timestamps, commit frequency
- **Code changes** - file counts, line additions/deletions, change ratios
- **Patterns** - velocity anomalies, timing irregularities, structural consistency
- **Content** - commit messages, variable names, code structure

See [Repository Analysis](/docs/analysis/repository) for detailed strategy information.

## Git Analysis

Deep dive into Git commit history using 18 detection strategies. Cadence examines commit patterns across time to identify statistical anomalies and behavioral indicators of AI-generated code.

Detection strategies analyze:

- **Velocity** - additions/deletions per minute
- **Timing** - intervals between commits, burst patterns
- **Size** - individual commit sizes and consistency
- **Structure** - file dispersion, naming patterns, code organization
- **Content** - commit messages, error handling, code quality indicators

See [Git Analysis](/docs/analysis/git) for complete strategy documentation.

## Web Content Analysis

Analyzes website content and text for patterns common in AI-generated or low-quality content ("slop"). Examines:

- **Language patterns** - overused phrases, generic terminology, missing specificity
- **Grammar** - suspiciously perfect grammar, uniform sentence structure
- **Content** - placeholder patterns, boilerplate text, lack of nuance
- **Structure** - excessive formatting, templated organization, repetitive sections

See [Web Analysis](/docs/analysis/web) for detection pattern details.

---

**Start with** [Repository Analysis](/docs/analysis/repository) to understand how Cadence evaluates code quality, or jump to [Git Analysis](/docs/analysis/git) for detailed commit-level detection strategies.
