---
title: Architecture
description: System architecture and design overview
---

# Architecture

Understanding Cadence's architecture, components, and data flows.

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Git Platforms                          │
│            (GitHub, GitLab, Gitea, etc.)                   │
└────────────────┬────────────────────────────────────────────┘
                 │ Webhook Events
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Cadence Webhook Server                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Webhook Handler (sig verification, job dispatch)    │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │      Job Queue (configurable workers)               │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │    Detection Analyzer                               │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ Git Detector (18 strategies)                  │ │  │
│  │  │ Web Detector (20 strategies)                  │ │  │
│  │  │ AI Analyzer (OpenAI/Anthropic)               │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                     │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │ Support Subsystems                                  │  │
│  │  ├─ Cache (in-memory, TTL-based)                   │  │
│  │  ├─ Metrics (Prometheus format)                    │  │
│  │  ├─ Plugin Manager                                 │  │
│  │  └─ Structured Logging                             │  │
│  └────────────────────┬─────────────────────────────────┘  │
└─────────────────────────────┬─────────────────────────────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
        ┌────────────┐  ┌──────────┐  ┌──────────┐
        │  Reports   │  │   Cache  │  │  Metrics │
        │  (JSON)    │  │  Storage │  │ Endpoint │
        └────────────┘  └──────────┘  └──────────┘
```

## Core Components

### 1. Webhook Server (Fiber Framework)

**Responsibilities:**
- Receive Git platform webhooks
- Verify webhook signatures (HMAC-SHA256)
- Extract event metadata
- Queue analysis jobs

**Key Handler:**
```go
type WebhookHandlers struct {
  queue    *JobQueue
  cache    AnalysisCache
  metrics  AnalysisMetrics
  plugins  *PluginManager
}
```

### 2. Job Queue

**Features:**
- Configurable worker pool (default: 4 workers)
- FIFO job processing
- Job status tracking
- Timeout handling (default: 5 minutes/job)

**Architecture:**
```
Queue Input → [Job1, Job2, Job3, ...] → Worker Pool
                                       ├ Worker 1: Processing Job1
                                       ├ Worker 2: Processing Job2
                                       ├ Worker 3: Idle
                                       └ Worker 4: Idle
```

### 3. Detection Analyzers

#### Git Detector (18 Strategies)

**Strategy Categories:**

**Velocity-Based (4 strategies):**
- Velocity Analysis - additions/deletions per minute
- Timing Analysis - commits within X seconds
- Timing Anomaly - statistical deviation from baseline
- Burst Pattern - multiple rapid commits

**Size-Based (2 strategies):**
- Size Analysis - total additions/deletions per commit
- File Dispersion - number of files changed

**Pattern-Based (7 strategies):**
- Commit Message Analysis - AI-typical phrasing patterns
- Naming Pattern Analysis - generic variable/function names
- Emoji Pattern - excessive emoji usage
- Special Character - unusual punctuation patterns
- Template Pattern - boilerplate code structures
- File Extension Pattern - suspicious file types
- Structural Consistency - identical code structure

**Ratio-Based (2 strategies):**
- Ratio Analysis - addition/deletion proportions
- Error Handling Pattern - missing error checks

**Statistical (2 strategies):**
- Statistical Anomaly - deviation from repo baseline
- Precision Strategy - holistic pattern analysis

**Merge Analysis (1 strategy):**
- Merge Commit Detection

#### Web Detector (20 Strategies)

**Category Breakdown:**

**Linguistic (7 strategies):**
- Generic Language - overuse of business terms
- Overused Phrases - AI vocabulary patterns
- Perfect Grammar - suspiciously uniform grammar
- Missing Nuance - lack of specific details
- Excessive Transitions - too many "furthermore," "however"
- AI Vocabulary - common AI words/patterns
- Uniform Sentence Length - statistical uniformity

**Structural (3 strategies):**
- Excessive Structure - overly formatted content
- Heading Hierarchy - improper heading usage
- Semantic HTML - missing semantic elements

**Pattern-Based (5 strategies):**
- Boilerplate Text - reused text sections
- Repetitive Patterns - identical phrase structures
- Generic Styling - lack of custom CSS/theming
- Special Characters - unusual symbol patterns
- Hardcoded Values - magic numbers/strings
- Emoji Overuse - excessive emoji usage

**Accessibility (3 strategies):**
- Missing Alt Text - images without descriptions
- Link Text Quality - generic link text ("click here")
- Form Issues - missing form labels/validation
- Accessibility Markers - missing ARIA attributes

**Customization:**
- Custom Pattern Strategy - user-defined keywords

### 4. AI Analyzer

**Providers:**
- **OpenAI:** gpt-4o-mini (default), gpt-4, gpt-4-turbo
- **Anthropic:** claude-sonnet-4-20250514 (default), claude-haiku

**Built-in Skills:**
- `code_analysis` - Code review and generation patterns
- `commit_review` - Commit message analysis
- `pattern_explain` - Explanation of flagged patterns
- `report_summary` - Report generation

**Flow:**
```
Raw Analysis Results
        ↓
Build Prompt (system + user)
        ↓
Call AI Provider
        ↓
Parse Response
        ↓
Weighted Confidence Score
        ↓
Final Result
```

## Data Flows

### Webhook Processing Flow

```
1. GitHub Push Event
   ↓
2. Webhook Received (/webhooks/github)
   ├─ Extract headers
   ├─ Verify HMAC signature
   ├─ Parse JSON payload
   └─ Return 202 Accepted
   ↓
3. Extract Job Info
   ├─ Repository URL
   ├─ Branch
   ├─ Commit list
   └─ Pusher info
   ↓
4. Queue Job
   ├─ Create job UUID
   ├─ Set status: "pending"
   ├─ Cache job metadata
   └─ Add to job queue
   ↓
5. Return Job ID
   ```json
   {
     "job_id": "550e8400-...",
     "status": "pending"
   }
   ```
```

### Analysis Pipeline

```
Repository Source
        ↓
Fetch Commits (git log)
        ↓
Build CommitPair Objects
        ├─ Current commit
        ├─ Parent commit
        ├─ Stats (additions, deletions, files)
        ├─ Message
        ├─ Author
        └─ Timestamp
        ↓
Initialize Strategies
        ├─ Load configured thresholds
        ├─ Create strategy instances
        └─ Filter disabled strategies
        ↓
Detect per CommitPair
        ├─ Run all strategies
        ├─ Collect detection results
        ├─ Calculate composite score
        └─ Determine severity
        ↓
AI Analysis (if enabled)
        ├─ Build prompt with findings
        ├─ Call AI provider
        ├─ Parse AI assessment
        └─ Blend scores
        ↓
Aggregate Results
        ├─ Summary statistics
        ├─ Suspicious commits list
        ├─ Confidence scores
        └─ Category distribution
        ↓
Generate Report
        ├─ Format (JSON/YAML/HTML/BSON/Text)
        ├─ Apply filters
        └─ Store in cache
        ↓
Return Results
```

## Data Structures

### Analysis Report

```go
type AnalysisReport struct {
  ID              string
  SourceType      string      // "git" or "web"
  TotalItems      int         // commits or pages
  SuspiciousCount int
  Suspicions      []Detection
  Timing          TimeMetrics
  OverallScore    float64     // 0.0-1.0
  Assessment      string      // "clean", "suspicious", "critical"
  Metadata        map[string]interface{}
}

type Detection struct {
  Strategy    string
  Detected    bool
  Severity    string          // "low", "medium", "high"
  Score       float64         // 0.0-1.0
  Confidence  float64         // 0.0-1.0
  Category    string
  Description string
  Examples    []string
}
```

### Cache Layer

**In-Memory Cache:**
- TTL-based expiration (default: 1 hour)
- LRU eviction (max 256 entries by default)
- Thread-safe access

**Usage:**
```go
cache := analysis.NewInMemoryCache(
  analysis.WithMaxSize(256),
  analysis.WithTTL(1 * time.Hour),
)
```

## Extension Points

### Custom Strategies

Implement the Detection Strategy interface:

```go
type DetectionStrategy interface {
  Name() string
  Category() string
  Confidence() float64
  Description() string
  Detect(pair *commit.Pair, stats *metrics.Stats) (bool, string)
}
```

### Plugins

Plugin manager for extensions:

```go
type PluginManager struct {
  // Load custom detectors
  // Register middleware
  // Extend capabilities
}
```

### Custom Reporters

Implement report formatting:

```go
type Reporter interface {
  Report(ctx context.Context, analysis *AnalysisReport) ([]byte, error)
}
```

## Performance Characteristics

### Scalability

- **Single Worker:** ~10-20 repos/minute
- **4 Workers:** ~40-80 repos/minute
- **8 Workers:** ~80-160 repos/minute

### Memory Usage

- **Idle:** ~50MB
- **Processing 10 commits:** ~150-200MB
- **Large repo (1000 commits):** ~800MB-1GB

### Cache Performance

- **Hit rate:** 60-80% typical
- **Memory overhead:** ~10-15% of total

## Next Steps

- [Deployment Guide](/docs/operations/docker) - Deploy architecture
- [Monitoring](/docs/operations/monitoring) - Observe in production
- [Advanced Configuration](/docs/reference/advanced-configuration) - Tune behavior
