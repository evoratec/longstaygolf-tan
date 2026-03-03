# Development Guide

Complete guide to building Cadence from source, development setup, and using Make for common tasks.

> For **end-user installation only?** See [Installation Guide](/docs/getting-started/installation) instead.

## Prerequisites

### Required

- **Go 1.24 or later** - [Download Go](https://golang.org/dl)
- **Git 2.20 or later** - Usually pre-installed

Verify installation:

```bash
go version
git --version
```

### Optional

- **golangci-lint** - For linting
- **make** - For convenient build targets (cross-platform)

## Building from Source

### Method 1: Using Make (Recommended)

Make automatically handles cross-platform build with version injection:

```bash
git clone https://github.com/TryCadence/Cadence.git
cd Cadence
make build
```

**Automatically detects your OS** and:
- Injects version from Git tags
- Injects commit hash
- Injects build timestamp

**Output:**
- Linux/macOS: `bin/cadence`
- Windows: `bin/cadence.exe`

### Method 2: Using Platform Scripts

**Linux/macOS:**
```bash
git clone https://github.com/TryCadence/Cadence.git
cd Cadence
./scripts/build.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/TryCadence/Cadence.git
cd Cadence
.\scripts\build.ps1
```

### Method 3: Direct Go (No Version Injection)

```bash
git clone https://github.com/TryCadence/Cadence.git
cd Cadence
go build -o cadence ./cmd/cadence
```

Note: This builds without version information.

## Verify Build

Test that Cadence built correctly:

```bash
# Linux/macOS
./bin/cadence version

# Windows
.\cadence.exe version
```

Should display version, commit, and build time.

## Make Convenience Targets

Cadence provides Make targets for common development tasks.

### View All Targets

```bash
make help
```

### Available Targets

#### build

Build binary with version injection:

```bash
make build
```

Creates `bin/cadence` (Linux/macOS) or `bin/cadence.exe` (Windows).

**Features:**
- Cross-platform support
- Automatic version detection from Git tags
- Commit hash injection
- Build timestamp injection

#### install

Install to system `$GOPATH/bin`:

```bash
make install
```

After installation, run `cadence` from anywhere:

```bash
cadence --help
```

#### test

Run all tests:

```bash
make test
```

Runs:
```
go test ./...
```

#### fmt

Format all code:

```bash
make fmt
```

Runs:
```
go fmt ./...
```

#### tidy

Tidy dependencies:

```bash
make tidy
```

Cleans up `go.mod` and `go.sum`.

#### lint

Run linter:

```bash
make lint
```

Uses **golangci-lint** if installed, otherwise prints message.

#### vet

Run go vet:

```bash
make vet
```

Checks for common mistakes.

#### run

Run Cadence directly:

```bash
make run
```

Runs without building binary (useful for testing).

#### clean

Remove build artifacts:

```bash
make clean
```

Removes `bin/` directory.

## Development Workflow

### 1. Clone Repository

```bash
git clone https://github.com/TryCadence/Cadence.git
cd Cadence
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature
```

### 3. Make Changes

Edit code in `cmd/`, `internal/` directories.

### 4. Run Tests

```bash
make test
```

### 5. Format Code

```bash
make fmt
make vet
```

### 6. Lint Code

```bash
make lint
```

### 7. Build

```bash
make build
```

### 8. Test Binary

```bash
./bin/cadence --help
./bin/cadence version
```

### 9. Commit and Push

```bash
git add .
git commit -m "Feature: description"
git push origin feature/your-feature
```

## Build Details

### Version Injection

The Makefile automatically injects version information at build time:

**On Linux/macOS:**
```makefile
VERSION := $(shell git describe --tags --always --dirty)
COMMIT := $(shell git rev-parse --short HEAD)
BUILD_TIME := $(shell date -u '+%Y-%m-%dT%H:%M:%SZ')
LDFLAGS := -ldflags="-X github.com/TryCadence/Cadence/internal/version.Version=$(VERSION) ..."
```

**On Windows:**
```powershell
$VERSION = & git describe --tags --always --dirty
$COMMIT = & git rev-parse --short HEAD
$BUILD_TIME = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$LDFLAGS = "-ldflags=`"-X ... `""
```

### Version Information

Cadence embeds version info in `internal/version/version.go`:

```go
var (
	Version   = "development"
	GitCommit = "unknown"
	BuildTime = "unknown"
)

func Full() string {
	return fmt.Sprintf("Cadence version %s\nGit Commit: %s\nBuild Time: %s", 
		Version, GitCommit, BuildTime)
}
```

View with:
```bash
cadence version
```

## Project Structure

```
Cadence/
├── cmd/cadence/              # CLI commands
│   ├── analyze.go            # Repository analysis
│   ├── web.go                # Website analysis
│   ├── webhook.go            # Webhook server
│   ├── config.go             # Configuration
│   └── main.go               # Entry point
│
├── internal/                 # Core functionality
│   ├── ai/                   # OpenAI integration
│   ├── analyzer/             # Repository analysis
│   ├── detector/             # Detection strategies
│   ├── git/                  # Git operations
│   ├── metrics/              # Metrics calculation
│   ├── reporter/             # Report generation
│   ├── web/                  # Web analysis
│   └── webhook/              # Webhook server
│
├── scripts/                  # Build scripts
│   ├── build.sh              # Linux/macOS build
│   └── build.ps1             # Windows build
│
├── Makefile                  # Build targets
├── go.mod                    # Go modules
└── go.sum                    # Module checksums
```

## Dependencies

Key dependencies (from `go.mod`):

- **cobra** - CLI framework
- **viper** - Configuration management
- **go-git** - Git operations
- **goquery** - HTML parsing
- **openai** - OpenAI API client
- **fiber** - Web framework (webhooks)

View all with:
```bash
go mod graph
```

## Testing

### Run All Tests

```bash
make test
```

Or directly:
```bash
go test ./...
```

### Run Specific Test

```bash
go test ./internal/detector -v
```

### Test Coverage

```bash
go test ./... -cover
```

### With Coverage Report

```bash
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

## Code Quality

### Format Code

```bash
make fmt
```

### Vet Code

```bash
make vet
```

### Lint Code

```bash
make lint
```

(Requires golangci-lint)

## Troubleshooting Build

### "go: command not found"

Install Go from [golang.org/dl](https://golang.org/dl).

### Build fails with version injection

Ensure Git is installed and repository has commits:

```bash
git log --oneline
```

### Module errors

Clean module cache:

```bash
go clean -modcache
go mod tidy
```

### Tests fail

Try:
```bash
go mod download
go test ./...
```

## Contributing

For contributing to Cadence:

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** - follow existing code style
4. **Run tests**: `make test`
5. **Format code**: `make fmt`
6. **Lint code**: `make lint`
7. **Commit**: `git commit -m "Feature: description"`
8. **Push**: `git push origin feature/your-feature`
9. **Open PR** on GitHub

## Next Steps

- [Advanced Configuration](/docs/reference/advanced-configuration) - Config options
- [Troubleshooting](/docs/reference/troubleshooting) - Common issues
- [GitHub Repository](https://github.com/TryCadence/Cadence) - Source code
