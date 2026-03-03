import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Bug,
	Calendar,
	ChevronDown,
	ChevronRight,
	Download,
	ExternalLink,
	GitCommit,
	Loader2,
	Plus,
	Tag,
	Wrench,
} from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { useEffect, useState } from "react";
import { LogoIcon } from "../components/Logo";
import { Footer } from "../components/landing/Footer";

interface GitHubRelease {
	id: number;
	tag_name: string;
	name: string;
	body: string;
	published_at: string;
	html_url: string;
	prerelease: boolean;
	draft: boolean;
	assets: {
		name: string;
		download_count: number;
		browser_download_url: string;
	}[];
}

interface ParsedSection {
	type: "added" | "changed" | "fixed" | "technical" | "other";
	title: string;
	items: string[];
}

function parseReleaseBody(body: string): ParsedSection[] {
	if (!body) return [];

	const sections: ParsedSection[] = [];
	const normalized = body.replace(/\r\n/g, "\n");

	// Split by section headers (### Header)
	const sectionSplit = normalized.split(/^### /m);

	// First element is before any header, skip it
	for (let i = 1; i < sectionSplit.length; i++) {
		const part = sectionSplit[i];
		const lines = part.split("\n");
		const firstLine = lines[0];

		// Extract section title from first line
		const sectionTitle = firstLine;
		const sectionContent = lines.slice(1).join("\n").trim();

		let type: ParsedSection["type"] = "other";
		if (firstLine === "Added") {
			type = "added";
		} else if (firstLine === "Changed") {
			type = "changed";
		} else if (firstLine === "Fixed") {
			type = "fixed";
		} else if (firstLine === "Technical Details") {
			type = "technical";
		}

		// Parse items - look for bullet points, numbered items, or sub-sections
		const items: string[] = [];
		const contentLines = sectionContent.split("\n");

		let currentItem = "";
		let currentSubsection = "";

		for (const line of contentLines) {
			// Skip completely empty lines
			if (!line.trim()) continue;

			// Sub-section headers (#### )
			if (line.startsWith("#### ")) {
				if (currentItem) items.push(currentItem.trim());
				currentSubsection = line.slice(5); // Remove "#### "
				currentItem = ""; // Reset, don't create item yet
				continue;
			}

			// Top-level bullets (not indented)
			if (
				(line.startsWith("- ") || line.startsWith("* ")) &&
				!line.startsWith("  ")
			) {
				if (currentItem) items.push(currentItem.trim());
				const bulletText = line.slice(2);
				// If we have a subsection, include it with the first item
				if (currentSubsection && currentItem === "") {
					currentItem = `**${currentSubsection}**\n${bulletText}`;
					currentSubsection = ""; // Consumed
				} else {
					currentItem = bulletText;
				}
			}
			// Numbered items (1., 2., etc.) not indented
			else if (/^\d+\.\s/.test(line) && !line.startsWith("  ")) {
				if (currentItem) items.push(currentItem.trim());
				const numberedText = line.replace(/^\d+\.\s/, "");
				// If we have a subsection, include it with the first item
				if (currentSubsection && currentItem === "") {
					currentItem = `**${currentSubsection}**\n${numberedText}`;
					currentSubsection = ""; // Consumed
				} else {
					currentItem = numberedText;
				}
			}
			// Sub-items (indented bullets or numbered)
			else if (
				line.startsWith("  - ") ||
				line.startsWith("  * ") ||
				/^ {2}\d+\.\s/.test(line)
			) {
				if (currentItem) {
					currentItem += `\n${line.trim()}`;
				}
			}
			// Continuation lines (non-empty, not starting with special chars)
			else if (line.trim() && currentItem) {
				currentItem += `\n${line.trim()}`;
			}
		}

		if (currentItem) items.push(currentItem.trim());

		if (items.length > 0) {
			sections.push({ type, title: sectionTitle, items });
		}
	}

	return sections;
}

function getSectionIcon(type: string) {
	switch (type) {
		case "added":
			return <Plus className="w-4 h-4" />;
		case "changed":
			return <Wrench className="w-4 h-4" />;
		case "fixed":
			return <Bug className="w-4 h-4" />;
		default:
			return <GitCommit className="w-4 h-4" />;
	}
}

function getSectionColor(type: string) {
	switch (type) {
		case "added":
			return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
		case "changed":
			return "text-amber-400 bg-amber-400/10 border-amber-400/20";
		case "fixed":
			return "text-red-400 bg-red-400/10 border-red-400/20";
		case "technical":
			return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
		default:
			return "text-white/60 bg-white/5 border-white/10";
	}
}

function ReleaseSection({ section }: { section: ParsedSection }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="border border-white/5 rounded-lg overflow-hidden">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-white/2 hover:bg-white/4 transition-colors text-left"
			>
				<span
					className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-md border ${getSectionColor(section.type)}`}
				>
					{getSectionIcon(section.type)}
				</span>
				<span className="flex-1 font-medium text-white text-sm md:text-base truncate">
					{section.title}
				</span>
				<span className="text-xs text-white/40 mr-1 md:mr-2 shrink-0">
					{section.items.length}
				</span>
				{expanded ? (
					<ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
				) : (
					<ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
				)}
			</button>

			{expanded && (
				<div className="px-3 md:px-4 py-3 space-y-2 border-t border-white/5">
					{section.items.map((item) => (
						<div key={item} className="flex gap-2 md:gap-3 text-sm">
							<span className="w-1 h-1 rounded-full bg-white/30 mt-2 shrink-0" />
							<div className="text-white/70 wrap-break-word flex-1">
								{item.split("\n").map((line) => (
									<div
										key={line}
										className={
											line === item.split("\n")[0] ? "" : "ml-2 text-white/60"
										}
										dangerouslySetInnerHTML={{
											__html: line
												.replace(
													/\*\*(.*?)\*\*/g,
													'<strong class="text-white font-medium">$1</strong>',
												)
												.replace(
													/`(.*?)`/g,
													'<code class="px-1 py-0.5 bg-white/5 rounded text-xs font-mono break-all">$1</code>',
												),
										}}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function ReleaseCard({
	release,
	isLatest,
}: {
	release: GitHubRelease;
	isLatest: boolean;
}) {
	const _version = release.tag_name.replace(/^v/, "");
	const formattedDate = new Date(release.published_at).toLocaleDateString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);
	const sections = parseReleaseBody(release.body);
	const totalDownloads = release.assets.reduce(
		(sum, asset) => sum + asset.download_count,
		0,
	);

	return (
		<div className="relative">
			{/* Timeline line - hidden on mobile */}
			<div className="absolute left-6 top-14 bottom-0 w-px bg-white/10 hidden md:block" />

			<div className="relative flex flex-col md:flex-row gap-4 md:gap-6">
				{/* Timeline dot - smaller on mobile, hidden line */}
				<div
					className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${
						isLatest
							? "bg-emerald-500/20 border-2 border-emerald-500/50"
							: "bg-white/5 border border-white/10"
					}`}
				>
					<Tag
						className={`w-4 h-4 md:w-5 md:h-5 ${isLatest ? "text-emerald-400" : "text-white/50"}`}
					/>
				</div>

				{/* Content */}
				<div className="flex-1 pb-8 md:pb-12 min-w-0">
					{/* Version header */}
					<div className="flex items-center gap-2 md:gap-3 mb-2">
						<h2 className="text-xl md:text-2xl font-bold text-white">
							{release.tag_name}
						</h2>
						{isLatest && (
							<span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
								Latest
							</span>
						)}
						{release.prerelease && (
							<span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
								Pre-release
							</span>
						)}
					</div>

					{/* Meta info - stacked on mobile */}
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-sm text-white/40">
						<div className="flex items-center gap-1.5">
							<Calendar className="w-3.5 h-3.5" />
							{formattedDate}
						</div>
						{totalDownloads > 0 && (
							<div className="flex items-center gap-1.5">
								<Download className="w-3.5 h-3.5" />
								{totalDownloads.toLocaleString()} downloads
							</div>
						)}
						<a
							href={release.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1 hover:text-white transition-colors"
						>
							<ExternalLink className="w-3.5 h-3.5" />
							View on GitHub
						</a>
					</div>

					{/* Release name if different from tag */}
					{release.name && release.name !== release.tag_name && (
						<p className="text-white/60 mb-4">{release.name}</p>
					)}

					{sections.length > 0 ? (
						<div className="space-y-3">
							{sections.map((section) => (
								<ReleaseSection key={section.title} section={section} />
							))}
						</div>
					) : release.body ? (
						<div className="prose prose-invert prose-sm max-w-none">
							<div
								className="text-white/70 whitespace-pre-wrap"
								dangerouslySetInnerHTML={{
									__html: release.body
										.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
										.replace(
											/`(.*?)`/g,
											'<code class="px-1.5 py-0.5 bg-white/5 rounded text-xs">$1</code>',
										)
										.replace(/\n/g, "<br/>"),
								}}
							/>
						</div>
					) : (
						<p className="text-white/40 italic">No release notes provided.</p>
					)}

					{/* Download assets */}
					{release.assets.length > 0 && (
						<div className="mt-4 pt-4 border-t border-white/5">
							<p className="text-xs text-white/40 mb-2">Downloads</p>
							<div className="flex flex-wrap gap-2">
								{release.assets.map((asset) => (
									<a
										key={asset.name}
										href={asset.browser_download_url}
										className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors truncate max-w-full"
									>
										<Download className="w-3 h-3 shrink-0" />
										<span className="truncate">{asset.name}</span>
									</a>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/changelog")({
	component: ChangelogPage,
});

function ChangelogPage() {
	const [releases, setReleases] = useState<GitHubRelease[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const itemsPerPage = 10;
	const totalPages = Math.ceil(releases.length / itemsPerPage);
	const paginatedReleases = releases.slice(
		(page - 1) * itemsPerPage,
		page * itemsPerPage,
	);

	useEffect(() => {
		async function fetchReleases() {
			try {
				const response = await fetch(
					"https://api.github.com/repos/TryCadence/Cadence/releases",
					{
						headers: {
							Accept: "application/vnd.github.v3+json",
						},
					},
				);

				if (!response.ok) {
					throw new Error(`Failed to fetch releases: ${response.status}`);
				}

				const data: GitHubRelease[] = await response.json();
				// Filter out drafts
				setReleases(data.filter((r) => !r.draft));
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load releases",
				);
			} finally {
				setLoading(false);
			}
		}

		fetchReleases();
	}, []);

	return (
		<div className="min-h-screen bg-[#09090b] text-white">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full">
				<div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5" />
				<div className="relative max-w-4xl mx-auto px-4 md:px-6">
					<div className="flex items-center justify-between h-14">
						<Link to="/" className="flex items-center gap-2 group">
							<LogoIcon size={20} />
							<span className="font-semibold text-white">Cadence</span>
						</Link>
						<nav className="flex items-center gap-4">
							<Link
								to="/analysis"
								className="text-sm text-white/50 hover:text-white transition-colors"
							>
								Playground
							</Link>
							<Link
								to="/docs"
								className="text-sm text-white/50 hover:text-white transition-colors"
							>
								Docs
							</Link>
							<a
								href="https://x.com/NoSlopTech"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-white/50 hover:text-white transition-colors"
							>
								<SiX className="w-3.5 h-3.5" />
							</a>
							<a
								href="https://github.com/TryCadence/Cadence/releases"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
							>
								<SiGithub className="w-4 h-4" />
							</a>
						</nav>
					</div>
				</div>
			</header>

			{/* Hero */}
			<div className="relative border-b border-white/5">
				<div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Home
					</Link>

					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
						Changelog
					</h1>
					<p className="text-base md:text-lg text-white/60 max-w-2xl">
						All releases for Cadence, pulled directly from{" "}
						<a
							href="https://github.com/TryCadence/Cadence/releases"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/80 underline underline-offset-2 hover:text-white"
						>
							GitHub Releases
						</a>
						.
					</p>

					{/* Stats */}
					{!loading && !error && releases.length > 0 && (
						<div className="flex flex-wrap gap-6 mt-8">
							<div className="flex items-center gap-2 text-sm text-white/50">
								<div className="w-2 h-2 rounded-full bg-emerald-400" />
								<span className="text-white font-medium">
									{releases.length}
								</span>{" "}
								releases
							</div>
							<div className="flex items-center gap-2 text-sm text-white/50">
								<div className="w-2 h-2 rounded-full bg-emerald-400" />
								Latest:{" "}
								<span className="text-white font-medium">
									{releases[0]?.tag_name}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Releases */}
			<main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
				{loading && (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="w-8 h-8 text-white/50 animate-spin" />
					</div>
				)}

				{error && (
					<div className="text-center py-20">
						<p className="text-red-400 mb-4">{error}</p>
						<a
							href="https://github.com/TryCadence/Cadence/releases"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/60 hover:text-white underline"
						>
							View releases on GitHub instead
						</a>
					</div>
				)}

				{!loading && !error && releases.length === 0 && (
					<div className="text-center py-20">
						<p className="text-white/50">No releases found.</p>
					</div>
				)}

				{!loading && !error && releases.length > 0 && (
					<>
						<div className="space-y-0">
							{paginatedReleases.map((release, idx) => (
								<ReleaseCard
									key={release.id}
									release={release}
									isLatest={idx === 0 && page === 1}
								/>
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex flex-wrap items-center justify-center gap-2 mt-8 pt-8 border-t border-white/5">
								<button
									type="button"
									onClick={() => setPage(Math.max(1, page - 1))}
									disabled={page === 1}
									className="px-3 py-1.5 text-sm rounded-md border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									Previous
								</button>

								{Array.from({ length: totalPages }, (_, i) => i + 1).map(
									(p) => (
										<button
											type="button"
											key={p}
											onClick={() => setPage(p)}
											className={`w-8 h-8 text-sm rounded-md border transition-colors ${
												p === page
													? "border-white/20 bg-white/10 text-white font-medium"
													: "border-white/10 text-white/60 hover:bg-white/5"
											}`}
										>
											{p}
										</button>
									),
								)}

								<button
									type="button"
									onClick={() => setPage(Math.min(totalPages, page + 1))}
									disabled={page === totalPages}
									className="px-3 py-1.5 text-sm rounded-md border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									Next
								</button>
							</div>
						)}
					</>
				)}

				{/* End of timeline - only show on last page */}
				{!loading && !error && releases.length > 0 && page === totalPages && (
					<div className="flex items-center gap-4 mt-8 md:pl-6">
						<div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
							<GitCommit className="w-4 h-4 md:w-5 md:h-5 text-white/30" />
						</div>
						<div className="min-w-0">
							<p className="text-white/60">The beginning of Cadence</p>
							<p className="text-sm text-white/40">
								First release: {releases[releases.length - 1]?.tag_name}
							</p>
						</div>
					</div>
				)}
			</main>

			<Footer />
		</div>
	);
}
