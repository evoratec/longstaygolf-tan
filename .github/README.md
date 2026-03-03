# Cadence Documentation Website

Official documentation and landing page for [Cadence](https://github.com/TryCadence/Website), an AI content detection tool for Git repositories and websites.

**Live Site**: [https://noslop.tech](https://noslop.tech)

## Overview

This is the frontend website for Cadence, featuring:
- Landing page with feature showcase
- Comprehensive documentation (21 pages)
- Mobile-responsive design with hamburger navigation
- Markdown-based documentation system

## Tech Stack

- **Framework**: TanStack Start with React 19
- **Routing**: TanStack Router (file-based)
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite 7.3.1
- **Deployment**: Cloudflare Workers compatible
- **Markdown**: react-markdown with remark-gfm
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Package manager (npm, pnpm, or bun)

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Open browser at http://localhost:3001
```

### Development Scripts

```bash
# Development
bun run dev          # Start dev server with HMR

# Build
bun run build        # Production build
bun run start        # Preview production build

# Code Quality
bun run lint         # Lint with Biome
bun run format       # Format code with Biome
bun run check        # Check formatting
bun run typecheck    # TypeScript validation

# Testing
bun run test         # Run Vitest tests
```

## Project Structure

```
cadence-web/
├── docs/                    # Markdown documentation files
│   ├── index.md
│   ├── installation.md
│   ├── quick-start.md
│   ├── cli-commands.md
│   ├── detection-strategies.md
│   ├── git-analysis-guide.md
│   ├── web-analysis-guide.md
│   ├── api-webhooks.md
│   ├── agent-skills.md
│   ├── contributing.md
│   ├── security.md
│   └── ...
├── public/                  # Static assets
│   ├── llms.txt
│   ├── manifest.json
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── landing/        # Landing page sections
│   │   ├── layouts/        # Page layouts
│   │   ├── ui/             # Reusable UI components
│   │   └── MarkdownRenderer.tsx
│   ├── routes/             # File-based routing
│   │   ├── __root.tsx
│   │   ├── index.tsx       # Landing page
│   │   └── docs/
│   │       ├── $.tsx       # Dynamic docs route
│   │       └── index.tsx   # Docs homepage
│   ├── lib/                # Utilities
│   ├── router.tsx
│   └── styles.css
├── biome.json              # Biome configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── wrangler.jsonc          # Cloudflare Workers config
```

## Documentation

### Adding New Documentation Pages

1. Create a markdown file in `docs/` with frontmatter:

```markdown
---
title: Page Title
description: Brief description
---

# Content starts here
```

2. Import the markdown file in `src/routes/docs/$.tsx`:

```tsx
import newPageMd from '../../../docs/new-page.md?raw'
```

3. Add to the `docsMap`:

```tsx
const docsMap: Record<string, string> = {
  'new-page': newPageMd,
  // ... other pages
}
```

4. Update navigation in `src/components/layouts/DocsLayout.tsx`:

```tsx
const navSections = [
  {
    title: 'Section Name',
    links: [
      { href: '/docs/new-page', label: 'New Page' },
    ],
  },
]
```

### Markdown Features

The site supports:
- GitHub Flavored Markdown (via remark-gfm)
- Syntax highlighting for code blocks
- Tables, lists, blockquotes
- Responsive images
- Inline code and code blocks

## Components

### Landing Page Sections

All located in `src/components/landing/`:
- `Hero.tsx` - Hero section with CTA
- `StatsBar.tsx` - Statistics display
- `FeaturesGrid.tsx` - Feature cards
- `DetectionStrategies.tsx` - Strategy showcase
- `ExampleReports.tsx` - Example output
- `QuickStart.tsx` - Code examples
- `Partners.tsx` - Partner marquee
- `CTASection.tsx` - Final call-to-action
- `Footer.tsx` - Site footer

### Layouts

- `LandingLayout.tsx` - Landing page wrapper
- `DocsLayout.tsx` - Documentation page wrapper with sidebar

### UI Components

Reusable components in `src/components/ui/`:
- `Button.tsx` - Button component
- Other Radix UI primitives

## Styling

### Tailwind Configuration

Uses Tailwind CSS v4 with custom utilities defined in `src/styles.css`:
- Custom animations (float, glow, marquee)
- Glass morphism utilities
- Gradient utilities
- Dark theme variables

### Design System

**Colors:**
- Background: `#09090b`
- Borders: `white/5`, `white/10`
- Text: `white`, `white/70`, `white/50`, `white/40`

**Spacing:**
- Sections: `py-20`
- Content width: `max-w-4xl`, `max-w-5xl`, `max-w-6xl`

## Routing

Uses TanStack Router with file-based routing:
- `/` - Landing page
- `/docs` - Documentation homepage
- `/docs/*` - Dynamic documentation pages

The router automatically generates route types for type-safe navigation.

## Deployment

### Cloudflare Workers

Configured for Cloudflare Workers deployment via `wrangler.jsonc`.

```bash
# Deploy to Cloudflare
bun run deploy
```

### Static Export

Can also be deployed as a static site:

```bash
bun run build
# Deploy dist/ directory to any static host
```

## Performance

- Server-side rendering (SSR) with Vite
- Code splitting by route
- Optimized bundle size
- Responsive images
- Minimal JavaScript for documentation pages

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (hamburger menu on small screens)
- Progressive enhancement for older browsers

## Contributing

When contributing to the website:

1. Follow the existing component structure
2. Use Biome for formatting (`bun run format`)
3. Test on mobile and desktop viewports
4. Keep bundle size minimal
5. Maintain accessibility standards
6. Update documentation when adding features

## Code Quality

- **Linting**: Biome with strict rules
- **Formatting**: Biome auto-formatting
- **Type Safety**: TypeScript with strict mode
- **Testing**: Vitest for unit tests

## Environment

No environment variables required for basic operation. The site is fully static.

## License

Part of the [Cadence](https://github.com/TryCadence/Website) project.

Licensed under AGPL-3.0.

## Links

- **Main Repository**: [TryCadence/Website](https://github.com/TryCadence/Website)
- **Live Site**: [https://noslop.tech](https://noslop.tech)
- **CLI Tool**: [cadence-tool/](../cadence-tool/)

## Support

For issues or questions about the website:
- Open an issue on [GitHub](https://github.com/TryCadence/Website/issues)
- Contact: [hey@noslop.tech](mailto:hey@noslop.tech)
