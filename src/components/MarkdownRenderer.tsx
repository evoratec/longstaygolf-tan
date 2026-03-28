import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";

import {
	VscInfo,
	VscLightbulb,
	VscWarning,
	VscError,
	VscFlame,
	VscCopy,
	VscCheck,
	VscLink,
	VscChevronRight,
	VscFileCode,
	VscTerminalBash,
	VscTerminalPowershell,
	VscJson,
	VscMarkdown,
	VscCode,
} from "react-icons/vsc";
import {
	SiTypescript,
	SiJavascript,
	SiGo,
	SiPython,
	SiRust,
	SiDocker,

	SiHtml5,
	SiToml,
	SiGraphql,
} from "react-icons/si";
import { TbSql } from "react-icons/tb";
import { HiOutlineExternalLink } from "react-icons/hi";

interface MarkdownRendererProps {
	content: string;
}

// ── Language icons for code blocks ────────────────────────────────────────────

const LANG_ICONS: Record<string, React.ReactNode> = {
	bash: <VscTerminalBash className="w-3.5 h-3.5" />,
	sh: <VscTerminalBash className="w-3.5 h-3.5" />,
	shell: <VscTerminalBash className="w-3.5 h-3.5" />,
	zsh: <VscTerminalBash className="w-3.5 h-3.5" />,
	typescript: <SiTypescript className="w-3 h-3" />,
	ts: <SiTypescript className="w-3 h-3" />,
	tsx: <SiTypescript className="w-3 h-3" />,
	go: <SiGo className="w-3.5 h-3.5" />,
	python: <SiPython className="w-3.5 h-3.5" />,
	py: <SiPython className="w-3.5 h-3.5" />,
	rust: <SiRust className="w-3.5 h-3.5" />,
	rs: <SiRust className="w-3.5 h-3.5" />,
	json: <VscJson className="w-3.5 h-3.5" />,
	yaml: <VscFileCode className="w-3.5 h-3.5" />,
	yml: <VscFileCode className="w-3.5 h-3.5" />,
	dockerfile: <SiDocker className="w-3.5 h-3.5" />,
	docker: <SiDocker className="w-3.5 h-3.5" />,
	markdown: <VscMarkdown className="w-3.5 h-3.5" />,
	md: <VscMarkdown className="w-3.5 h-3.5" />,
	javascript: <SiJavascript className="w-3 h-3" />,
	js: <SiJavascript className="w-3 h-3" />,
	jsx: <SiJavascript className="w-3 h-3" />,
	powershell: <VscTerminalPowershell className="w-3.5 h-3.5" />,
	ps1: <VscTerminalPowershell className="w-3.5 h-3.5" />,

	html: <SiHtml5 className="w-3.5 h-3.5" />,
	toml: <SiToml className="w-3.5 h-3.5" />,
	sql: <TbSql className="w-3.5 h-3.5" />,
	graphql: <SiGraphql className="w-3.5 h-3.5" />,
	gql: <SiGraphql className="w-3.5 h-3.5" />,
};

const LANG_LABELS: Record<string, string> = {
	bash: "Bash",
	sh: "Shell",
	shell: "Shell",
	zsh: "Zsh",
	typescript: "TypeScript",
	ts: "TypeScript",
	tsx: "TSX",
	javascript: "JavaScript",
	js: "JavaScript",
	jsx: "JSX",
	go: "Go",
	python: "Python",
	py: "Python",
	rust: "Rust",
	rs: "Rust",
	json: "JSON",
	yaml: "YAML",
	yml: "YAML",
	toml: "TOML",
	dockerfile: "Dockerfile",
	docker: "Docker",
	markdown: "Markdown",
	md: "Markdown",
	html: "HTML",
	css: "CSS",
	sql: "SQL",
	graphql: "GraphQL",
	xml: "XML",
	powershell: "PowerShell",
	ps1: "PowerShell",
	plaintext: "Text",
	text: "Text",
	diff: "Diff",
	ini: "INI",
	env: "Environment",
	nginx: "Nginx",
	apache: "Apache",
};

// ── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	}, [text]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 z-10"
			aria-label={copied ? "Copied!" : "Copy code"}
		>
			{copied ? (
				<VscCheck className="w-3.5 h-3.5 text-emerald-400" />
			) : (
				<VscCopy className="w-3.5 h-3.5 text-white/50 hover:text-white/80" />
			)}
		</button>
	);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractText(children: React.ReactNode): string {
	if (typeof children === "string") return children;
	if (Array.isArray(children)) return children.map(extractText).join("");
	if (children && typeof children === "object" && "props" in children) {
		return extractText((children as { props: { children: React.ReactNode } }).props.children);
	}
	return "";
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

// ── Callout / Admonition ─────────────────────────────────────────────────────

type CalloutType = "note" | "tip" | "warning" | "important" | "caution" | "danger";

const CALLOUT_STYLES: Record<
	CalloutType,
	{ bg: string; border: string; accent: string; icon: React.ReactNode; title: string }
> = {
	note: {
		bg: "bg-blue-500/8",
		border: "border-blue-500/25",
		accent: "text-blue-400",
		icon: <VscInfo className="w-4 h-4" />,
		title: "Note",
	},
	tip: {
		bg: "bg-emerald-500/8",
		border: "border-emerald-500/25",
		accent: "text-emerald-400",
		icon: <VscLightbulb className="w-4 h-4" />,
		title: "Tip",
	},
	warning: {
		bg: "bg-amber-500/8",
		border: "border-amber-500/25",
		accent: "text-amber-400",
		icon: <VscWarning className="w-4 h-4" />,
		title: "Warning",
	},
	important: {
		bg: "bg-purple-500/8",
		border: "border-purple-500/25",
		accent: "text-purple-400",
		icon: <VscFlame className="w-4 h-4" />,
		title: "Important",
	},
	caution: {
		bg: "bg-orange-500/8",
		border: "border-orange-500/25",
		accent: "text-orange-400",
		icon: <VscWarning className="w-4 h-4" />,
		title: "Caution",
	},
	danger: {
		bg: "bg-red-500/8",
		border: "border-red-500/25",
		accent: "text-red-400",
		icon: <VscError className="w-4 h-4" />,
		title: "Danger",
	},
};

function Callout({
	type,
	children,
}: {
	type: CalloutType;
	children: React.ReactNode;
}) {
	const style = CALLOUT_STYLES[type];
	return (
		<div
			className={`${style.bg} border-l-4 ${style.border} rounded-r-lg p-4 my-5`}
		>
			<div className={`flex items-center gap-2 mb-2 ${style.accent}`}>
				{style.icon}
				<span className="font-semibold text-sm">{style.title}</span>
			</div>
			<div className="text-sm text-white/70 leading-relaxed [&>p]:mb-0 [&>p:last-child]:mb-0">
				{children}
			</div>
		</div>
	);
}

// ── Heading component factory ────────────────────────────────────────────────

function Heading({
	level,
	children,
}: {
	level: 1 | 2 | 3 | 4;
	children: React.ReactNode;
}) {
	const text = extractText(children);
	const id = slugify(text);
	const Tag = `h${level}` as const;

	const styles: Record<number, string> = {
		1: "text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 mt-6 sm:mt-8",
		2: "text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 mt-10 sm:mt-12 pb-3 border-b border-white/10",
		3: "text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 mt-8 sm:mt-10",
		4: "text-base sm:text-lg font-semibold text-white/90 mb-2 mt-6",
	};

	return (
		<Tag id={id} className={`group scroll-mt-24 ${styles[level]}`}>
			<a
				href={`#${id}`}
				className="no-underline hover:no-underline inline-flex items-center gap-2"
			>
				{children}
				<VscLink className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity text-white/40 shrink-0" />
			</a>
		</Tag>
	);
}

// ── Markdown component overrides ─────────────────────────────────────────────

const markdownComponents: any = {
	h1: ({ children }: any) => <Heading level={1}>{children}</Heading>,
	h2: ({ children }: any) => <Heading level={2}>{children}</Heading>,
	h3: ({ children }: any) => <Heading level={3}>{children}</Heading>,
	h4: ({ children }: any) => <Heading level={4}>{children}</Heading>,

	p: ({ children }: any) => (
		<p className="text-[0.9375rem] text-white/70 mb-4 leading-[1.75]">
			{children}
		</p>
	),

	a: ({ href, children }: any) => {
		const isExternal =
			href?.startsWith("http://") || href?.startsWith("https://");
		return (
			<a
				href={href}
				className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-3 decoration-emerald-400/30 hover:decoration-emerald-300/60 inline-flex items-center gap-1"
				{...(isExternal
					? { target: "_blank", rel: "noopener noreferrer" }
					: {})}
			>
				{children}
				{isExternal && (
					<HiOutlineExternalLink className="w-3 h-3 shrink-0 opacity-50" />
				)}
			</a>
		);
	},

	ul: ({ children, className }: any) => {
		// Detect GFM task list (contains-task-list)
		const isTasks = className?.includes("contains-task-list");
		return (
			<ul
				className={`space-y-2 mb-5 ${isTasks ? "list-none ml-0" : "list-none ml-1"}`}
			>
				{children}
			</ul>
		);
	},

	ol: ({ children }: any) => (
		<ol className="list-none ml-1 space-y-2 mb-5 counter-reset-[list-counter]">
			{children}
		</ol>
	),

	li: ({ children, ordered, checked }: any) => {
		// GFM task list item
		if (checked !== undefined && checked !== null) {
			return (
				<li className="text-[0.9375rem] text-white/70 flex items-start gap-3">
					<span
						className={`shrink-0 mt-1 w-4 h-4 rounded border flex items-center justify-center ${
							checked
								? "bg-emerald-500/20 border-emerald-500/50"
								: "bg-white/5 border-white/20"
						}`}
					>
						{checked && <VscCheck className="w-3 h-3 text-emerald-400" />}
					</span>
					<span className={`flex-1 min-w-0 ${checked ? "text-white/50 line-through" : ""}`}>
						{children}
					</span>
				</li>
			);
		}

		if (ordered) {
			return (
				<li className="text-[0.9375rem] text-white/70 flex items-start gap-3 counter-increment-[list-counter]">
					<span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium flex items-center justify-center before:content-[counter(list-counter)]" />
					<span className="flex-1 min-w-0">{children}</span>
				</li>
			);
		}

		return (
			<li className="text-[0.9375rem] text-white/70 flex items-start gap-3">
				<VscChevronRight className="w-3.5 h-3.5 text-emerald-400/70 shrink-0 mt-1" />
				<span className="flex-1 min-w-0">{children}</span>
			</li>
		);
	},

	code: ({ className, children, node }: any) => {
		// In react-markdown v10, `inline` prop was removed.
		// Block code has a className (language-xxx / hljs) from rehype-highlight.
		const isBlock =
			Boolean(className) ||
			(node?.properties?.className?.length ?? 0) > 0;

		if (isBlock) {
			return (
				<code className={`${className || ""} wrap-break-word`}>
					{children}
				</code>
			);
		}

		// Inline code
		return (
			<code className="bg-white/8 text-emerald-300 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono border border-white/10 wrap-break-word">
				{children}
			</code>
		);
	},

	pre: ({ children }: any) => {
		const codeElement = children?.props?.children;
		const codeText = extractText(codeElement);
		const className = children?.props?.className || "";
		const languageMatch = className.match(/language-(\w+)/);
		const language = languageMatch ? languageMatch[1] : "";
		const langIcon = LANG_ICONS[language] || <VscCode className="w-3.5 h-3.5" />;
		const langLabel = LANG_LABELS[language] || language;

		return (
			<div className="group relative mb-6 -mx-4 sm:mx-0">
				{/* Language header bar */}
				<div className="flex items-center justify-between bg-[#161b22] border border-b-0 border-white/10 px-4 py-2 sm:rounded-t-lg">
					<div className="flex items-center gap-2 text-xs text-white/40 font-mono">
						<span className="text-white/30">{langIcon}</span>
						{langLabel && <span>{langLabel}</span>}
					</div>
					<CopyButton text={codeText} />
				</div>
				<pre className="bg-[#0d1117] border border-t-0 border-white/10 px-4 py-4 overflow-x-auto text-sm sm:rounded-b-lg font-mono leading-relaxed [&_.copy-btn]:hidden">
					{children}
				</pre>
			</div>
		);
	},

	blockquote: ({ children }: any) => {
		const text = extractText(children);
		const calloutMatch = text.match(
			/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION|DANGER)\]/i,
		);

		if (calloutMatch) {
			const type = calloutMatch[1].toLowerCase() as CalloutType;
			const cleanContent = text.replace(
				/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION|DANGER)\]\s*/i,
				"",
			);
			return (
				<Callout type={type}>
					<p>{cleanContent}</p>
				</Callout>
			);
		}

		return (
			<blockquote className="border-l-4 border-white/20 pl-4 py-2 my-5 bg-white/3 rounded-r-lg">
				<div className="text-white/60 italic [&>p]:mb-0">{children}</div>
			</blockquote>
		);
	},

	table: ({ children }: any) => (
		<div className="overflow-x-auto mb-6 -mx-4 sm:mx-0 border border-white/10 sm:rounded-lg bg-white/2">
			<table className="min-w-full divide-y divide-white/10 text-sm">
				{children}
			</table>
		</div>
	),
	thead: ({ children }: any) => (
		<thead className="bg-white/5 sticky top-0">{children}</thead>
	),
	tbody: ({ children }: any) => (
		<tbody className="divide-y divide-white/5">{children}</tbody>
	),
	th: ({ children }: any) => (
		<th className="px-4 py-3 text-left text-white/90 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
			{children}
		</th>
	),
	td: ({ children }: any) => (
		<td className="px-4 py-3 text-white/70 min-w-25">{children}</td>
	),
	tr: ({ children, isHeader }: any) => (
		<tr
			className={
				isHeader
					? ""
					: "hover:bg-white/3 transition-colors even:bg-white/2"
			}
		>
			{children}
		</tr>
	),

	strong: ({ children }: any) => (
		<strong className="font-semibold text-white">{children}</strong>
	),
	em: ({ children }: any) => (
		<em className="italic text-white/80">{children}</em>
	),
	del: ({ children }: any) => (
		<del className="line-through text-white/40">{children}</del>
	),

	hr: () => (
		<div className="my-10 flex items-center gap-3">
			<div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
			<div className="flex gap-1.5">
				<span className="w-1 h-1 rounded-full bg-white/20" />
				<span className="w-1 h-1 rounded-full bg-white/15" />
				<span className="w-1 h-1 rounded-full bg-white/10" />
			</div>
			<div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
		</div>
	),

	img: ({ src, alt }: any) => (
		<figure className="my-6">
			<img
				src={src}
				alt={alt}
				className="rounded-lg border border-white/10 max-w-full h-auto shadow-lg"
				loading="lazy"
			/>
			{alt && alt !== "" && (
				<figcaption className="text-center text-xs text-white/40 mt-2 italic">
					{alt}
				</figcaption>
			)}
		</figure>
	),

	// Keyboard shortcut support (via raw html: <kbd>)
	kbd: ({ children }: any) => (
		<kbd className="inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium text-white/80 bg-white/10 border border-white/20 rounded-md shadow-[0_1px_0_1px_rgba(255,255,255,0.05)] min-w-6 justify-center">
			{children}
		</kbd>
	),

	// Details / summary support
	details: ({ children }: any) => (
		<details className="my-4 border border-white/10 rounded-lg bg-white/3 group/details open:bg-white/5 transition-colors">
			{children}
		</details>
	),
	summary: ({ children }: any) => (
		<summary className="px-4 py-3 cursor-pointer text-sm font-medium text-white/80 hover:text-white transition-colors select-none list-none flex items-center gap-2">
			<VscChevronRight className="w-4 h-4 text-white/40 transition-transform group-open/details:rotate-90 shrink-0" />
			{children}
		</summary>
	),

	// Definition list support (via raw html)
	dl: ({ children }: any) => (
		<dl className="my-5 space-y-4">{children}</dl>
	),
	dt: ({ children }: any) => (
		<dt className="text-sm font-semibold text-white flex items-center gap-2">
			<span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 shrink-0" />
			{children}
		</dt>
	),
	dd: ({ children }: any) => (
		<dd className="text-sm text-white/60 ml-5 leading-relaxed">{children}</dd>
	),

	// Highlight / mark support (<mark> via raw html)
	mark: ({ children }: any) => (
		<mark className="bg-amber-400/20 text-amber-200 px-1 py-0.5 rounded-sm border-b border-amber-400/40">
			{children}
		</mark>
	),

	// Subscript and superscript
	sub: ({ children }: any) => (
		<sub className="text-[0.75em] text-white/60 align-sub">{children}</sub>
	),
	sup: ({ children }: any) => (
		<sup className="text-[0.75em] text-white/60 align-super">{children}</sup>
	),

	// Abbreviation with dotted underline
	abbr: ({ title, children }: any) => (
		<abbr
			title={title}
			className="text-white/80 no-underline border-b border-dashed border-white/30 cursor-help"
		>
			{children}
		</abbr>
	),

	// Inserted text (underline)
	ins: ({ children }: any) => (
		<ins className="text-emerald-300/80 no-underline border-b border-emerald-400/40">
			{children}
		</ins>
	),

	// Variable / math placeholder
	var: ({ children }: any) => (
		<var className="not-italic text-purple-300 font-mono text-[0.9em] font-medium">
			{children}
		</var>
	),

	// Sample output
	samp: ({ children }: any) => (
		<samp className="bg-white/5 text-orange-300/80 px-1.5 py-0.5 rounded-md text-[0.85em] font-mono border border-white/10">
			{children}
		</samp>
	),

	// Citation
	cite: ({ children }: any) => (
		<cite className="not-italic text-white/50 border-l-2 border-white/15 pl-2">
			{children}
		</cite>
	),

	// Video support (via raw html)
	video: ({ src, ...props }: any) => (
		<div className="my-6 rounded-lg overflow-hidden border border-white/10 shadow-lg">
			<video
				src={src}
				className="w-full"
				controls
				preload="metadata"
				{...props}
			/>
		</div>
	),

	// Section support — transparent wrapper with spacing
	section: ({ children, className, ...props }: any) => (
		<section className={`my-6 ${className || ""}`} {...props}>
			{children}
		</section>
	),

	// Aside / callout-style sidebar note
	aside: ({ children }: any) => (
		<aside className="my-5 p-4 bg-white/3 border border-white/10 rounded-lg text-sm text-white/60 leading-relaxed">
			{children}
		</aside>
	),
};

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight, rehypeRaw];

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
	return (
		<div className="prose prose-invert max-w-none">
			<ReactMarkdown
				remarkPlugins={remarkPlugins}
				rehypePlugins={rehypePlugins}
				components={markdownComponents}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
