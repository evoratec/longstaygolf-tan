---
title: Best Practices
description: Naming conventions, concurrency, confidence calibration, performance, and common pitfalls for Cadence plugins
order: 2
---

# Plugin Best Practices

## Naming

Use a namespaced, kebab-case name for `Info().Name`:

```
<owner>.<plugin-name>
```

**Good:**
- `acme-corp.wip-commit-policy`
- `acme-corp.license-header-check`
- `acme-corp.approved-authors`

**Avoid:**
- `myPlugin` — no namespace, collision risk
- `check` — too generic
- `acme_corp.wip` — underscores are unconventional in Cadence strategy names

Plugin names appear in detection output, logs, `/api/plugins`, and `StrategyRegistry` — choose something a human reviewer will understand at a glance.

---

## Source Type Filtering

Always return early if `data.Type` doesn't match your plugin's `SourceTypes`. Cadence calls all enabled plugins for every analysis run regardless of source type.

```go
func (p *MyPlugin) Detect(ctx context.Context, data *analysis.SourceData) ([]analysis.Detection, error) {
    if data.Type != "git" {
        return nil, nil // not applicable, not an error
    }
    // ...
}
```

Failing to filter means your plugin will run against web content, npm packages, or future source types — likely producing garbage detections or panics.

---

## Returning Detections

Use the `Detection` fields purposefully:

```go
analysis.Detection{
    Strategy:    "acme-corp.wip-commit-policy", // must match Info().Name
    Detected:    true,
    Severity:    "medium",    // "low", "medium", "high", "critical"
    Score:       0.85,        // raw detection score for this instance (0.0–1.0)
    Confidence:  0.9,         // matches Info().Confidence — how reliable this strategy is overall
    Category:    "commit",    // matches Info().Category
    Description: "Commit message starts with WIP — should not be merged to main",
    Examples:    []string{"WIP: fix the thing"},  // concrete evidence strings
}
```

Key rules:
- **`Strategy`** must exactly match `Info().Name` — report consumers group detections by this field
- **`Score`** reflects confidence for *this specific detection* — can vary per instance
- **`Confidence`** reflects the strategy's general reliability — typically copy from `Info().Confidence`
- **`Examples`** should contain the actual strings that triggered detection, not descriptions of them
- Return `nil, nil` (not an empty slice, not an error) when nothing is detected

---

## Confidence Calibration

`Info().Confidence` sets the baseline weight your plugin's detections receive in scoring. Choose it based on your plugin's expected false positive rate:

| Confidence | Signal quality | Example use case |
|------------|---------------|-----------------|
| 0.9–1.0 | Near-certain | Exact policy violation (required header missing) |
| 0.7–0.9 | High signal | Pattern matching with few false positives |
| 0.5–0.7 | Medium signal | Heuristics with meaningful false positive rate |
| 0.3–0.5 | Low signal | Weak indicators, best combined with other strategies |
| < 0.3 | Noise | Reconsider whether this should be a plugin |

Avoid setting `Confidence: 1.0` unless the detection is definitively correct (e.g., reading a machine-readable policy file, not inferring intent).

---

## Severity Levels

Use the four standard severity strings consistently:

| Severity | Use for |
|----------|---------|
| `"low"` | Informational — unlikely to indicate a real problem |
| `"medium"` | Policy violation that warrants review but not blocking |
| `"high"` | Strong indicator of a problem that should block merge |
| `"critical"` | Definitive policy breach or security-relevant finding |

---

## Error Handling

**Return an error** only when your plugin encounters an unexpected failure (I/O error, malformed data, external call failure) — not when it simply doesn't detect anything.

```go
// Correct: nothing detected → nil, nil
if score < threshold {
    return nil, nil
}

// Correct: real failure → nil, error
data, err := fetchExternal(ctx, url)
if err != nil {
    return nil, fmt.Errorf("acme-corp.my-plugin: external fetch failed: %w", err)
}

// Wrong: returning an error to mean "nothing found"
return nil, errors.New("no WIP commits found") // don't do this
```

Wrap errors with your plugin's name so log output is unambiguous.

---

## Concurrency Safety

`PluginManager.RunAll()` calls all enabled plugins sequentially within a single goroutine — but `RunAll` itself may be called from multiple goroutines concurrently (e.g., multiple webhook jobs running in parallel).

Make your plugin safe for concurrent use:

- **No shared mutable state** — if you need config, read it once at construction and treat it as read-only
- **No package-level variables** that are written during `Detect`
- **Mutex if necessary** — if your plugin caches results internally, protect the cache with `sync.RWMutex`

```go
// Safe: config read at construction, never mutated
type MyPlugin struct {
    threshold float64 // set in constructor, read-only after
}

func NewMyPlugin(threshold float64) *MyPlugin {
    return &MyPlugin{threshold: threshold}
}
```

---

## Context Cancellation

Check `ctx.Done()` in any loop or before blocking operations. Cadence respects context cancellation throughout the pipeline — long-running plugins that ignore context will delay cancellation and waste resources.

```go
func (p *MyPlugin) Detect(ctx context.Context, data *analysis.SourceData) ([]analysis.Detection, error) {
    commits, _ := data.RawContent.([]CommitData)

    var detections []analysis.Detection
    for _, c := range commits {
        select {
        case <-ctx.Done():
            return detections, ctx.Err()
        default:
        }
        // ... process commit
    }
    return detections, nil
}
```

---

## Performance

`Detect` may be called thousands of times per analysis run for large repositories. Keep it fast:

- **No network calls** — fetch any external data before analysis or cache it at plugin startup
- **No disk I/O** in the hot path — read config files at construction time
- **Pre-compile regexps** — compile `regexp.MustCompile` once at package init or in the constructor, not inside `Detect`

```go
// Good: compile once
var wipPattern = regexp.MustCompile(`^(?i)WIP[:\s]`)

// Bad: compile on every call
func (p *MyPlugin) Detect(...) {
    r := regexp.MustCompile(`^(?i)WIP[:\s]`) // compiled per invocation
}
```

---

## Don't Rely on Panic Recovery

`PluginManager.safeDetect` recovers from panics and logs them as errors, so a panicking plugin won't crash the process. However, **never intentionally panic** — the recovery path means your plugin's detections are completely dropped for that run.

---

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Not filtering by `data.Type` | False detections on irrelevant sources | Return `nil, nil` early if type doesn't match |
| Setting `Strategy` to a value different from `Info().Name` | Detections can't be correlated back to the plugin | Always use `p.Info().Name` as `Strategy` |
| Returning an error for "nothing found" | Other plugins' detections may be discarded | Return `nil, nil` when nothing detected |
| Compiling regexps inside `Detect` | CPU overhead on every call | Move compilation to `var` or constructor |
| Mutable package-level state | Data races under concurrent analysis | Use struct fields initialized at construction |
| Ignoring `ctx.Done()` | Analysis hangs during cancellation | Check context in loops and before I/O |
