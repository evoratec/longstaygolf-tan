---
title: Plugins
description: Extend Cadence's detection pipeline with custom analysis strategies
order: 0
---

# Plugins

The Cadence plugin system lets you extend the detection pipeline with custom analysis strategies. Plugins implement the `StrategyPlugin` interface and integrate seamlessly with all analysis modes CLI, webhook server, and streaming.

## What Plugins Can Do

A plugin is a Go struct that:

- Declares metadata (`Info()`) — name, category, description
- Implements detection logic (`Detect()`) — receives raw `SourceData`, returns `[]Detection`
- Participates in all analysis runs automatically once registered
- Appears in `GET /api/plugins` when the webhook server is running

## Plugin vs Built-in Detector

| | Plugin | Built-in Detector |
|--|--------|-------------------|
| Implemented in | Your Go code | Cadence core |
| Registration | `PluginManager.Register()` | Automatic |
| Listed in `/api/plugins` | Yes | No |
| Survives restarts | Requires re-registration | Always active |
| Contributed to `StrategyRegistry` | Via `MergeIntoRegistry()` | Automatic |

## Guides

- [Writing Plugins](/docs/plugins/writing-plugins) — Implement `StrategyPlugin`, register with `PluginManager`, and write tests
- [Best Practices](/docs/plugins/best-practices) — Naming, concurrency, confidence calibration, performance, and common pitfalls
- [Detection Reference](/docs/plugins/detection-reference) — `Detection` struct fields, severity levels, and category constants
