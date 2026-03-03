---
title: Detector List
description: Complete master list of all 38 Cadence detection strategies
---

# Detection Strategies Reference

This is the master list of all 38 detection strategies that Cadence uses to identify AI-generated content. Strategies are split between Git repository analysis (18) and web content analysis (20).

## Git Repository Detection Strategies (18 Total)

Cadence applies these 18 strategies to Git commit history to detect AI-generated code patterns.

### Size & Velocity Analysis

| # | Detector Name | Category | Description | Type | Configurable | Default Threshold |
|----|--------------|----------|-------------|------|--------------|-------------------|
| 1 | **Velocity Analysis** | Performance | Measures additions/deletions per minute | Git | Yes | 100 adds/min |
| 2 | **Size Analysis** | Performance | Flags commits with excessive line changes | Git | Yes | 500 additions |
| 3 | **Timing Analysis** | Timing | Detects commits within seconds of previous | Git | Yes | 60 seconds |
| 4 | **File Dispersion Analysis** | Scope | Flags commits affecting too many files | Git | Yes | 50 files |
| 5 | **Ratio Analysis** | Balance | Analyzes additions vs deletions balance | Git | Yes | 0.95 ratio |

### Code Quality Analysis

| # | Detector Name | Category | Description | Type | Configurable |
|----|--------------|----------|-------------|------|--------------|
| 6 | **Commit Message Analysis** | Quality | Detects generic/vague commit messages | Git | No |
| 7 | **Naming Pattern Analysis** | Quality | Flags generic variable/function names | Git | No |
| 8 | **Structural Consistency** | Quality | Detects overly uniform code structure | Git | No |
| 9 | **Error Handling Analysis** | Quality | Evaluates error handling completeness | Git | No |
| 10 | **File Extension Pattern** | Quality | Examines types of files being modified | Git | No |

### Anomaly & Pattern Detection

| # | Detector Name | Category | Description | Type | Configurable |
|----|--------------|----------|-------------|------|--------------|
| 11 | **Statistical Anomaly Detection** | Anomaly | Identifies deviations from baseline | Git | No |
| 12 | **Burst Pattern Analysis** | Timing | Detects clusters of rapid commits | Git | No |
| 13 | **Timing Anomaly Detection** | Timing | Flags commits at unusual hours/times | Git | No |
| 14 | **Merge Commit Detection** | Flow | Analyzes merge patterns for anomalies | Git | No |

### Precision & Template Analysis

| # | Detector Name | Category | Description | Type | Configurable |
|----|--------------|----------|-------------|------|--------------|
| 15 | **Precision Analysis** | Consistency | Excessive precision/mechanical patterns | Git | Yes |
| 16 | **Template Pattern Detection** | Patterns | Recognizes template/boilerplate code | Git | No |
| 17 | **Emoji Usage Detection** | Metadata | Detects emoji patterns in messages | Git | No |
| 18 | **Special Character Detection** | Metadata | Flags unusual special char patterns | Git | No |

## Web Content Detection Strategies (20 Total)

Cadence applies these 20 strategies to website content to detect AI-generated text patterns.

### Language & Tone Analysis

| # | Detector Name | Category | Description | Type |
|----|--------------|----------|-------------|------|
| 1 | **Generic Language Detection** | Language | Identifies overused AI phrases | Web |
| 2 | **Perfect Grammar Detection** | Language | Flags unnaturally perfect grammar | Web |
| 3 | **Placeholder Pattern Detection** | Language | Finds filler and placeholder patterns | Web |
| 4 | **Boilerplate Content Detection** | Language | Identifies reused/templated text | Web |
| 6 | **Specificity Analysis** | Language | Evaluates lack of specific details | Web |
| 7 | **Structural Pattern Detection** | Language | Examines organization/formatting patterns | Web |
| 18 | **Overused Phrases Detection** | Language | Identifies common AI clichés | Web |
| 19 | **Perfect Grammar Detection (Web)** | Language | Unnaturally perfect sentence construction | Web |

### Accessibility & HTML Analysis

| # | Detector Name | Category | Description | Type |
|----|--------------|----------|-------------|------|
| 10 | **Missing Alt Text Detection** | Accessibility | Flags images without alt attributes | Web |
| 11 | **Semantic HTML Detection** | HTML | Detects excessive divs vs semantic tags | Web |
| 12 | **Accessibility Markers Detection** | Accessibility | Missing ARIA labels/roles | Web |
| 13 | **Heading Hierarchy Detection** | HTML | Non-sequential heading levels | Web |
| 15 | **Form Issues Detection** | Accessibility | Missing labels, improper input types | Web |

### Style & Design Analysis

| # | Detector Name | Category | Description | Type |
|----|--------------|----------|-------------|------|
| 8 | **Emoji Overuse Detection** | Style | Excessive/misplaced emoji in content | Web |
| 9 | **Special Character Detection** | Style | Unusual special character patterns | Web |
| 14 | **Hardcoded Values Detection** | Style | Hardcoded pixels/colors vs CSS vars | Web |
| 16 | **Generic Link Text Detection** | Style | Generic phrases like "click here" | Web |
| 17 | **Generic Styling Detection** | Design | Default colors, missing theming | Web |
| 20 | **Boilerplate Content Detection (Web)** | Design | Template-like content patterns | Web |

## How Scoring Works

Each strategy produces a suspicion score from **0-100**:

- **0-30**: Low suspicion (normal)
- **31-60**: Medium suspicion (worth investigating)
- **61-100**: High suspicion (likely AI-generated)

### Multiple Strategy Consensus

Cadence doesn't flag content based on a single strategy. Instead:

1. **Individual scores** - Each strategy produces 0-100 score
2. **Consensus** - Multiple strategies must report high scores
3. **Weighting** - Some strategies weighted more heavily than others
4. **Final score** - Overall suspicion from 0-100

**Examples:**
- ✅ Flagged by 5+ strategies = Very likely AI-generated
- ⚠️ Flagged by 2-3 strategies = Worth investigating
- ❌ Flagged by 1 strategy = Likely false positive

## Configuring Detection Strategies

### Adjusting Sensitivity (Git)

Most Git strategies use configurable thresholds in [_threshold-reference.md](_threshold-reference.md):

```yaml
thresholds:
  # Lower values = more sensitive (catches more)
  suspicious_additions: 300      # Default: 500
  max_additions_per_min: 50       # Default: 100
  min_time_delta_seconds: 30      # Default: 60
  max_files_per_commit: 20        # Default: 50
  max_addition_ratio: 0.80        # Default: 0.95
```

### Disabling Strategies

Disable specific strategies if they produce false positives:

```yaml
strategies:
  disabled_strategies:
    - "emoji_usage"           # Disable emoji detection
    - "special_chars"         # Disable special character detection
    - "generic_language"      # Disable generic language (web)
```

Via environment:
```bash
export CADENCE_STRATEGIES_DISABLED="emoji_usage,special_chars"
```

## Strategy Categories

### By Type
- **Git-only**: Strategies 1-18 (commit history)
- **Web-only**: Strategies 1-20 (website content)
- **Both**: None (strategies are domain-specific)

### By Severity Weight
- **High**: Velocity, Size, Timing (Git)
- **Medium**: Message analysis, Patterns
- **Low**: Emoji, Special characters (more prone to false positives)

## Git Strategy Details

### Velocity Analysis
- **What it detects**: Abnormally fast code generation
- **Configurable**: Yes (max_additions_per_min, max_deletions_per_min)
- **Why it matters**: Humans work at 20-50 lines/minute; AI can do 500+
- **False positives**: Bulk imports, automated code generation tools

### Size Analysis
- **What it detects**: Unusually large commits
- **Configurable**: Yes (suspicious_additions, suspicious_deletions)
- **Why it matters**: Humans split work; AI might generate entire modules at once
- **False positives**: Legitimate large refactors, dependency updates

### Timing Analysis
- **What it detects**: Rapid-fire commit bursts
- **Configurable**: Yes (min_time_delta_seconds)
- **Why it matters**: Automation leaves telltale timing patterns
- **False positives**: Merge conflict resolution, cherry-picking

### File Dispersion Analysis
- **What it detects**: Commits affecting too many files
- **Configurable**: Yes (max_files_per_commit)
- **Why it matters**: Humans focus on 1-3 related files; AI generates across modules
- **False positives**: Large refactors, monorepo updates

### Ratio Analysis
- **What it detects**: Imbalanced additions vs deletions
- **Configurable**: Yes (max_addition_ratio, min_deletion_ratio)
- **Why it matters**: AI-generated code is usually additions-heavy
- **False positives**: Feature additions, initial project setup

### Message Analysis
- **What it detects**: Generic/vague commit messages
- **Configurable**: No
- **Why it matters**: AI often generates generic messages; humans are specific
- **False positives**: Quick fixes by humans with lazy messages

### Naming Pattern Analysis
- **What it detects**: Generic variable/function names
- **Configurable**: No
- **Why it matters**: AI generates generic names; humans use semantic names
- **False positives**: Truly generic temporary code, DSLs

### Structural Consistency
- **What it detects**: Overly uniform code structure
- **Configurable**: No
- **Why it matters**: AI generates templated structures; humans vary naturally
- **False positives**: Strict code style enforcement, generated boilerplate

### Error Handling Analysis
- **What it detects**: Missing error handling
- **Configurable**: No
- **Why it matters**: AI often generates incomplete error handling
- **False positives**: Simple utility code that genuinely needs no error handling

### File Extension Pattern
- **What it detects**: Unusual file type combinations
- **Configurable**: No
- **Why it matters**: Certain combinations suggest incomplete or automation-driven changes
- **False positives**: Legitimate diverse changes (e.g., code + docs + config)

### Statistical Anomaly Detection
- **What it detects**: Deviations from baseline patterns
- **Configurable**: No
- **Why it matters**: AI changes look different from repository's natural patterns
- **False positives**: New developer on team, significant refactors

### Burst Pattern Analysis
- **What it detects**: Clusters of rapid commits
- **Configurable**: No
- **Why it matters**: Automation creates burst patterns; humans work more evenly
- **False positives**: Intense work sessions by focused developers

### Timing Anomaly Detection
- **What it detects**: Commits at unusual hours
- **Configurable**: No
- **Why it matters**: Automation doesn't sleep; finds overnight commits
- **False positives**: Remote employees, different timezones, night owls

### Merge Commit Detection
- **What it detects**: Unusual merge patterns
- **Configurable**: No
- **Why it matters**: AI-generated code might have odd branching patterns
- **False positives**: Complex branching strategies, pull request merges

### Precision Analysis
- **What it detects**: Excessive mechanical precision
- **Configurable**: Yes (enable_precision_analysis)
- **Why it matters**: AI generates very uniform, precise patterns
- **False positives**: Code generated by legitimate tools (scaffolding, generators)

### Template Pattern Detection
- **What it detects**: Boilerplate/template code
- **Configurable**: No
- **Why it matters**: AI often uses templates; humans adapt them
- **False positives**: Legitimate scaffolding, framework setup code

### Emoji Usage Detection
- **What it detects**: Emoji in commit messages
- **Configurable**: No (low priority strategy)
- **Why it matters**: Uncommon in AI-generated commits
- **False positives**: Developers who like emoji in messages

### Special Character Detection
- **What it detects**: Unusual special character patterns
- **Configurable**: No (low priority strategy)
- **Why it matters**: Rare pattern in both human and AI code
- **False positives**: DSLs, special formatting, decorative comments

## See Also

- [Detection Strategies Guide](../cli/detection-strategies.md) - Detailed strategy explanations
- [Threshold Reference](_threshold-reference.md) - Configuration threshold tuning
- [CLI Commands](../cli/commands.md) - Command-line analysis
- [Configuration Guide](../getting-started/configuration.md) - Full configuration options
