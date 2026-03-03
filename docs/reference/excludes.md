---
title: File Exclusion Patterns
description: Central reference for file exclusion patterns across Cadence analysis
---

# File Exclusion Patterns Reference

This document serves as the single source of truth for file exclusion patterns used in Cadence analysis. These patterns prevent analysis of files that don't require scanning and improve performance.

## Default Excluded Files

| Pattern | Type | Purpose | Reason |
|---------|------|---------|--------|
| `node_modules/**` | Directory | JavaScript/TypeScript dependencies | Generated code, not user-written |
| `dist/**` | Directory | Compiled/bundled output | Generated code |
| `build/**` | Directory | Build artifacts | Generated code |
| `.git/**` | Directory | Git metadata | Not source code |
| `.env` | File | Environment variables | Secrets and sensitive data |
| `.env.*` | Files | Environment presets | Secrets and sensitive data |
| `*.lock` | Files | Dependency lock files | Generated, verbose |
| `package-lock.json` | File | npm lock file | Generated, unreviewed code |
| `yarn.lock` | File | Yarn lock file | Generated, unreviewed code |
| `pnpm-lock.yaml` | File | pnpm lock file | Generated, unreviewed code |
| `.git` | Directory | Git directory | Metadata, not source code |
| `.hg` | Directory | Mercurial directory | Metadata, not source code |
| `.svn` | Directory | Subversion directory | Metadata, not source code |
| `__pycache__/` | Directory | Python cache | Generated |
| `*.egg-info/` | Directory | Python metadata | Generated |
| `.pytest_cache/` | Directory | pytest cache | Generated |
| `venv/` | Directory | Python virtual environment | Dependencies |
| `.venv/` | Directory | Python virtual environment | Dependencies |
| `vendor/` | Directory | PHP dependencies | Generated code |
| `.cache/**` | Directory | Cache directories | Temporary data |
| `.tmp/**` | Directory | Temporary files | Temporary data |

## Why These Files Are Excluded

### 🔒 Security
- `.env` and `.env.*` files contain API keys and secrets
- These should never be analyzed or exposed in reports

### 📦 Generated Code
- Lock files (`package-lock.json`, `yarn.lock`, etc.) are auto-generated
- Build output (`dist/`, `build/`) is compiled from source
- Dependencies (`node_modules/`, `vendor/`, `venv/`) are installed packages
- Not written by developers, so AI analysis is meaningless

### 📊 Noise Reduction
- Dependency files are extremely verbose
- Lock files can contain thousands of lines
- Analyzing them drastically reduces performance
- They don't contribute signal to AI detection

### 🗂️ Metadata
- `.git/`, `.hg/`, `.svn/` contain version control metadata
- Not user-written source code
- Can bloat analysis with binary data

## Viewing Excluded Files in Analysis

To see which files are being excluded in your current analysis:

```bash
# View exclusion patterns from config
cadence analyze /repo --config cadence.yaml --verbose

# Check config file directly
cat .cadence.yaml | grep -A 10 "exclude_files"
```

## Customizing Exclusions

### In Configuration File

```yaml
exclude_files:
  # Custom exclusions (in addition to defaults)
  - "*.log"           # Exclude log files
  - "temp/**"         # Exclude temp directories
  - "docs/generated/**"  # Exclude auto-generated docs
  
  # Replace defaults entirely (less common)
  # override_exclude: true
```

### Via Environment Variable

```bash
# Comma-separated patterns
export CADENCE_EXCLUDE_FILES="*.log,temp/**,docs/generated/**"
cadence analyze /repo
```

### Via Command Line

```bash
cadence analyze /repo --exclude-files "*.log,temp/**,docs/generated/**"
```

## Common Exclusion Scenarios

### Frontend-Heavy Repository

```yaml
exclude_files:
  - "node_modules/**"
  - "dist/**"
  - "build/**"
  - ".next/**"        # Next.js
  - "*.lock"          # All lock files
  - ".env*"           # Environment files
  - "public/**"       # Static assets
```

### Python Project

```yaml
exclude_files:
  - "__pycache__/**"
  - "*.egg-info/**"
  - ".pytest_cache/**"
  - "venv/**"
  - ".venv/**"
  - "*.pyc"
  - ".env*"
```

### Monorepo

```yaml
exclude_files:
  - "node_modules/**"
  - "dist/**"
  - "build/**"
  - "tmp/**"
  - ".cache/**"
  - "**/*.lock"
  - ".git/**"
  - ".env*"
```

## Performance Impact

Here's a rough performance guide:

| Scenario | Impact | Time Impact |
|----------|--------|-------------|
| With node_modules (not excluded) | High noise | 10-20x slower |
| Without node_modules | Baseline | Normal |
| Only source code excluded | Low noise | Fastest |
| Including all build artifacts | Very high noise | 50x+ slower |

**Recommendation:** Always exclude default patterns for optimal performance.

## See Also

- [Configuration Guide](../getting-started/configuration.md) - Full configuration documentation
- [CLI Commands](../cli/commands.md) - Command-line interface reference
- [Environment Variables](_environment-variables.md) - All CADENCE_* environment variables
