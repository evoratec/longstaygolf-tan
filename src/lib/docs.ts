/**
 * Auto-discovery documentation system
 *
 * Uses Vite's import.meta.glob to automatically discover and load all markdown
 * documentation files at build time. Cloudflare Workers compatible since all
 * file reading happens during the Vite build step.
 *
 * To add new documentation:
 * 1. Create a .md file in the docs/ directory
 * 2. Organize in section folders (e.g., docs/getting-started/my-page.md)
 * 3. Add an index.md to each directory for its overview page
 * 4. Subdirectories automatically become nested subsections in navigation
 * 5. Use frontmatter to customize titles, ordering, and visibility
 *
 * Supported frontmatter:
 *   title:       Page title (fallback: first # heading, then filename)
 *   description: Page description (fallback: first paragraph after heading)
 *   order:       Sort order within section (default: 999, index pages: -1)
 *   nav_title:   Custom label for sidebar navigation (fallback: title)
 *   hidden:      Set to true to exclude from navigation (still routable)
 */

// --- Types ---

export interface NavLink {
	href: string;
	label: string;
}

export interface NavSection {
	title: string;
	slug: string;
	description: string;
	order: number;
	links: NavLink[];
	subsections: NavSection[];
}

interface DocMeta {
	slug: string;
	dirPath: string;
	title: string;
	description: string;
	navLabel: string;
	order: number;
	hidden: boolean;
	isIndex: boolean;
}

// --- Markdown Parsing ---

/**
 * Parse markdown content, extracting frontmatter and returning the rendered
 * markdown body along with title and description metadata.
 *
 * Frontmatter is expected to be YAML-like format between two lines of `---`:
 *   ---
 *   title: Some Title
 *   description: Some description
 *   ---
 *
 * This function strips the frontmatter and returns only the markdown body.
 * If the markdown starts with an H1 matching the extracted title, it's removed
 * to avoid duplication (since the title is rendered by the layout).
 */
export function parseMarkdown(content: string) {
	const normalized = content.replace(/\r\n/g, "\n");

	// Simple frontmatter extraction: look for --- at start and somewhere else
	let markdown = "";
	let title = "";
	let description = "";

	// Check if file starts with frontmatter
	if (normalized.startsWith("---")) {
		// Find the closing --- (must be on its own line)
		const closingIndex = normalized.indexOf("\n---\n", 4); // Start search after opening ---\n

		if (closingIndex !== -1) {
			// Found closing ---, extract frontmatter
			const frontmatterBlock = normalized.substring(4, closingIndex); // Skip "---\n"
			markdown = normalized.substring(closingIndex + 5).trim(); // Skip "\n---\n"

			// Parse frontmatter lines
			for (const line of frontmatterBlock.split("\n")) {
				const match = line.match(/^title:\s*(.+)$/);
				if (match) {
					title = match[1].trim();
				}
				const descMatch = line.match(/^description:\s*(.+)$/);
				if (descMatch) {
					description = descMatch[1].trim();
				}
			}
		} else {
			// No closing ---, treat entire file as markdown
			markdown = normalized;
			title = extractHeading(markdown) || "Documentation";
		}
	} else {
		// No frontmatter
		markdown = normalized;
		title = extractHeading(markdown) || "Documentation";
	}

	// Fallback title/description extraction if not in frontmatter
	if (!title) {
		title = extractHeading(markdown) || "Documentation";
	}
	if (!description) {
		description = extractDescription(markdown) || "";
	}

	// Remove duplicate H1 if markdown starts with it and it matches the title
	const firstHeading = extractHeading(markdown);
	if (
		firstHeading &&
		firstHeading.toLowerCase() === title.toLowerCase()
	) {
		markdown = markdown.replace(/^#+\s+.+\n+/, "");
	}

	return { markdown, title, description };
}

function extractHeading(content: string): string | null {
	return content.match(/^#\s+(.+)$/m)?.[1]?.trim() || null;
}

function extractDescription(content: string): string | null {
	return (
		content.match(/^#\s+.+\n\n(.+?)(?:\n\n|$)/m)?.[1]?.trim() || null
	);
}

// --- Frontmatter Field Extraction ---

function extractFrontmatter(
	content: string,
): Record<string, string | number | boolean> {
	const normalized = content.replace(/\r\n/g, "\n");
	const match = normalized.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};

	const result: Record<string, string | number | boolean> = {};
	for (const line of match[1].split("\n")) {
		const kv = line.match(/^([\w_]+)\s*:\s*(.+)$/);
		if (kv) {
			const [, key, rawValue] = kv;
			const value = rawValue.trim();
			if (value === "true") result[key] = true;
			else if (value === "false") result[key] = false;
			else if (/^\d+$/.test(value))
				result[key] = Number.parseInt(value, 10);
			else result[key] = value;
		}
	}
	return result;
}

// --- Auto-Discovery via Vite Glob ---

// Resolved at build time — all matching markdown files are bundled into the output.
// This is compatible with Cloudflare Workers since no runtime filesystem access is needed.
const modules = import.meta.glob<string>("../../docs/**/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
});

// Path prefix to strip (matches glob base path)
const PATH_PREFIX = /^.*?\/docs\//;

function pathToMeta(path: string, content: string): DocMeta | null {
	const relativePath = path.replace(PATH_PREFIX, "");
	const filename = relativePath.split("/").pop() || "";

	// Skip underscore-prefixed files (partials / includes)
	if (filename.startsWith("_")) return null;

	const parts = relativePath.replace(/\.md$/, "").split("/");
	const isIndex = filename === "index.md";
	const slug =
		parts.join("/").replace(/\/index$/, "") || "index";
	const dirPath = parts.slice(0, -1).join("/");

	const { title, description } = parseMarkdown(content);
	const fm = extractFrontmatter(content);

	return {
		slug,
		dirPath,
		title,
		description,
		navLabel: isIndex
			? "Overview"
			: ((fm.nav_title as string) || title),
		order:
			typeof fm.order === "number"
				? fm.order
				: isIndex
					? -1
					: 999,
		hidden: fm.hidden === true,
		isIndex,
	};
}

// --- Build Content Map & Metadata ---

function buildDocs() {
	const contentMap: Record<string, string> = {};
	const metas: DocMeta[] = [];

	for (const [path, content] of Object.entries(modules)) {
		const meta = pathToMeta(path, content);
		if (!meta) continue;

		contentMap[meta.slug] = content;
		metas.push(meta);
	}

	// Legacy route aliases — serve the same content at old URLs for backwards compatibility.
	// These can be removed once old links have been updated everywhere.
	const legacyAliases: Record<string, string> = {
		installation: "getting-started/installation",
		"quick-start": "getting-started/quick-start",
		configuration: "getting-started/configuration",
		"quick-reference": "getting-started/quick-reference",
		"cli-commands": "cli/commands",
		"detection-strategies": "cli/detection-strategies",
		"repository-analysis": "analysis/repository",
		"git-analysis-guide": "analysis/git",
		"web-analysis-guide": "analysis/web",
		"agent-skills": "integrations/agent-skills",
		"api-webhooks": "integrations/webhooks",
		"build-development": "reference/build-development",
		"troubleshooting-guide": "reference/operations/troubleshooting",
		disclaimer: "reference/disclaimer",
		contributing: "community/contributing",
		security: "community/security",
		// Deleted pages → redirect to current content
		"reference/advanced-configuration": "getting-started/configuration",
		"advanced-configuration": "getting-started/configuration",
		// AI docs moved into integrations
		ai: "integrations/ai-providers",
		"ai/configuration": "integrations/ai-providers/configuration",
		"ai/examples": "integrations/ai-providers/examples",
		// Legacy flat operations routes → new reference/operations structure
		operations: "reference/operations",
		"operations/binary":
			"reference/operations/deployment-methods/binary",
		"operations/docker":
			"reference/operations/deployment-methods/docker",
		"operations/kubernetes":
			"reference/operations/deployment-methods/kubernetes",
		"operations/nginx": "reference/operations/networking/nginx",
		"operations/ha": "reference/operations/networking/ha",
		"operations/monitoring": "reference/operations/monitoring",
		"operations/performance":
			"reference/operations/advanced/performance",
		"operations/security": "reference/operations/security",
		"operations/troubleshooting":
			"reference/operations/troubleshooting",
		"operations/migration":
			"reference/operations/advanced/migration",
	};

	for (const [oldSlug, newSlug] of Object.entries(legacyAliases)) {
		if (contentMap[newSlug] && !contentMap[oldSlug]) {
			contentMap[oldSlug] = contentMap[newSlug];
		}
	}

	return { contentMap, metas };
}

// --- Build Navigation Sections ---

// Default ordering for top-level sections. New sections not listed here
// sort alphabetically after the configured ones.
const SECTION_ORDER: Record<string, number> = {
	"getting-started": 0,
	cli: 1,
	analysis: 2,
	integrations: 3,
	plugins: 4,
	reference: 5,
	community: 6,
};

function toTitleCase(slug: string): string {
	return slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

type DirEntry = {
	indexMeta: DocMeta | null;
	pages: DocMeta[];
};

/**
 * Build a recursive tree of navigation sections from a flat list of doc metadata.
 * Each directory with pages becomes a NavSection; subdirectories become nested subsections.
 */
function buildNavSections(metas: DocMeta[]): NavSection[] {
	// Group all non-hidden metas by their directory path
	const dirMap = new Map<string, DirEntry>();

	for (const meta of metas) {
		if (meta.hidden) continue;
		// Skip root-level pages (like docs/index.md)
		if (meta.dirPath === "") continue;

		if (!dirMap.has(meta.dirPath)) {
			dirMap.set(meta.dirPath, { indexMeta: null, pages: [] });
		}

		const entry = dirMap.get(meta.dirPath)!;
		if (meta.isIndex) {
			entry.indexMeta = meta;
		}
		entry.pages.push(meta);
	}

	// Find top-level directories (no "/" in the dirPath)
	const topLevelDirs = [...dirMap.keys()]
		.filter((d) => !d.includes("/"))
		.sort();

	const sections = topLevelDirs
		.map((d) => buildDirSection(d, dirMap))
		.filter(Boolean) as NavSection[];

	// Sort top-level sections by configured order, then alphabetically
	sections.sort((a, b) => {
		const orderA = SECTION_ORDER[a.slug] ?? 100;
		const orderB = SECTION_ORDER[b.slug] ?? 100;
		if (orderA !== orderB) return orderA - orderB;
		return a.title.localeCompare(b.title);
	});

	return sections;
}

/**
 * Recursively build a NavSection for a directory and all its subdirectories.
 */
function buildDirSection(
	dirPath: string,
	dirMap: Map<string, DirEntry>,
): NavSection | null {
	const entry = dirMap.get(dirPath);
	if (!entry) return null;

	// Find direct child directories (one level deeper)
	const prefix = dirPath + "/";
	const childDirs = [...dirMap.keys()].filter((d) => {
		if (!d.startsWith(prefix)) return false;
		const rest = d.slice(prefix.length);
		return !rest.includes("/");
	});

	// Build subsections recursively
	const subsections = childDirs
		.map((d) => buildDirSection(d, dirMap))
		.filter(Boolean) as NavSection[];

	// Sort pages: index first, then by order, then alphabetically
	const pages = [...entry.pages].sort((a, b) => {
		if (a.isIndex !== b.isIndex) return a.isIndex ? -1 : 1;
		if (a.order !== b.order) return a.order - b.order;
		return a.navLabel.localeCompare(b.navLabel);
	});

	// Sort subsections by order, then alphabetically
	subsections.sort((a, b) => {
		if (a.order !== b.order) return a.order - b.order;
		return a.title.localeCompare(b.title);
	});

	const dirName = dirPath.split("/").pop() || dirPath;
	const indexOrder = entry.indexMeta?.order ?? 999;

	return {
		title:
			entry.indexMeta?.title && entry.indexMeta.title !== "Documentation"
				? entry.indexMeta.title
				: toTitleCase(dirName),
		slug: dirPath,
		description: entry.indexMeta?.description || "",
		order: indexOrder === -1 ? 999 : indexOrder,
		links: pages.map((p) => ({
			href: `/docs/${p.slug}`,
			label: p.navLabel,
		})),
		subsections,
	};
}

// --- Breadcrumb Trail ---

/**
 * Find the chain of NavSections from root to the section containing the given slug.
 * Returns an array from outermost to innermost section.
 */
export function findBreadcrumbTrail(
	sections: NavSection[],
	slug: string,
): NavSection[] {
	for (const section of sections) {
		const trail = findInSection(section, slug);
		if (trail) return trail;
	}
	return [];
}

function findInSection(
	section: NavSection,
	slug: string,
): NavSection[] | null {
	if (slug === section.slug || slug.startsWith(section.slug + "/")) {
		// Check subsections first for a deeper match
		for (const sub of section.subsections) {
			const trail = findInSection(sub, slug);
			if (trail) return [section, ...trail];
		}
		return [section];
	}
	return null;
}

// --- Initialize & Export ---

const { contentMap, metas } = buildDocs();

/** Map of slug → raw markdown content (including frontmatter). Used by route loaders. */
export const docsMap: Record<string, string> = contentMap;

/** Auto-generated navigation sections derived from docs directory structure. */
export const navSections: NavSection[] = buildNavSections(metas);
