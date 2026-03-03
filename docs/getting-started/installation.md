# Installation

Get Cadence installed and ready to use on your system.

## Prerequisites

- **Go 1.24 or later** - [Download Go](https://golang.org/dl)
- **Git** - Required for repository analysis (pre-installed on most systems)

Verify your Go version:

```bash
go version
```

## Installation Methods

### Method 1: Build from Source (Recommended)

Building from source gives you the latest version with automatic version info injection.

#### Step 1: Clone the Repository

```bash
git clone https://github.com/TryCadence/Cadence.git
cd Cadence
```

#### Step 2: Build the Binary

**Using Make (macOS/Linux):**

```bash
make build
# Binary created at: ./bin/cadence
```

**Using PowerShell (Windows):**

```powershell
.\scripts\build.ps1
# Binary created at: .\cadence.exe
```

**Using Go directly (all platforms):**

```bash
go build -o cadence ./cmd/cadence
```

#### Step 3: Verify Installation

```bash
./bin/cadence version
```

You should see output like:
```
Cadence v0.3.0 (abc123de) built at 2026-03-03T10:30:00Z
```

### Method 2: Go Install

Install directly from GitHub:

```bash
go install github.com/TryCadence/Cadence/cmd/cadence@latest
```

Then verify:

```bash
cadence version
```

### Method 3: Download Pre-built Binary

Pre-built binaries are available for:

| Platform | Architecture | Binary name |
|----------|-------------|-------------|
| macOS | Apple Silicon (M1/M2/M3) | `cadence-darwin-arm64` |
| macOS | Intel | `cadence-darwin-amd64` |
| Linux | x86-64 | `cadence-linux-amd64` |

Check [GitHub Releases](https://github.com/TryCadence/Cadence/releases) for downloads. Then make it executable:

```bash
chmod +x ./cadence-darwin-arm64
./cadence-darwin-arm64 version
```

## Add to PATH (Optional)

Make `cadence` available from anywhere.

### macOS/Linux

```bash
# Copy to system path
sudo cp ./cadence /usr/local/bin/

# Or create a symlink
sudo ln -s $(pwd)/cadence /usr/local/bin/

# Verify
cadence --help
```

### Windows (PowerShell as Admin)

```powershell
# Add to PATH
$env:PATH += ";$(Get-Location)"

# Make permanent
[Environment]::SetEnvironmentVariable(
    "PATH", 
    $env:PATH, 
    "User"
)

# Verify
cadence --help
```

## Build Details

The Makefile and build scripts automatically inject version information from Git tags:

```bash
make build
# Automatically captures:
# - Version from latest git tag (or "0.1.0" if no tags)
# - Short commit hash
# - Build timestamp in UTC
```

Available Make targets:

```bash
make build    # Build binary with version injection (output: ./bin/cadence)
make install  # Install to $GOPATH/bin
make test     # Run all tests
make fmt      # Format code
make tidy     # Tidy dependencies (go mod tidy)
make lint     # Run linter (golangci-lint)
make vet      # Run go vet
make clean    # Remove build artifacts
make help     # Show all targets
```

## Troubleshooting

### "Go version too old"

If you get an error about Go version, upgrade to 1.24+:

```bash
go version
# If less than 1.24, download from https://golang.org/dl
```

### "command not found: cadence"

The binary is not in your PATH. Either:

1. **Use full path:**
   ```bash
   /path/to/cadence --help
   ./cadence --help
   ```

2. **Add to PATH** - Follow the "Add to PATH" section above

### Build fails with "module not found"

Ensure you're in the Cadence directory and have internet connection:

```bash
cd Cadence
go mod tidy
go build -o cadence ./cmd/cadence
```

### Configuration file not auto-detected

`cadence config init` creates `.cadence.yaml`. However, the `analyze` and `web` commands auto-detect `cadence.yml` (without the leading dot). To use your generated config, always pass it explicitly:

```bash
cadence analyze /repo --config .cadence.yaml -o report.json
```

### Permission denied (macOS/Linux)

Make the binary executable:

```bash
chmod +x ./cadence
./cadence --help
```

## Next Steps

Once installed:

1. **Quick Start** - [5-minute guide](/docs/getting-started/quick-start) to your first analysis
2. **Configuration** - [Set up thresholds](/docs/getting-started/configuration) for your needs
3. **Commands** - [Full CLI reference](/docs/cli/commands) for all options

## Development Setup

If you're contributing to Cadence:

```bash
git clone https://github.com/TryCadence/Cadence.git
cd Cadence

# Install dependencies
go mod download

# Run tests
go test ./...

# Format code
go fmt ./...

# Build
make build

# Run linter
make lint
```

See the [Build & Development guide](/docs/build-development) for more details.
