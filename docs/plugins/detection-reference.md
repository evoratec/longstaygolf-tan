---
title: Detection Reference
description: Detection struct fields, severity levels, category constants, and SourceData layout for plugin authors
order: 3
---

# Detection Reference

Reference for the types plugin authors interact with directly: `Detection`, `StrategyInfo`, `SourceData`, and the defined constants for categories and severity.

---

## Detection

`Detection` is the unit of output from a plugin's `Detect()` method. Each detection represents a single fired rule or flagged condition.

```go
type Detection struct {
    Strategy    string   // Must match Info().Name exactly
    Detected    bool     // Always true for returned detections
    Severity    string   // "low", "medium", "high", "critical"
    Score       float64  // Per-instance score (0.0–1.0)
    Confidence  float64  // Strategy reliability weight (0.0–1.0)
    Category    string   // Strategy category, matches Info().Category
    Description string   // Human-readable explanation of this detection
    Examples    []string // Concrete evidence strings (commit messages, code snippets, URLs, etc.)
}
```

### Field Details

**`Strategy`**

The unique identifier of the strategy that produced this detection. Must exactly match `Info().Name` — report consumers use this field to group detections, correlate with `/api/plugins`, and link back to strategy metadata.

**`Detected`**

Always `true` for detections you return. The field exists for internal use in strategy result aggregation — you should never return a `Detection` with `Detected: false`.

**`Severity`**

The impact level of this specific detection. Use the four standard values:

| Value | Description |
|-------|-------------|
| `"low"` | Informational; unlikely to indicate a real problem |
| `"medium"` | Warrants human review but not necessarily blocking |
| `"high"` | Strong indicator of a policy violation or quality issue |
| `"critical"` | Definitive breach; should block merge or trigger alert |

**`Score`**

A per-detection confidence score between `0.0` and `1.0`. This reflects how strongly *this detection instance* fired, and may differ from `Confidence` if your plugin produces detections of varying strength.

Example: a plugin that counts suspicious additions might return `Score: 0.6` for 300 additions and `Score: 0.95` for 800 additions.

**`Confidence`**

The overall reliability of your detection strategy — how often it's right when it fires. Copy this from `Info().Confidence` unless you have a specific reason to vary it per detection. The score aggregator uses this as a weight.

**`Category`**

The logical grouping for this detection. Should match `Info().Category`. See [Category Constants](#category-constants) below.

**`Description`**

A human-readable sentence explaining why this detection fired. Keep it specific enough that a reviewer understands what to look for without context.

```
// Good
"Commit message 'WIP: initial draft' violates no-WIP-on-main policy"

// Too vague
"Suspicious commit detected"
```

**`Examples`**

Concrete string evidence that caused the detection. For commit-based plugins, include the commit message or diff snippet. For code plugins, include the flagged code. For web plugins, include the URL or extracted text.

```go
Examples: []string{
    "WIP: initial draft",          // the commit message
    "function generateReport() {", // the flagged code line
}
```

---

## StrategyInfo

`StrategyInfo` is returned by `Info()` and represents the static metadata for your plugin.

```go
type StrategyInfo struct {
    Name        string   `json:"name"`
    Category    string   `json:"category"`
    Confidence  float64  `json:"confidence"`
    Description string   `json:"description"`
    SourceTypes []string `json:"source_types"`
}
```

| Field | Description |
|-------|-------------|
| `Name` | Unique namespaced identifier, e.g. `"acme.commit-policy"` |
| `Category` | One of the category constants below |
| `Confidence` | Baseline reliability weight (0.0–1.0) |
| `Description` | Short description shown in `/api/plugins` and strategy listings |
| `SourceTypes` | Source types this plugin handles: `"git"`, `"web"`, etc. |

---

## SourceData

`SourceData` is the input to every `Detect()` call. It carries the raw data fetched from the analysis source.

```go
type SourceData struct {
    ID         string                 // e.g., commit hash, repository URL, page URL
    Type       string                 // "git", "web", "npm", "docker", etc.
    RawContent interface{}            // raw fetched data — type depends on source
    Metadata   map[string]interface{} // additional context: author, timestamp, branch, etc.
}
```

### RawContent by Source Type

The concrete type of `RawContent` depends on `Type`. Always type-assert defensively:

```go
// Git source
commits, ok := data.RawContent.([]CommitData)
if !ok {
    return nil, nil
}

// Web source
page, ok := data.RawContent.(WebPageData)
if !ok {
    return nil, nil
}
```

### Common Metadata Keys

Metadata keys are populated by the source adapter and vary by source type. Common keys for `"git"` sources:

| Key | Type | Description |
|-----|------|-------------|
| `"commit_hash"` | `string` | Full commit SHA |
| `"commit_message"` | `string` | Commit message |
| `"author_name"` | `string` | Commit author name |
| `"author_email"` | `string` | Commit author email |
| `"timestamp"` | `time.Time` | Commit timestamp |
| `"branch"` | `string` | Branch being analyzed |
| `"additions"` | `int` | Lines added |
| `"deletions"` | `int` | Lines deleted |

Always type-assert metadata values — use the comma-ok pattern:

```go
message, _ := data.Metadata["commit_message"].(string)
```

---

## Category Constants

Use the predefined category constants from the `analysis` package. These values appear in detection output and strategy registries.

```go
const (
    CategoryVelocity      = "velocity"      // Commit rate, lines-per-minute anomalies
    CategoryStructural    = "structural"    // Code structure and formatting patterns
    CategoryBehavioral    = "behavioral"    // Author or contributor behavior patterns
    CategoryStatistical   = "statistical"  // Statistical anomalies across the codebase
    CategoryPattern       = "pattern"       // Exact or regex pattern matching
    CategoryLinguistic    = "linguistic"    // Natural language analysis of text/comments
    CategoryAccessibility = "accessibility" // Web accessibility and metadata signals
)
```

### Choosing a Category

| Your plugin detects... | Use category |
|------------------------|-------------|
| Unusually fast commits, high volume in short time | `velocity` |
| Uniform code formatting, identical function shapes | `structural` |
| Single contributor making all changes | `behavioral` |
| Statistical outliers in additions/deletions | `statistical` |
| Specific string or regex patterns | `pattern` |
| Generic commit messages, AI-sounding prose | `linguistic` |
| Missing alt text, AI meta tags on web pages | `accessibility` |

---

## Source Type Constants

```go
const (
    SourceTypeGit SourceType = "git"
    SourceTypeWeb SourceType = "web"
)
```

Check `data.Type` against these constants (or their string values) in your `Detect` implementation.

---

## AnalysisReport

The final output of a pipeline run. Plugins do not produce reports directly — the `DetectionRunner` aggregates detections from all strategies (including plugins) into a report.

```go
type AnalysisReport struct {
    ID         string
    SourceType SourceType
    SourceID   string
    AnalyzedAt time.Time
    Duration   time.Duration
    Timing     TimingInfo
    Metrics    SourceMetrics
    // ... detections, strategy results
}
```

Plugin detections contribute to `Metrics.StrategiesHit` and appear in the detection list with their `Strategy` field matching your `Info().Name`.
