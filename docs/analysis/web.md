# Web Content Analysis

Cadence can analyze website content to detect AI-generated text and low-quality content ("slop"). This works by fetching web pages and analyzing the text using 20 detection strategies for patterns commonly found in AI-generated writing.

## How It Works

When you run web analysis, Cadence:

1. **Fetches the page** - Downloads the HTML content using an HTTP client with appropriate headers
2. **Extracts text** - Parses HTML and extracts meaningful content (body text, headings, metadata)
3. **Filters noise** - Removes navigation, boilerplate, code blocks, and other non-content elements
4. **Analyzes patterns** - Examines the extracted text for AI-generation indicators

## Detection Patterns

Cadence looks for several patterns commonly found in AI-generated content:

### Generic Language Detection
Identifies overused, generic phrases and terminology. AI models often use common phrases from their training data:
- "It is important to note"
- "In today's world"
- "Cutting-edge solution"
- Generic descriptors without specificity

### Perfect Grammar Detection
Detects suspiciously uniform grammar and sentence structure. While human writing has natural variation in grammar and phrasing, AI can produce text that's *too* grammatically correct, with overly formal or uniform construction.

### Placeholder Pattern Detection
Finds common placeholder and filler patterns:
- "[noun] that [verb]" constructions
- Repetitive paragraph structures
- Section headers followed by boilerplate descriptions
- Identical phrase structures across sections

### Boilerplate Content Detection
Identifies reused or templated text:
- Sections that appear identical across multiple pages
- Standard disclaimers and license text appearing in content areas
- Repeated introductory paragraphs
- Stock descriptions used across products

### Content Uniformity Detection
Analyzes whether page content is too uniform or structured. Real websites have natural variation - blog posts differ from product pages, different sections have different tones. Suspiciously uniform content across varied sections can indicate AI generation.

### Specificity Analysis
Evaluates whether content lacks specific details. AI-generated content often:
- Avoids concrete numbers or metrics
- Uses vague descriptions ("improve", "enhance", "better")
- Lacks examples or case studies
- Missing author attribution or expertise indicators

### Structural Pattern Detection
Examines the organization and formatting. Suspicious patterns include:
- Every section following identical structure
- Headers and subheaders in identical patterns
- Bullet points with uniform length and phrasing
- Excessive formatting or visual emphasis

## Usage

### Analyze a Single URL

```bash
cadence web https://example.com
```

### Save to JSON Report

```bash
cadence web https://example.com -o report.json
```

### Verbose Output

```bash
cadence web https://example.com --verbose
```

Shows detailed analysis results including word count, heading analysis, and pattern detection.

## Output

Web analysis produces results in any of Cadence's five output formats (JSON, text, BSON, YAML, HTML):

```bash
cadence web https://example.com -o report.json    # JSON
cadence web https://example.com -o report.txt     # Text
cadence web https://example.com -o report.yaml    # YAML
cadence web https://example.com -o report.html    # HTML
cadence web https://example.com -o report.bson    # BSON
```

Results include:

- **Content Score** - Overall assessment of content quality
- **Pattern Matches** - Which detection patterns were triggered
- **Confidence Scores** - How confident the detection is for each pattern
- **Detailed Breakdown** - Statistics on word count, formatting, phrase frequency

## Interpreting Results

- **High suspicion scores** indicate content likely generated or heavily processed by AI
- **Multiple pattern matches** are more significant than a single match
- **Context matters** - some legitimate writing may match one or two patterns
- **False positives are possible** - be conservative interpreting results

## Limitations

Web analysis is effective but has known limitations:

- **Updated AI models** may produce text that evades detection patterns
- **Edge cases** - some legitimate writing matches multiple patterns
- **Context-dependent** - technical documentation may match specificity patterns
- **Language limitations** - optimized for English content

For better results, combine web analysis with other evaluation methods like reading the actual content, checking author credentials, and comparing against the site's history.
