---
title: Writing Plugins
description: Implement the StrategyPlugin interface to add custom detection strategies to Cadence
order: 1
---

# Writing Plugins

This guide covers implementing the `StrategyPlugin` interface, registering plugins with `PluginManager`, enabling/disabling plugins at runtime, and integrating plugins with the webhook server.

## The StrategyPlugin Interface

Every Cadence plugin must implement two methods:

```go
type StrategyPlugin interface {
    Info() StrategyInfo
    Detect(ctx context.Context, data *SourceData) ([]Detection, error)
}
```

### `Info() StrategyInfo`

Returns static metadata about your plugin. The `Name` field is the unique identifier — registering a second plugin with the same name replaces the first (enabling hot-reload patterns).

```go
type StrategyInfo struct {
    Name        string   // Unique strategy identifier, e.g. "my-org.commit-policy"
    Category    string   // Logical category, e.g. "commit", "code", "web"
    Description string   // Human-readable description
    SourceTypes []string // Source types this strategy applies to: "git", "web", etc.
    Confidence  float64  // Baseline confidence for this strategy's detections (0.0–1.0)
}
```

### `Detect(ctx, *SourceData) ([]Detection, error)`

Runs your detection logic and returns zero or more detections. A panic inside `Detect` is caught by `PluginManager.safeDetect` — the plugin is logged as failed and execution continues for other plugins.

```go
type SourceData struct {
    ID         string                 // e.g., commit hash or URL
    Type       string                 // "git", "web", "npm", etc.
    RawContent interface{}            // The raw fetched data
    Metadata   map[string]interface{} // Author, timestamp, etc.
}
```

Return `nil, nil` when nothing is detected — an empty slice and nil are both safe, but `nil, nil` is idiomatic.

---

## Minimal Plugin Example

```go
package myplugin

import (
    "context"
    "strings"

    "github.com/TryCadence/Cadence/internal/analysis"
)

// CommitPolicyPlugin enforces a commit message policy.
type CommitPolicyPlugin struct{}

func (p *CommitPolicyPlugin) Info() analysis.StrategyInfo {
    return analysis.StrategyInfo{
        Name:        "my-org.commit-policy",
        Category:    "commit",
        Description: "Flags commits that violate our commit message policy",
        SourceTypes: []string{"git"},
        Confidence:  0.9,
    }
}

func (p *CommitPolicyPlugin) Detect(ctx context.Context, data *analysis.SourceData) ([]analysis.Detection, error) {
    if data.Type != "git" {
        return nil, nil
    }

    // Access commit metadata
    message, _ := data.Metadata["commit_message"].(string)
    if strings.HasPrefix(message, "WIP") {
        return []analysis.Detection{
            {
                Strategy:    "my-org.commit-policy",
                Detected:    true,
                Severity:    "medium",
                Score:       0.95,
                Confidence:  0.9,
                Category:    "commit",
                Description: "Commit is marked WIP and should not be merged",
                Examples:    []string{message},
            },
        }, nil
    }

    return nil, nil
}
```

---

## Registering Plugins

Use `PluginManager.Register()` to add your plugin. It's safe to register from multiple goroutines.

```go
manager := analysis.NewPluginManager()

if err := manager.Register(&CommitPolicyPlugin{}); err != nil {
    log.Fatal("failed to register plugin:", err)
}
```

Registering a plugin with the same `Info().Name` as an existing plugin **replaces** it — use this for dynamic reload scenarios.

To deregister:

```go
removed := manager.Unregister("my-org.commit-policy")
```

---

## Enabling and Disabling Plugins

By default, all registered plugins are enabled. Use `SetEnabled` to selectively activate plugins:

```go
// Enable only specific plugins
manager.SetEnabled(map[string]bool{
    "my-org.commit-policy": true,
    "my-org.other-plugin":  false,
})

// Re-enable all (pass nil)
manager.SetEnabled(nil)

// Check if a plugin is enabled
if manager.IsEnabled("my-org.commit-policy") {
    fmt.Println("active")
}
```

---

## Integrating with the Analysis Pipeline

### As a Detector

Wrap the plugin manager as a `Detector` for use with `DetectionRunner` or `StreamingRunner`:

```go
detector := manager.Detector()

runner := analysis.NewDetectionRunner()
report, err := runner.Run(ctx, mySource, detector)
```

### With the StrategyRegistry

Register plugin metadata into a `StrategyRegistry` so it appears in strategy listings:

```go
registry := analysis.NewStrategyRegistry()
manager.MergeIntoRegistry(registry)
```

### With the Webhook Server

When starting the webhook server programmatically, pass the `PluginManager` to the server config. Registered plugins will:

- Participate in all analysis jobs
- Appear in `GET /api/plugins`

```go
serverConfig := webhook.ServerConfig{
    PluginManager: manager,
    // ... other config
}
```

---

## RunAll Behavior

`PluginManager.RunAll()` executes all enabled plugins concurrently against the source data:

- A **panic** in any plugin is recovered — logged as an error, that plugin is skipped
- A **returned error** from any plugin is collected — other plugins continue running
- If **all** plugins fail and no detections were produced, `RunAll` returns the combined error
- If **some** plugins succeed, `RunAll` returns their detections and logs the failures

```go
detections, err := manager.RunAll(ctx, data)
```

---

## Testing Plugins

Test your plugin in isolation without the full Cadence pipeline:

```go
func TestCommitPolicyPlugin(t *testing.T) {
    p := &CommitPolicyPlugin{}

    data := &analysis.SourceData{
        ID:   "abc123",
        Type: "git",
        Metadata: map[string]interface{}{
            "commit_message": "WIP: initial draft",
        },
    }

    detections, err := p.Detect(context.Background(), data)
    if err != nil {
        t.Fatal(err)
    }
    if len(detections) != 1 {
        t.Errorf("expected 1 detection, got %d", len(detections))
    }
}
```

---

## Plugin Checklist

- [ ] `Info().Name` is unique and uses a namespaced format (`org.plugin-name`)
- [ ] `Detect` returns `nil, nil` for source types outside `Info().SourceTypes`
- [ ] `Detect` returns `nil, nil` (not an error) when nothing is detected
- [ ] `Detect` is safe to call concurrently
- [ ] Plugin is registered before starting the webhook server or running analysis
- [ ] Plugin has unit tests covering both detection and no-detection paths
