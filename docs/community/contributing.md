---
title: Contributing Guide
description: How to contribute to Cadence - setup, guidelines, and best practices
category: Community
difficulty: Advanced
time_estimate: 20 min
prerequisites: [build-development]
---

# Contributing to Cadence

Thank you for your interest in contributing to Cadence! We welcome contributions from everyone, whether it's bug reports, feature requests, documentation improvements, or code contributions.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code:

### Our Standards

**Positive Behavior:**
- Using welcoming and inclusive language
- Being respectful of differing opinions and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable Behavior:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information without permission
- Inappropriate sexual language or imagery
- Other conduct that could reasonably be considered unprofessional

### Reporting

Report unacceptable behavior to:
- **Email**: [support@noslop.tech](mailto:support@noslop.tech)
- **GitHub**: Open a private issue or contact maintainers directly

All reports will be reviewed and investigated promptly and fairly.

## Ways to Contribute

### Reporting Bugs

Before reporting a bug:

1. **Search existing issues** to see if it's already reported
2. **Check the troubleshooting guide** at [/docs/troubleshooting-guide](/docs/troubleshooting-guide)
3. **Verify it's not a security issue** (see [Security Policy](/docs/security))

When reporting a bug, include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs **actual behavior**
- **Environment details**: Go version, OS, Cadence version
- **Error messages** or logs (if applicable)
- **Sample repository** or code snippet (if relevant)

**Example:**

```markdown
**Title:** Cadence crashes when analyzing large commits

**Steps to Reproduce:**
1. Clone https://github.com/user/large-repo
2. Run `cadence analyze /path/to/repo`
3. Program crashes with panic

**Expected:** Should analyze the repository successfully
**Actual:** Panic: runtime error: index out of range

**Environment:**
- Cadence: v0.3.0
- Go: 1.24.0
- OS: Ubuntu 22.04
```

### Suggesting Features

We love new ideas! When suggesting a feature:

1. **Check existing issues** to avoid duplicates
2. **Provide a clear use case** - why is this feature valuable?
3. **Include examples** of how it would work
4. **Be open to feedback** and discussion

**Template:**

```markdown
**Feature:** Add support for Bitbucket webhooks

**Use Case:**
Many teams use Bitbucket for code hosting and would benefit from 
continuous AI detection monitoring.

**Proposed Implementation:**
- Add `/webhooks/bitbucket` endpoint
- Support Bitbucket's webhook signature format
- Parse Bitbucket push event payloads

**Benefits:**
- Broader platform support
- Consistent experience across Git hosts
```

### Improving Documentation

Documentation improvements are always welcome:

- Fix typos or unclear wording
- Add examples or clarifications
- Create tutorials or guides
- Translate documentation

Documentation files are in [`cadence-web/docs/`](https://github.com/TryCadence/Cadence/tree/main/cadence-web/docs).

### 🧪 Adding Detection Strategies

Help improve detection accuracy by adding new strategies:

1. Research AI-generation patterns
2. Implement strategy in `internal/detector/patterns/`
3. Add tests with sample data
4. Document the strategy in [`docs/detection-strategies.md`](/docs/detection-strategies)

See [Adding Detection Strategies](#adding-detection-strategies) below.

## Development Setup

### Prerequisites

- **Go 1.24+** installed
- **Git** for version control
- **Make** (optional, for convenience commands)
- Text editor or IDE (VS Code, GoLand recommended)

### Clone the Repository

```bash
git clone https://github.com/TryCadence/Cadence.git
cd Cadence
```

### Install Dependencies

```bash
go mod download
```

### Build the Project

```bash
# Using Make (recommended)
make build

# Or using Go directly
go build ./cmd/cadence
```

Version information is automatically injected when using `make build`.

### Run Tests

```bash
# Run all tests
make test

# Run tests with coverage
go test -cover ./...

# Run specific test
go test -run TestAnalyzer ./internal/analyzer

# Verbose output
go test -v ./...
```

### Code Formatting

```bash
# Format code (required before committing)
make fmt

# Or
go fmt ./...
```

### Linting

```bash
# Run linter
make lint

# Run vet
make vet
```

### Project Structure

```
Cadence/
├── cmd/
│   └── cadence/          # CLI commands
│       ├── main.go       # Entry point
│       ├── analyze.go    # analyze command
│       ├── web.go        # web command
│       ├── webhook.go    # webhook command
│       └── cmd_config.go # config command
├── internal/
│   ├── analyzer/         # Repository analysis logic
│   ├── detector/         # Detection strategies
│   │   └── patterns/     # Pattern implementations
│   ├── git/             # Git operations
│   ├── metrics/         # Statistics & velocity
│   ├── reporter/        # Output formatting
│   ├── webhook/         # Webhook server
│   ├── ai/              # AI integration
│   └── config/          # Configuration
├── test/                # Integration tests
├── docs/                # Documentation (web)
├── .github/             # GitHub workflows
└── scripts/             # Build scripts
```

## Making Changes

### Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### Make Your Changes

Follow these guidelines:

#### Code Style

- **Follow Go conventions** and idioms
- Use `gofmt` for formatting (enforced)
- Write **meaningful variable names**
- Add **comments for exported functions**
- Keep **functions focused** and testable
- Avoid **unnecessary complexity**

**Good Example:**

```go
// AnalyzeCommit evaluates a single commit for AI-generation patterns.
// Returns true if the commit is suspicious, along with a confidence score.
func AnalyzeCommit(commit *git.Commit, thresholds *Thresholds) (bool, float64) {
    if commit == nil {
        return false, 0.0
    }
    
    score := calculateSuspicionScore(commit, thresholds)
    return score >= thresholds.MinConfidence, score
}
```

#### Commit Messages

Write clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "Add Bitbucket webhook support"
git commit -m "Fix panic when analyzing empty commits"
git commit -m "Update detection thresholds for better accuracy"
git commit -m "Docs: add webhook deployment guide"

# Reference issues when applicable
git commit -m "Fix: correct signature verification (fixes #123)"
```

**Commit Message Format:**

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code restructuring without behavior change
- `perf:` Performance improvements
- `chore:` Maintenance tasks

#### Testing

Always add tests for new features:

```go
func TestNewDetectionStrategy(t *testing.T) {
    strategy := NewMyStrategy()
    
    testCases := []struct {
        name     string
        input    string
        expected bool
    }{
        {"should detect pattern", "AI-generated text", true},
        {"should not flag normal text", "human written", false},
    }
    
    for _, tc := range testCases {
        t.Run(tc.name, func(t *testing.T) {
            result := strategy.Detect(tc.input)
            if result != tc.expected {
                t.Errorf("expected %v, got %v", tc.expected, result)
            }
        })
    }
}
```

Run tests before committing:

```bash
make test
```

#### Documentation

Update relevant documentation:

- **README.md** - If adding major features
- **CHANGELOG.md** - Add your changes
- **docs/** - Update user-facing docs
- **Code comments** - Document exported functions

### Push Your Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

## Submitting a Pull Request

### PR Checklist

Before submitting:

- [ ] Code follows style guidelines (`make fmt`, `make lint`)
- [ ] All tests pass (`make test`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages are clear
- [ ] No merge conflicts with `main`

### Open the Pull Request

1. Go to [GitHub](https://github.com/TryCadence/Cadence)
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code formatted (`make fmt`)
- [ ] Linter passing (`make lint`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

### PR Review Process

1. **Automated checks** run (tests, linting)
2. **Maintainers review** your code
3. **Address feedback** if requested
4. **Approval** and merge

We aim to review PRs within 3-5 business days.

## Adding Detection Strategies

### Strategy Interface

All detection strategies implement:

```go
type Strategy interface {
    Name() string
    Detect(content string) (bool, float64, []string)
}
```

### Create a New Strategy

1. **Create file** in `internal/detector/patterns/`:

```go
// internal/detector/patterns/my_strategy.go
package patterns

type MyStrategy struct {
    Threshold float64
}

func NewMyStrategy() *MyStrategy {
    return &MyStrategy{
        Threshold: 0.5,
    }
}

func (s *MyStrategy) Name() string {
    return "my-strategy"
}

func (s *MyStrategy) Detect(content string) (bool, float64, []string) {
    // Implement detection logic
    reasons := []string{}
    confidence := 0.0
    
    if containsPattern(content) {
        reasons = append(reasons, "Contains suspicious pattern")
        confidence = 0.8
    }
    
    return confidence >= s.Threshold, confidence, reasons
}
```

2. **Register strategy** in `registry.go`:

```go
func init() {
    Register(NewMyStrategy())
}
```

3. **Add tests**:

```go
func TestMyStrategy(t *testing.T) {
    strategy := NewMyStrategy()
    
    suspicious, conf, reasons := strategy.Detect("test content")
    
    if !suspicious {
        t.Error("Expected content to be flagged")
    }
}
```

4. **Document** in `docs/detection-strategies.md`

### Strategy Best Practices

- **Start conservative**: High confidence thresholds to minimize false positives
- **Provide clear reasons**: Explain why content was flagged
- **Test extensively**: Include diverse test cases
- **Measure accuracy**: Track false positive/negative rates
- **Be culturally aware**: Avoid biases against non-native speakers

## Release Process

Maintainers handle releases:

1. Update version in `internal/version/version.go`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v0.3.0`
4. Push tag: `git push origin v0.3.0`
5. GitHub Actions builds and publishes release

## Getting Help

- **Discussions**: [GitHub Discussions](https://github.com/TryCadence/Cadence/discussions)
- **Issues**: [GitHub Issues](https://github.com/TryCadence/Cadence/issues)
- **Email**: [hey@noslop.tech](mailto:hey@noslop.tech)
- **Documentation**: [noslop.tech](/)

## Recognition

Contributors are recognized in:
- `CHANGELOG.md` for each release
- GitHub's contributor graph
- Special mentions for significant contributions

Thank you for contributing to Cadence!
