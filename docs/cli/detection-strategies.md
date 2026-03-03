# Detection Strategies

Cadence uses 38 comprehensive detection strategies that work together to identify AI-generated content. Each strategy analyzes different aspects and contributes to the final suspicion score.

## Git Repository Detection Strategies

Cadence applies 18 strategies to Git commit analysis. Each examines specific patterns in commit metadata, code changes, and repository history.

### 1. Velocity Analysis

Measures how fast code is being added or deleted (additions/deletions per minute).

**How it works:**
- Calculates total additions and deletions in a commit
- Divides by the time taken to make the commit
- Compares against configured threshold

**Suspicious indicators:**
- 100+ additions per minute suggests automated or generated code
- Consistent high velocity across multiple commits
- Extreme values (1000+ per minute) indicate batch operations

**Example:**
- Commit: 5000 additions in 10 minutes = 500 adds/min (very suspicious)
- Human baseline: 20-50 adds/min is typical

### 2. Size Analysis

Flags commits that modify too many lines of code in a single commit.

**How it works:**
- Counts total additions and deletions per commit
- Compares against `suspicious_additions` and `suspicious_deletions` thresholds
- Flags if either exceeds configured limit

**Suspicious indicators:**
- Single commits with 500+ line additions
- 1000+ line deletions suggests bulk deletion
- Commits affecting many unrelated files

**Example:**
- Commit: 5000 additions (default threshold: 500) = suspicious
- Typical human commit: 50-200 lines

### 3. Timing Analysis

Detects unusual timing patterns between commits.

**How it works:**
- Measures seconds between consecutive commits
- Compares against `min_time_delta_seconds` threshold
- Flags rapid-fire commits suggesting automation

**Suspicious indicators:**
- Multiple commits within seconds of each other
- Perfectly regular intervals (e.g., every 60 seconds)
- Commits at unusual hours (2-6 AM consistently)

**Example:**
- Commits at 00:00, 00:01, 00:02 = suspicious pattern
- Typical human: varied intervals of minutes to hours

### 4. File Dispersion Analysis

Examines how many files are modified per commit.

**How it works:**
- Counts unique files modified in each commit
- Compares against `max_files_per_commit` threshold
- Flags commits affecting too many files

**Suspicious indicators:**
- Single commit touching 50+ files
- Changes across unrelated modules in one commit
- Systematic changes to entire codebase at once

**Example:**
- Commit touches: src/module1/, src/module2/, config/, tests/, docs/ = 30+ files (suspicious)
- Typical human: focused on 1-3 related files

### 5. Ratio Analysis

Analyzes the balance between additions and deletions.

**How it works:**
- Calculates additions vs deletions ratio
- Compares against `max_addition_ratio` threshold
- Flags imbalanced commits

**Suspicious indicators:**
- Heavily weighted toward additions (95%+ additions)
- No corresponding cleanup or deletion
- Suggests copy-paste or generated code without refactoring

**Example:**
- Commit: 1000 additions, 10 deletions = 99% additions (suspicious)
- Typical human: more balanced ratio of 60-70% additions

### 6. Commit Message Analysis

Detects vague, generic, or auto-generated commit messages.

**How it works:**
- Examines commit message text
- Flags generic phrases and single-word messages
- Detects boilerplate or template messages

**Suspicious indicators:**
- Single word messages: "fix", "update", "refactor"
- Generic phrases: "made changes", "code review", "improvements"
- Missing or whitespace-only messages
- Suspiciously generic English

**Example:**
- Message: "update" = generic (suspicious)
- Message: "Fix null pointer exception in UserService.handleAuth()" = specific (normal)

### 7. Naming Pattern Analysis

Examines variable and function naming conventions.

**How it works:**
- Analyzes identifiers in changed code
- Detects overly generic or uniform naming
- Flags inconsistent conventions

**Suspicious indicators:**
- Generic names: var1, temp, data, obj, item
- Inconsistent naming across files
- Missing semantic meaning
- Uniform patterns suggesting template generation

**Example:**
- Variables: `temp`, `x`, `i`, `d` = generic (suspicious)
- Variables: `userName`, `userEmail`, `userAge` = semantic (normal)

### 8. Structural Consistency Analysis

Detects overly uniform code structure.

**How it works:**
- Examines code organization and structure
- Flags repetitive patterns across files
- Detects template-like generation

**Suspicious indicators:**
- Every file follows identical structure
- Repetitive class/function patterns
- Uniform indentation and formatting across unrelated modules
- Suggests automated generation

**Example:**
- Every class has identical method ordering = suspicious
- Natural variation in code organization = normal

### 9. Error Handling Analysis

Evaluates presence and quality of error handling.

**How it works:**
- Detects missing try-catch blocks
- Identifies generic error handling
- Flags commits with no error checking

**Suspicious indicators:**
- Code lacking error handling entirely
- Generic error handlers catching all exceptions
- Missing validation for external inputs
- Suggests incomplete or AI-generated code

**Example:**
- Code with no error checking on API calls = suspicious
- Proper error handling with specific exceptions = normal

### 10. File Extension Pattern Analysis

Examines what types of files are being modified.

**How it works:**
- Tracks file extensions in commits
- Detects unusual patterns
- Flags test/temporary files in commits

**Suspicious indicators:**
- Commits touching only test files
- Modification of temporary or cache files
- Unusual file type combinations
- Suggests incomplete development

**Example:**
- Commit modifying only `.tmp`, `.log`, `__pycache__/` = suspicious
- Commit modifying `.py` source files = normal

### 11. Statistical Anomaly Detection

Identifies deviations from repository baseline patterns.

**How it works:**
- Calculates baseline metrics for the repository
- Detects commits that deviate significantly
- Flags statistical outliers

**Suspicious indicators:**
- Commit drastically different from repository average
- Sudden changes in velocity or file modification
- Outlier values in statistical analysis

**Example:**
- Repository average: 100 additions per commit
- Anomalous commit: 5000 additions = 50x deviation (suspicious)

### 12. Burst Pattern Analysis

Identifies clusters of rapid commits.

**How it works:**
- Detects multiple commits in quick succession
- Measures commit clustering
- Flags burst patterns

**Suspicious indicators:**
- 10+ commits in 1 minute
- Regular burst patterns (every X minutes)
- Synchronized bursts across multiple developers

**Example:**
- 20 commits in 30 seconds = burst pattern (suspicious)
- Commits spread throughout day = normal distribution

### 13. Timing Anomaly Detection

Detects commits at unusual times or frequencies.

**How it works:**
- Analyzes commit timestamps
- Detects non-human patterns
- Flags timezone inconsistencies

**Suspicious indicators:**
- Commits consistently at 3-5 AM
- Commits with no hours/days off
- Timezone inconsistencies between commits
- Suggests automated or scheduled jobs

**Example:**
- Commits: 2:00 AM, 2:30 AM, 3:00 AM every night = suspicious
- Commits during business hours with weekends off = normal

### 14. Merge Commit Detection

Analyzes merge commit patterns for unusual behavior.

**How it works:**
- Identifies merge commits in the commit history
- Analyzes merge patterns and frequency
- Detects unusual merge strategies

**Suspicious indicators:**
- Excessive or frequent merge commits
- Unusual merge patterns indicating automated branching
- Merge commits with no legitimate branch merges

### 15. Precision Analysis

Examines code pattern consistency and precision.

**How it works:**
- Analyzes consistency of code structure across commits
- Detects overly precise or mechanical patterns
- Compares against human-like variability

**Suspicious indicators:**
- Perfectly consistent code formatting across all commits
- Identical patterns repeated without variation
- No human-like inconsistencies or style variations

### 16. Template Pattern Detection

Identifies template-like or boilerplate code patterns.

**How it works:**
- Recognizes common template patterns in code
- Detects repetitive code blocks
- Flags systematic template application

**Suspicious indicators:**
- Extensive use of code templates
- Identical code blocks across files
- Systematic template application without customization

### 17. Emoji Usage Detection

Detects excessive or unusual emoji patterns in commit messages.

**How it works:**
- Analyzes emoji frequency in commits
- Detects emoji-only commits
- Calculates emoji-to-text ratios

**Suspicious indicators:**
- 3+ emojis per commit message
- Emoji-only commits
- Emoji ratio >20% of commit message

### 18. Special Character Detection

Identifies overused or unusual special character patterns.

**How it works:**
- Counts special characters (hyphens, asterisks, underscores)
- Detects consecutive patterns
- Analyzes special character density

**Suspicious indicators:**
- 5+ hyphens, 4+ asterisks, or 4+ underscores
- Consecutive special character patterns
- Unusual decorative character usage

## Web Content Detection Strategies

Cadence analyzes website content with 20 distinct strategies for patterns commonly found in AI-generated text.

### 1. Overused Phrases Detection

Identifies common AI-generated filler phrases and clichés.

**Registry name:** `overused_phrases` · **Confidence:** 0.8 · **Category:** Linguistic

**Suspicious patterns:**
- "In today's world" or "In the modern era"
- "It is important to note that"
- "Cutting-edge solutions" or "innovative approach"
- "Furthermore" and excessive connectors

**Why it matters:**
AI models are trained on common phrases and reuse them frequently. Human writing is more varied.

### 2. Generic Language Detection

Identifies overused, generic business and marketing language.

**Registry name:** `generic_language` · **Confidence:** 0.7 · **Category:** Linguistic

**Suspicious patterns:**
- "Maximize efficiency" or "optimize productivity"
- "Leverage synergies" and corporate buzzwords
- Vague superlatives without evidence

### 3. Excessive Structure Detection

Detects over-structured content with too many lists, headings, and rigid formatting.

**Registry name:** `excessive_structure` · **Confidence:** 0.6 · **Category:** Structural

**Suspicious patterns:**
- Every section has identical sub-structure
- Excessive use of bullet lists and numbered lists
- Every paragraph preceded by a heading
- Overly symmetrical layout

### 4. Perfect Grammar Detection

Identifies suspiciously uniform and flawless sentence construction.

**Registry name:** `perfect_grammar` · **Confidence:** 0.5 · **Category:** Linguistic

**Suspicious patterns:**
- Every sentence perfectly grammatical with no natural variation
- Uniform sentence structure across entire page
- No contractions or colloquialisms
- Excessively formal throughout

### 5. Boilerplate Text Detection

Identifies reused, templated, or cookie-cutter text patterns.

**Registry name:** `boilerplate_text` · **Confidence:** 0.7 · **Category:** Pattern

**Suspicious patterns:**
- Standard disclaimers appearing verbatim across pages
- Identical "About Us" or "Our Mission" sections
- Stock phrases reused in multiple contexts
- Template-like intro paragraphs

### 6. Repetitive Patterns Detection

Detects repeated sentence structures and formatting patterns.

**Registry name:** `repetitive_patterns` · **Confidence:** 0.7 · **Category:** Pattern

**Suspicious patterns:**
- Identical sentence openings across paragraphs
- Same paragraph structure repeated throughout
- Every section following the same formula

### 7. Missing Nuance Detection

Detects excessive absolute terms and lack of qualifying language.

**Registry name:** `missing_nuance` · **Confidence:** 0.6 · **Category:** Linguistic

**Suspicious patterns:**
- Overuse of "always", "never", "every"
- No hedging or qualifying statements
- Lack of "sometimes", "often", "may"
- Absolutist claims without evidence

### 8. Excessive Transitions Detection

Identifies overuse of transition words and connectors.

**Registry name:** `excessive_transitions` · **Confidence:** 0.7 · **Category:** Linguistic

**Suspicious patterns:**
- Every paragraph starts with "Furthermore", "Moreover", "Additionally"
- Excessive use of "However", "Nevertheless", "Consequently"
- Transition-to-sentence ratio is unnaturally high

### 9. Uniform Sentence Length Detection

Detects unnaturally uniform sentence lengths across content.

**Registry name:** `uniform_sentence_length` · **Confidence:** 0.6 · **Category:** Statistical

**Suspicious patterns:**
- Low standard deviation in sentence word counts
- Most sentences within a narrow length range
- Lack of natural short/long sentence variation

### 10. AI Vocabulary Detection

Identifies AI-characteristic vocabulary and word choices.

**Registry name:** `ai_vocabulary` · **Confidence:** 0.8 · **Category:** Linguistic

**Suspicious patterns:**
- "Delve", "tapestry", "landscape" (of something)
- "Multifaceted", "myriad", "nuanced" overuse
- Formal academic vocabulary in casual contexts
- Words rarely used in natural writing but common in AI output

### 11. Emoji Overuse Detection

Detects excessive or misplaced emoji usage in content.

**Registry name:** `emoji_overuse` · **Confidence:** 0.4 · **Category:** Pattern

**Suspicious patterns:**
- High emoji density in professional content
- Emoji in unexpected contexts
- Random or decorative emoji placement

### 12. Special Character Detection

Identifies unusual special character patterns.

**Registry name:** `special_characters` · **Confidence:** 0.4 · **Category:** Pattern

**Suspicious patterns:**
- Excessive dashes, asterisks, or underscores
- Decorative separators
- Unusual punctuation patterns

### 13. Missing Alt Text Detection

Flags images without accessibility descriptions.

**Registry name:** `missing_alt_text` · **Confidence:** 0.3 · **Category:** Accessibility

**Suspicious patterns:**
- `<img>` tags without `alt` attributes
- Empty or placeholder alt text
- Low alt-to-image ratio

### 14. Semantic HTML Issues Detection

Identifies improper HTML tag usage (excessive divs vs semantic tags).

**Registry name:** `semantic_html_issues` · **Confidence:** 0.3 · **Category:** Accessibility

**Suspicious patterns:**
- Excessive div usage (>70% of structure)
- Missing semantic tags (nav, header, section, article, etc.)
- Poor HTML structure suggesting AI-generated markup

### 15. Accessibility Markers Detection

Detects missing ARIA labels, roles, and language attributes.

**Registry name:** `accessibility_markers` · **Confidence:** 0.3 · **Category:** Accessibility

**Suspicious patterns:**
- Missing aria-label attributes on interactive elements
- No role definitions
- Missing `lang` attributes

### 16. Heading Hierarchy Issues Detection

Identifies non-sequential heading levels in HTML.

**Registry name:** `heading_hierarchy_issues` · **Confidence:** 0.4 · **Category:** Structural

**Suspicious patterns:**
- Skipped heading levels (h1 directly to h3)
- Multiple h1 tags per page
- Out-of-order heading structure

### 17. Hardcoded Values Detection

Detects inline styles, hardcoded pixels, and color values.

**Registry name:** `hardcoded_values` · **Confidence:** 0.5 · **Category:** Pattern

**Suspicious patterns:**
- Excessive inline `style` attributes
- Hardcoded pixel measurements (`width: 300px`)
- Colors defined inline instead of via CSS variables

### 18. Form Issues Detection

Flags missing labels, improper input types, and form accessibility issues.

**Registry name:** `form_issues` · **Confidence:** 0.3 · **Category:** Accessibility

**Suspicious patterns:**
- Inputs without associated labels
- Missing or incorrect input `type` attributes
- Forms without proper `name` attributes

### 19. Link Text Quality Detection

Identifies generic or non-descriptive link text.

**Registry name:** `link_text_quality` · **Confidence:** 0.4 · **Category:** Accessibility

**Suspicious patterns:**
- "Click here" links
- "Read more" without context
- Single-word link text like "link" or "here"

### 20. Generic Styling Detection

Detects default colors, missing theming, and overuse of inline styles.

**Registry name:** `generic_styling` · **Confidence:** 0.4 · **Category:** Pattern

**Suspicious patterns:**
- Default color schemes with no customization
- No CSS variables or theming system
- Missing responsive design / media queries
- Overuse of inline styles over stylesheet

---

## How Scoring Works

Cadence doesn't flag content based on a single strategy match. Instead:

1. **Individual scores** - Each strategy produces a confidence score (0.0–1.0)
2. **Consensus** - Content is flagged when multiple strategies report high scores
3. **Weighting** - Strategies have different base confidence levels (shown above)
4. **Final result** - Combined analysis across all triggered strategies

A commit flagged by 5+ strategies is far more likely to be suspicious than one flagged by a single strategy.

## Configuring Strategies

Adjust detection sensitivity via configuration file:

```yaml
thresholds:
  # Adjust these values to tune detection sensitivity
  suspicious_additions: 500       # Lower = more sensitive
  suspicious_deletions: 1000
  max_additions_per_min: 100      # Lower = stricter
  min_time_delta_seconds: 60      # Higher = less sensitive
  max_files_per_commit: 50        # Lower = more restrictive
  max_addition_ratio: 0.95        # Lower = stricter

# Disable specific strategies
strategies:
  commit_message_analysis: false   # Disable commit message checks
  template_pattern: false          # Disable template detection
```

## Next Steps

- [Repository Analysis](/docs/analysis/repository) - How strategies combine for repository analysis
- [Web Analysis](/docs/analysis/web) - Web content analysis guide
- [CLI Commands](/docs/cli/commands) - How to run analyses
