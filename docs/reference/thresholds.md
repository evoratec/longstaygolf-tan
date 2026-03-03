---
title: Threshold Configuration
description: Central reference for all detection thresholds and their recommended values
---

# Threshold Configuration Reference

This is the single source of truth for all Cadence detection thresholds. Thresholds control the sensitivity of detection strategies and can be tuned for your specific needs.

## All Configuration Thresholds

| Threshold | Default | Minimum | Maximum | Unit | Description |
|-----------|---------|---------|---------|------|-------------|
| `suspicious_additions` | 500 | 100 | 10000 | lines | Flag commits with more additions than this |
| `suspicious_deletions` | 1000 | 100 | 10000 | lines | Flag commits with more deletions than this |
| `max_additions_per_min` | 100 | 10 | 500 | lines/min | Flag if additions per minute exceeds this |
| `max_deletions_per_min` | 500 | 50 | 1000 | lines/min | Flag if deletions per minute exceeds this |
| `min_time_delta_seconds` | 60 | 0 | 300 | seconds | Flag if commits are within N seconds of previous |
| `max_files_per_commit` | 50 | 10 | 200 | files | Flag commits modifying more files than this |
| `max_addition_ratio` | 0.95 | 0.0 | 1.0 | ratio | Flag if additions are >N ratio (0=0%, 1=100%) |
| `min_deletion_ratio` | 0.95 | 0.0 | 1.0 | ratio | Flag if deletions are >N ratio (0=0%, 1=100%) |
| `min_commit_size_ratio` | 100 | 10 | 1000 | lines | Minimum commit size for ratio analysis |
| `enable_precision_analysis` | true | - | - | bool | Enable precision/consistency analysis |

## Size-Based Thresholds

### suspicious_additions
**Default:** `500` lines

Controls how many lines must be added in a single commit to flag it as suspicious.

| Value | Behavior | Use Case |
|-------|----------|----------|
| 300 | Very sensitive | Strict AI detection, research repos |
| 500 | Default (balanced) | General purpose, most projects |
| 1000 | Lenient | Projects with legitimate large commits |
| 2000 | Very lenient | Monorepos, generated code repos |

**Impact of decreasing** (e.g., 500 → 300):
- ✅ Catches more potential AI-generated code
- ✅ More sensitive to subtle patterns
- ❌ Increased false positives
- ❌ May flag legitimate large features

**Impact of increasing** (e.g., 500 → 1000):
- ✅ Fewer false positives
- ✅ Allows large legitimate commits
- ❌ Misses AI-generated large modules
- ❌ Less sensitive detection

### suspicious_deletions
**Default:** `1000` lines

Controls how many lines must be deleted in a commit to flag it as suspicious.

| Value | Behavior | Use Case |
|-------|----------|----------|
| 500 | Sensitive | Strict AI detection |
| 1000 | Default (balanced) | General purpose |
| 2000 | Lenient | Projects with bulk refactors |

**Note:** Deletions are typically less suspicious than additions (humans delete more than AI).

## Velocity-Based Thresholds

### max_additions_per_min
**Default:** `100` lines/minute

Determines how many lines can be added per minute before flagging as suspicious.

| Value | Behavior | Interpretation |
|-------|----------|-----------------|
| 50 | Very strict | <1 line per second average |
| 100 | Default (balanced) | ~2 lines per second average |
| 200 | Lenient | ~3 lines per second average |
| 300+ | Very lenient | Allows bulk operations |

**Typical patterns:**
- Human baseline: 20-50 lines/minute
- AI-generated code: 100-500+ lines/minute
- Build system output: 1000+ lines/minute

**Example calculations:**
- Commit: 5000 additions in 10 minutes → 500 adds/min (very suspicious!)
- Commit: 300 additions in 15 minutes → 20 adds/min (normal)

### max_deletions_per_min
**Default:** `500` lines/minute

Controls deletion velocity. Usually higher than additions since bulk deletions are more common.

| Value | Behavior | Use Case |
|-------|----------|----------|
| 200 | Very strict | Strict deletion monitoring |
| 500 | Default (balanced) | General purpose |
| 1000 | Lenient | Projects with bulk cleanup |

## Timing-Based Thresholds

### min_time_delta_seconds
**Default:** `60` seconds

Minimum time between consecutive commits. Commits faster than this are flagged as suspicious.

| Value | Behavior | Pattern |
|-------|----------|---------|
| 0 | Disabled | (no timing check) |
| 30 | Very strict | Flags commits within 30 seconds |
| 60 | Default (balanced) | Flags rapid bursts (1/min+) |
| 120 | Lenient | Allows faster commits |
| 300 | Very lenient | Must be within 5 minutes |

**Suspicious patterns:**
- Commits at 0:00, 0:01, 0:02 (1/second) = extremely suspicious
- Commits at 0:00, 0:01, 0:02, 0:03 (1/minute) = suspicious
- Commits at 0:00, 1:00, 2:00 (hourly) = normal

**Note:** Set to 0 to disable timing checks entirely.

## File Dispersion Thresholds

### max_files_per_commit
**Default:** `50` files

Controls how many files can be modified per commit before flagging as suspicious.

| Value | Behavior | Use Case |
|-------|----------|----------|
| 20 | Very strict | Strict focused commits |
| 50 | Default (balanced) | General purpose, most projects |
| 100 | Lenient | Large features, monorepos |
| 200+ | Very lenient | Major refactors, migrations |

**Suspicious patterns:**
- Single commit modifying 100+ files = very suspicious
- Single commit modifying 30+ unrelated modules = suspicious
- Single commit modifying 5-10 related files = normal

**Examples:**
- Feature: backend/auth/ (10 files) + frontend/auth/ (8 files) = 18 files (normal)
- Refactor: {100+ files scattered across codebase} (very suspicious)

## Ratio-Based Thresholds

### max_addition_ratio
**Default:** `0.95` (95%)

Controls the maximum percentage of additions vs total changes. Heavily additions-weighted commits are suspicious.

| Value | Behavior | Interpretation |
|-------|----------|-----------------|
| 0.80 | 80% additions | Very strict (mostly deletions tolerated) |
| 0.90 | 90% additions | Strict |
| 0.95 | 95% additions | Default (balanced) |
| 0.99 | 99% additions | Very lenient (almost all additions OK) |

**Calculation:** `additions / (additions + deletions)`

**Examples:**
- Commit: 1000 additions, 10 deletions → 99% additions (suspicious!)
- Commit: 500 additions, 500 deletions → 50% additions (normal)
- Commit: 100 additions, 200 deletions → 33% additions (normal)

**Why it matters:**
- AI-generated code is typically additions-heavy (copy-paste, no cleanup)
- Human code is more balanced (refactor, delete old code)

### min_deletion_ratio
**Default:** `0.95` (95%)

Controls deletion ratios. Mostly-deletion commits are suspicious (bulk deletes).

| Value | Behavior | Interpretation |
|-------|----------|-----------------|
| 0.80 | 80% deletions | Strict |
| 0.95 | 95% deletions | Default (balanced) |
| 0.99 | 99% deletions | Lenient |

**Usually less important than `max_addition_ratio`** since bulk deletions are more legitimate.

### min_commit_size_ratio
**Default:** `100` lines

Minimum total lines in a commit for ratio analysis to apply. Small commits skip ratio checks.

| Value | Behavior | Use Case |
|-------|----------|----------|
| 50 | Very strict | Check all commits |
| 100 | Default | Skip tiny commits |
| 200 | Lenient | Only analyze large commits |

## Precision Analysis Threshold

### enable_precision_analysis
**Default:** `true` (enabled)

Enables the precision/consistency detection strategy that flags overly mechanical code patterns.

| Value | Behavior |
|-------|----------|
| true | Analyzes code precision/consistency |
| false | Disables this strategy |

**When to disable:**
- Projects with strict code style that looks "too perfect"
- Scaffolding-heavy projects
- Generated code that's intentionally uniform

## Configuration Presets

### Preset 1: Sensitive (High Sensitivity)

For strict AI detection, catching subtle patterns:

```yaml
thresholds:
  suspicious_additions: 300
  suspicious_deletions: 500
  max_additions_per_min: 50
  max_deletions_per_min: 200
  min_time_delta_seconds: 30
  max_files_per_commit: 20
  max_addition_ratio: 0.80
  min_deletion_ratio: 0.95
  min_commit_size_ratio: 50
  enable_precision_analysis: true
```

**Use when:**
- Code quality is critical
- Want to catch even subtle AI patterns
- Research or trusted team environments

**Tradeoff:** More false positives to catch more suspicious commits.

### Preset 2: Balanced (Default)

The default configuration, good for most projects:

```yaml
thresholds:
  suspicious_additions: 500
  suspicious_deletions: 1000
  max_additions_per_min: 100
  max_deletions_per_min: 500
  min_time_delta_seconds: 60
  max_files_per_commit: 50
  max_addition_ratio: 0.95
  min_deletion_ratio: 0.95
  min_commit_size_ratio: 100
  enable_precision_analysis: true
```

**Use when:**
- General-purpose detection
- Want balanced sensitivity
- Most projects

### Preset 3: Lenient (Low Sensitivity)

For projects with legitimate large commits or rapid development:

```yaml
thresholds:
  suspicious_additions: 1000
  suspicious_deletions: 2000
  max_additions_per_min: 200
  max_deletions_per_min: 1000
  min_time_delta_seconds: 120
  max_files_per_commit: 100
  max_addition_ratio: 0.98
  min_deletion_ratio: 0.99
  min_commit_size_ratio: 200
  enable_precision_analysis: false
```

**Use when:**
- Large monorepos with legitimate big commits
- Automated tools generate frequent bulk changes
- Want minimal false positives
- Trust development team

**Tradeoff:** May miss AI-generated code.

### Preset 4: Experimental (Very High Sensitivity)

For research or maximum AI detection possible:

```yaml
thresholds:
  suspicious_additions: 200
  suspicious_deletions: 300
  max_additions_per_min: 25
  max_deletions_per_min: 100
  min_time_delta_seconds: 15
  max_files_per_commit: 10
  max_addition_ratio: 0.70
  min_deletion_ratio: 0.90
  min_commit_size_ratio: 20
  enable_precision_analysis: true
```

**Use when:**
- Research projects
- Want to maximize AI detection
- Willing to accept high false positive rate

## Tuning Your Thresholds

### Step 1: Start with a Preset

Begin with one of the presets above matching your project type.

### Step 2: Run Analysis

Analyze your repository with the preset:

```bash
cadence analyze /repo --config cadence.yaml
```

### Step 3: Evaluate Results

Review the flagged commits:
- Are they legitimate? (False positives)
- Are they suspicious? (True positives)
- Are you missing flagging legitimate AI code? (False negatives)

### Step 4: Adjust and Re-run

Based on results, adjust thresholds:

```yaml
# If too many false positives:
suspicious_additions: 750  # Increase
max_additions_per_min: 150   # Increase

# If too many false negatives:
suspicious_additions: 350   # Decrease
max_additions_per_min: 75    # Decrease
max_files_per_commit: 35     # Decrease
```

## Impact Analysis

### Changing suspicious_additions

| Value | False Positives | False Negatives | Recommended For |
|-------|-----------------|-----------------|-----------------|
| 300 | High | Low | Strict projects |
| 500 | Medium | Low | Most projects (default) |
| 1000 | Low | High | Large projects |

### Changing max_additions_per_min

| Value | False Positives | False Negatives | Recommended For |
|-------|-----------------|-----------------|-----------------|
| 50 | High | Low | Strict projects |
| 100 | Medium | Medium | Balanced (default) |
| 200 | Low | High | Automated tooling |

### Changing min_time_delta_seconds

| Value | False Positives | False Negatives | Recommended For |
|-------|-----------------|-----------------|-----------------|
| 30 | Medium | Low | Strict timing |
| 60 | Medium | Medium | Balanced (default) |
| 120 | Low | Medium | Lenient timing |
| 0 (disabled) | N/A | High | Ignore timing |

## Environment Variable Equivalents

All thresholds can be set via environment variables with the `CADENCE_THRESHOLDS_` prefix:

```bash
export CADENCE_THRESHOLDS_SUSPICIOUS_ADDITIONS=350
export CADENCE_THRESHOLDS_MAX_ADDITIONS_PER_MIN=75
export CADENCE_THRESHOLDS_MIN_TIME_DELTA_SECONDS=45
```

Example full environment:

```bash
export CADENCE_THRESHOLDS_SUSPICIOUS_ADDITIONS=500
export CADENCE_THRESHOLDS_SUSPICIOUS_DELETIONS=1000
export CADENCE_THRESHOLDS_MAX_ADDITIONS_PER_MIN=100
export CADENCE_THRESHOLDS_MAX_DELETIONS_PER_MIN=500
export CADENCE_THRESHOLDS_MIN_TIME_DELTA_SECONDS=60
export CADENCE_THRESHOLDS_MAX_FILES_PER_COMMIT=50
export CADENCE_THRESHOLDS_MAX_ADDITION_RATIO=0.95
export CADENCE_THRESHOLDS_ENABLE_PRECISION_ANALYSIS=true
```

## Configuration File Format

Use `cadence.yaml`:

```yaml
thresholds:
  suspicious_additions: 500
  suspicious_deletions: 1000
  max_additions_per_min: 100
  max_deletions_per_min: 500
  min_time_delta_seconds: 60
  max_files_per_commit: 50
  max_addition_ratio: 0.95
  min_deletion_ratio: 0.95
  min_commit_size_ratio: 100
  enable_precision_analysis: true
```

## Recommended Values by Repository Type

| Repository Type | suspicious_additions | max_additions_per_min | max_files_per_commit | max_addition_ratio |
|-----------------|----------------------|----------------------|----------------------|-------------------|
| Small project | 300-400 | 50-75 | 20-30 | 0.80-0.90 |
| Medium project | 500 | 100 | 50 | 0.95 |
| Large monorepo | 1000-1500 | 150-200 | 75-100 | 0.97-0.99 |
| Build/generated | 2000+ | 300+ | 150+ | 0.99+ |

## Monitoring Threshold Impact

To see how threshold changes affect analysis:

```bash
# Run with verbose output
cadence analyze /repo --config cadence.yaml --verbose

# Shows which thresholds triggered for each flagged commit
```

## See Also

- [Environment Variables Reference](_environment-variables.md) - All CADENCE_* variables
- [File Exclusion Patterns](_excludes-reference.md) - File exclusion reference
- [Detection Strategies Reference](_detector-list.md) - All 38 detection strategies
- [Configuration Guide](../getting-started/configuration.md) - Full configuration documentation
- [CLI Commands](../cli/commands.md) - Command-line tools and examples
