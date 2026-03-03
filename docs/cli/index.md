# CLI Reference

Cadence is a command-line tool for detecting AI-generated content in Git repositories and websites. The CLI provides powerful analysis capabilities with flexible output formats and extensive configuration options.

## What is Cadence?

Cadence analyzes:

- **Git repositories** - Examines commit patterns, metadata, and code changes to detect suspicious commits
- **Websites** - Analyzes page content for patterns common in AI-generated text
- **Optional AI validation** — Uses OpenAI or Anthropic to provide expert analysis on detected content

## Available Commands

| Command | Purpose |
|---------|---------|
| [`analyze`](/docs/cli/commands#analyze---git-repository-analysis) | Analyze Git repositories for suspicious commits |
| [`web`](/docs/cli/commands#web---website-content-analysis) | Scan websites for AI-generated content |
| [`webhook`](/docs/cli/commands#webhook---webhook-server) | Run a webhook server for Git platform integration |
| [`config`](/docs/cli/commands#config---configuration-management) | Generate and manage configuration files |
| [`version`](/docs/cli/commands#version---version-information) | Display version and build information |

## Quick Start

### Analyze a Local Repository

```bash
cadence config init          # Create default config
cadence analyze . -o report.json
```

### Analyze a GitHub Repository

```bash
cadence analyze https://github.com/owner/repo -o report.json
```

### Analyze Website Content

```bash
cadence web https://example.com -o report.json --verbose
```

### Start Webhook Server

```bash
cadence webhook --port 8080 --secret "webhook-secret"
```

## Global Flags

These flags work with any command:

```bash
--config string   Path to configuration file
-h, --help        Show command help
```

## Detection Overview

Cadence uses **38 detection strategies** to identify suspicious content:

**Git Analysis Strategies (18):**
- Velocity analysis (additions/deletions per minute)
- Size analysis (commit line count thresholds)
- Timing analysis (commit intervals and patterns)
- File dispersion (files modified per commit)
- Ratio analysis (addition vs deletion balance)
- Commit message analysis (generic message detection)
- Naming pattern analysis (variable and function names)
- Structural consistency (code organization patterns)
- Error handling analysis (missing error handling)
- File extension patterns (file types being modified)
- Statistical anomalies (deviation from baseline)
- Burst pattern analysis (rapid commit clustering)
- Timing anomaly detection (unusual commit timing)
- Merge commit detection (merge pattern analysis)
- Precision analysis (pattern consistency)
- Template pattern detection (boilerplate code)
- Emoji usage detection (excessive emoji patterns)
- Special character detection (unusual character density)

**Web Content Analysis Strategies (20):**
- Overused phrases (common AI filler phrases)
- Generic language (excessive business language)
- Excessive structure (over-organization with lists/headings)
- Perfect grammar (suspiciously uniform sentence lengths)
- Boilerplate text (common filler phrases)
- Repetitive patterns (repeated sentence structures)
- Missing nuance (excessive absolute terms)
- Excessive transitions (overuse of connectors)
- Uniform sentence length (unnatural consistency)
- AI vocabulary (characteristic word choices)
- Emoji overuse (excessive emoji in content)
- Special characters (unusual character usage)
- Missing alt text (images without accessibility)
- Semantic HTML issues (improper tag usage)
- Accessibility markers (missing ARIA attributes)
- Heading hierarchy issues (improper heading structure)
- Hardcoded values (inline styles, pixels, colors)
- Form issues (inputs missing labels/types/names)
- Link text quality (generic or non-descriptive links)
- Generic styling (lack of CSS variables, inline style overuse)

## Command Details

See [CLI Commands](/docs/cli/commands) for complete reference including all flags, options, and examples.

See [Detection Strategies](/docs/cli/detection-strategies) for in-depth documentation on each detection method.

## Configuration

Cadence uses YAML configuration files for thresholds and settings. Generate a default config with:

```bash
cadence config init
```

This creates `.cadence.yaml` with detection thresholds:

```yaml
thresholds:
  # Size-based detection
  suspicious_additions: 500
  suspicious_deletions: 1000
  
  # Velocity-based detection
  max_additions_per_min: 100
  max_deletions_per_min: 500
  
  # Timing-based detection
  min_time_delta_seconds: 60
  
  # File dispersion
  max_files_per_commit: 50
  
  # Ratio-based detection
  max_addition_ratio: 0.95
```

## Output Formats

The `analyze` command detects output format from file extension:

**JSON Format:**
```bash
cadence analyze /repo -o report.json
```

**Text Format:**
```bash
cadence analyze /repo -o report.txt
```

The `web` command uses `--json` for JSON output, otherwise text:

```bash
cadence web https://example.com --json -o report.json
cadence web https://example.com -o report.txt
```

> [!TIP] The reporter system supports 5 formats (JSON, text, HTML, YAML, BSON). All formats are available via the webhook server API. The `analyze` CLI currently supports JSON and text.

## Common Workflows

**Quick repository scan:**
```bash
cadence analyze /path/to/repo -o report.json
```

**Analyze GitHub repository:**
```bash
cadence analyze https://github.com/owner/repo -o report.json
```

**Website analysis with details:**
```bash
cadence web https://example.com --verbose -o report.json
```

**Set up continuous monitoring:**
```bash
cadence webhook --port 8080 --secret "my-secret"
# Configure GitHub webhook to point to your server
```

## Next Steps

- [CLI Commands](/docs/cli/commands) - Complete reference with all options
- [Detection Strategies](/docs/cli/detection-strategies) - Learn how each strategy works
- [Repository Analysis](/docs/analysis/repository) - Real-world analysis examples
- [Configuration](/docs/getting-started/configuration) - Advanced settings and customization
