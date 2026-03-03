# Quick Reference

Fast lookup for common Cadence commands and tasks.

> For step-by-step guides, see [Quick Start](/docs/getting-started/quick-start) or [Installation](/docs/getting-started/installation)

## Installation

### Clone and Build

```bash
git clone https://github.com/TryCadence/Cadence.git
cd Cadence
make build              # macOS/Linux
.\scripts\build.ps1     # Windows

./bin/cadence version
```

### Install with Go

```bash
go install github.com/TryCadence/Cadence/cmd/cadence@latest
cadence version
```

## Essential Commands

### Repository Analysis

```bash
# Analyze current directory
cadence analyze . -o report.json

# Analyze local repo
cadence analyze /path/to/repo -o report.json

# Analyze GitHub repo (clones automatically)
cadence analyze https://github.com/owner/repo -o report.json

# Analyze specific branch
cadence analyze https://github.com/owner/repo --branch main -o report.json

# With custom thresholds (flags override config)
cadence analyze /repo --suspicious-additions 1000 -o report.json
cadence analyze /repo --max-additions-pm 150 -o report.json
cadence analyze /repo --min-time-delta 30 -o report.json

# Exclude files
cadence analyze /repo --exclude-files "*.lock,*.log" -o report.json

# With config file
cadence analyze /repo --config .cadence.yaml -o report.json
```

### Website Analysis

```bash
# Analyze website
cadence web https://example.com -o report.json

# Verbose output (detailed findings)
cadence web https://example.com --verbose -o report.json

# JSON format
cadence web https://example.com --json -o report.json

# Text format
cadence web https://example.com -o report.txt
```

### Configuration

```bash
# Print default config to stdout
cadence config

# Create config file in current directory
cadence config init
# Creates .cadence.yaml

# Use config file (always pass explicitly — auto-detection uses cadence.yml)
cadence analyze /repo --config .cadence.yaml -o report.json
```

### Webhook Server

```bash
# Start on default port (8000)
cadence webhook --secret "webhook-secret"

# Custom port and host
cadence webhook --port 8080 --host 0.0.0.0 --secret "webhook-secret"

# With config file
cadence webhook --config .cadence.yaml

# Custom workers and timeouts
cadence webhook --port 8080 --workers 8 --read-timeout 60 --write-timeout 60 --secret "secret"
```

### Version

```bash
cadence version
```

## Configuration Presets

### Sensitive (Strict)

```yaml
thresholds:
  suspicious_additions: 300
  suspicious_deletions: 500
  max_additions_per_min: 50
  max_files_per_commit: 20
  max_addition_ratio: 0.80
  enable_precision_analysis: true
```

### Balanced (Default)

```yaml
thresholds:
  suspicious_additions: 500
  suspicious_deletions: 1000
  max_additions_per_min: 100
  max_files_per_commit: 50
  max_addition_ratio: 0.95
  min_deletion_ratio: 0.95
  min_commit_size_ratio: 100
  enable_precision_analysis: true
```

### Permissive (Lenient)

```yaml
thresholds:
  suspicious_additions: 1000
  suspicious_deletions: 2000
  max_additions_per_min: 200
  max_files_per_commit: 100
  max_addition_ratio: 0.98
```

## Common Exclude Patterns

```yaml
exclude_files:
  - package-lock.json    # Node.js lock file
  - yarn.lock           # Yarn lock file
  - Gemfile.lock        # Ruby lock file
  - "*.min.js"          # Minified files
  - dist/*              # Build output
  - build/*             # Build artifacts
  - ".next/*"           # Next.js output
  - node_modules/*      # Dependencies
  - "*.o"               # Compiled objects
  - "*.exe"             # Executables
```

## Output Formats

Cadence auto-detects format from file extension:

```bash
cadence analyze /repo -o report.json   # JSON format
cadence analyze /repo -o report.txt    # Text format
cadence web https://example.com -o report.json  # JSON
cadence web https://example.com -o report.txt   # Text
```

## Environment Variables

```bash
CADENCE_AI_ENABLED=true               # Enable AI analysis
CADENCE_AI_KEY=sk-...                 # AI provider API key
CADENCE_AI_PROVIDER=openai            # "openai" or "anthropic"
CADENCE_AI_MODEL=gpt-4o-mini          # Model override (optional)
CADENCE_WEBHOOK_PORT=8080             # Webhook listen port
CADENCE_WEBHOOK_SECRET=secret         # Webhook HMAC secret
```

## Make Commands (Build from Source)

```bash
make build    # Build with version injection (output: ./bin/cadence)
make install  # Install to $GOPATH/bin
make test     # Run all tests
make fmt      # Format code
make lint     # Run linter (golangci-lint)
make tidy     # Run go mod tidy
make clean    # Clean artifacts
make help     # Show all targets
```

## Common Workflows

### Analyze Multiple Repos

```bash
for repo in ~/projects/*; do
  cadence analyze "$repo" --config .cadence.yaml -o "reports/$(basename $repo).json"
done
```

### Monitor Website

```bash
cadence web https://example.com --verbose -o report.json
cat reports/report.json | grep -i suspicious
```

### CI/CD Integration

```bash
cadence analyze . --config .cadence.yaml -o report.json
if grep -q '"score": 0\.[89]' reports/report.json; then
  echo "Suspicious commits detected"
  exit 1
fi
```

### Compare Branches

```bash
cadence analyze https://github.com/owner/repo --branch feature -o feature.json
cadence analyze https://github.com/owner/repo --branch main -o main.json
diff reports/feature.json reports/main.json
```

## Getting Help

```bash
cadence --help           # Show all commands
cadence analyze --help   # Help for analyze command
cadence web --help       # Help for web command
cadence config --help    # Help for config command
cadence webhook --help   # Help for webhook command
```

## File Locations

```
Cadence binary:           ./bin/cadence
Configuration file:       .cadence.yaml (in working directory)
Reports:                  ./reports/
Build scripts (Linux/Mac):  ./scripts/build.sh
Build script (Windows):     .\scripts\build.ps1
```

## Important Paths

| Item | Location |
|------|----------|
| Binary after `make build` | `./bin/cadence` (macOS/Linux) or `.\cadence.exe` (Windows) |
| Config file (after `config init`) | `.cadence.yaml` (current directory) |
| Reports directory | `./reports/` (auto-created) |
| System PATH install | `/usr/local/bin/cadence` |

## Next Steps

- [Quick Start](/docs/getting-started/quick-start) - Step-by-step guide (5 min)
- [Understanding Results](/docs/getting-started/understanding-results) - How to read scores, assessments, and detections
- [Installation](/docs/getting-started/installation) - Full installation guide
- [Configuration](/docs/getting-started/configuration) - Custom thresholds
- [CLI Commands](/docs/cli/commands) - Complete command reference
- [Detection Strategies](/docs/cli/detection-strategies) - How analysis works
