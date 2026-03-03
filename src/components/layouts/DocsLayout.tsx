import { Fragment, useEffect, useMemo, useState } from "react";
import {
	VscChevronDown,
	VscChevronRight,
	VscHome,
	VscMenu,
	VscClose,
	VscSearch,
	VscListTree,
	VscRocket,
	VscTerminal,
	VscGraphLine,
	VscExtensions,
	VscPlug,
	VscBook,
	VscOrganization,
	VscBeaker,
	VscArrowLeft,
	VscArrowRight,
	VscSymbolMisc,
} from "react-icons/vsc";
import { SiGithub, SiX } from "react-icons/si";
import {
	findBreadcrumbTrail,
	navSections,
	type NavSection,
} from "../../lib/docs";
import { useVersion } from "../../lib/useVersion";
import { LogoIcon } from "../Logo";
import { Button } from "../ui/Button";

// ── Per-section icon map ─────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ReactNode> = {
	"getting-started": <VscRocket className="w-4 h-4" />,
	cli: <VscTerminal className="w-4 h-4" />,
	analysis: <VscGraphLine className="w-4 h-4" />,
	integrations: <VscExtensions className="w-4 h-4" />,
	plugins: <VscPlug className="w-4 h-4" />,
	reference: <VscBook className="w-4 h-4" />,
	community: <VscOrganization className="w-4 h-4" />,
};

function getSectionIcon(slug: string, size?: "sm" | "md") {
	const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
	const topLevel = slug.split("/")[0];
	const icon = SECTION_ICONS[topLevel];
	if (icon) return icon;
	return <VscSymbolMisc className={cls} />;
}

// ── Flatten all pages for Prev/Next navigation ──────────────────────────────

interface FlatPage {
	href: string;
	label: string;
	sectionTitle: string;
}

function flattenSection(section: NavSection): FlatPage[] {
	const pages: FlatPage[] = section.links.map((link) => ({
		href: link.href,
		label: link.label,
		sectionTitle: section.title,
	}));
	for (const sub of section.subsections) {
		pages.push(...flattenSection(sub));
	}
	return pages;
}

function flattenAllPages(): FlatPage[] {
	const pages: FlatPage[] = [];
	for (const section of navSections) {
		pages.push(...flattenSection(section));
	}
	return pages;
}

interface LayoutProps {
	children: React.ReactNode;
	title: string;
	description: string;
	content?: string;
	slug?: string;
}

interface TocItem {
	id: string;
	text: string;
	level: number;
}

function extractToc(content: string): TocItem[] {
	if (!content) return [];
	const lines = content.split("\n");
	const toc: TocItem[] = [];

	for (const line of lines) {
		const match = line.match(/^(#{2,4})\s+(.+)$/);
		if (match) {
			const level = match[1].length;
			const text = match[2].replace(/\*\*/g, "").replace(/`/g, "");
			const id = text
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");
			toc.push({ id, text, level });
		}
	}

	return toc;
}

function getCurrentSection(slug?: string): NavSection {
	if (!slug) return navSections[0];
	// Extract section from slug (e.g., "getting-started/installation" -> "getting-started")
	const sectionSlug = slug.split("/")[0];
	const section = navSections.find((s) => s.slug === sectionSlug);
	return section || navSections[0];
}

export function DocsLayout({
	children,
	title,
	description,
	content,
	slug,
}: LayoutProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
	const [activeId, setActiveId] = useState<string>("");
	const { version } = useVersion();
	const toc = extractToc(content || "");
	const currentSection = getCurrentSection(slug);

	// Compute prev/next pages
	const allPages = useMemo(() => flattenAllPages(), []);
	const currentIndex = slug
		? allPages.findIndex((p) => p.href === `/docs/${slug}`)
		: -1;
	const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
	const nextPage =
		currentIndex >= 0 && currentIndex < allPages.length - 1
			? allPages[currentIndex + 1]
			: null;

	useEffect(() => {
		if (typeof window === "undefined" || toc.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{ rootMargin: "-80px 0px -80% 0px" },
		);

		for (const item of toc) {
			const element = document.getElementById(item.id);
			if (element) observer.observe(element);
		}

		return () => observer.disconnect();
	}, [toc]);

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		if (typeof document === "undefined") return;
		if (mobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileMenuOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest("[data-section-dropdown]")) {
				setSectionDropdownOpen(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	return (
		<div className="min-h-screen bg-[#09090b] text-white">
			{/* Header */}
			<header className="sticky top-0 z-40 border-b border-white/5 bg-[#09090b]/95 backdrop-blur-md">
				<div className="flex items-center justify-between h-14 px-4 lg:px-6">
					<div className="flex items-center gap-4">
						<a
							href="/"
							className="flex items-center gap-2 hover:opacity-80 transition-opacity"
						>
							<LogoIcon size={22} />
							<span className="font-semibold">Cadence</span>
							<span className="text-xs text-white/30">{version}</span>
						</a>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="secondary"
							size="sm"
							asChild
							className="hidden sm:inline-flex items-center gap-1.5"
						>
							<a href="/analysis">
								<VscBeaker className="w-3.5 h-3.5" />
								Playground
							</a>
						</Button>
						<Button
							variant="secondary"
							size="sm"
							asChild
							className="hidden sm:inline-flex items-center gap-1.5"
						>
							<a
								href="https://x.com/NoSlopTech"
								target="_blank"
								rel="noopener noreferrer"
							>
								<SiX className="w-3 h-3" />
								<span className="hidden md:inline">Twitter/X</span>
							</a>
						</Button>
						<Button
							variant="secondary"
							size="sm"
							asChild
							className="hidden sm:inline-flex items-center gap-1.5"
						>
							<a
								href="https://github.com/TryCadence/Cadence"
								target="_blank"
								rel="noopener noreferrer"
							>
								<SiGithub className="w-3.5 h-3.5" />
								<span className="hidden md:inline">GitHub</span>
							</a>
						</Button>
						<button
							type="button"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? (
								<VscClose className="w-5 h-5" />
							) : (
								<VscMenu className="w-5 h-5" />
							)}
						</button>
					</div>
				</div>
			</header>

			{/* Mobile Navigation Overlay */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-30 lg:hidden">
					<button
						type="button"
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setMobileMenuOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") setMobileMenuOpen(false);
						}}
					/>
					<nav className="absolute left-0 top-14.25 bottom-0 w-[min(80vw,320px)] bg-[#09090b] border-r border-white/10 overflow-y-auto">
						<div className="p-4">
							<MobileSectionSelector
								currentSection={currentSection}
								currentSlug={slug}
								onClose={() => setMobileMenuOpen(false)}
							/>
						</div>
					</nav>
				</div>
			)}

			<div className="flex">
				{/* Left Sidebar - Desktop */}
				<aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-white/5">
					<div data-docs-sidebar className="sticky top-14.25 h-[calc(100dvh-57px)] overflow-y-auto overscroll-contain">
						{/* Section Selector Dropdown */}
						<div className="p-4 border-b border-white/5" data-section-dropdown>
							<button
								type="button"
								onClick={() => setSectionDropdownOpen(!sectionDropdownOpen)}
								className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 transition-colors"
							>
								<span className="text-emerald-400/80">
									{getSectionIcon(currentSection.slug)}
								</span>
								<div className="flex-1 text-left min-w-0">
									<div className="text-sm font-medium text-white truncate">
										{currentSection.title}
									</div>
									<div className="text-xs text-white/50 truncate">
										{currentSection.description}
									</div>
								</div>
								<VscChevronDown
									className={`w-4 h-4 text-white/50 transition-transform ${
										sectionDropdownOpen ? "rotate-180" : ""
									}`}
								/>
							</button>

							{/* Section Dropdown Menu */}
							{sectionDropdownOpen && (
								<div className="absolute left-4 right-4 mt-2 bg-[#0f0f11] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
									{navSections.map((section) => (
										<a
											key={section.slug}
											href={`/docs/${section.slug}`}
											className={`flex items-center gap-3 p-3 hover:bg-white/5 transition-colors ${
												section.slug === currentSection.slug
													? "bg-emerald-400/10"
													: ""
											}`}
										>
											<span
												className={
													section.slug === currentSection.slug
														? "text-emerald-400"
														: "text-white/50"
												}
											>
												{getSectionIcon(section.slug)}
											</span>
											<div className="flex-1 min-w-0">
												<div
													className={`text-sm font-medium truncate ${
														section.slug === currentSection.slug
															? "text-emerald-400"
															: "text-white"
													}`}
												>
													{section.title}
												</div>
												<div className="text-xs text-white/50 truncate">
													{section.description}
												</div>
											</div>
										</a>
									))}
								</div>
							)}
						</div>

						{/* Search (placeholder) */}
						<div className="px-4 py-3 border-b border-white/5">
							<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 text-sm cursor-not-allowed">
								<VscSearch className="w-4 h-4" />
								<span>Search docs...</span>
								<span className="ml-auto text-xs bg-white/10 px-1.5 py-0.5 rounded font-mono">
									⌘K
								</span>
							</div>
						</div>

						{/* Page Links for Current Section */}
						<nav className="p-4 pb-8">
							<NavTree
								section={currentSection}
								currentSlug={slug}
								depth={0}
							/>
						</nav>
					</div>
				</aside>

				{/* Main Content Area */}
				<main className="flex-1 min-w-0">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
						{/* Breadcrumb */}
						<Breadcrumb title={title} currentSlug={slug} />
						{/* Title and Description */}
						<div className="mb-8 lg:mb-12">
							<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
								{title}
							</h1>
							<p className="text-lg text-white/60 leading-relaxed">
								{description}
							</p>
						</div>

						{/* Content */}
						<div className="prose prose-invert max-w-none">{children}</div>

						{/* Navigation Footer */}
						<div className="mt-16 pt-8 border-t border-white/10">
							<div className="flex items-stretch gap-4">
								{prevPage ? (
									<a
										href={prevPage.href}
										className="flex-1 group flex flex-col items-start gap-1 p-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/3 transition-colors"
									>
										<span className="text-xs text-white/40 flex items-center gap-1">
											<VscArrowLeft className="w-3 h-3" />
											Previous
										</span>
										<span className="text-sm font-medium text-white/80 group-hover:text-emerald-400 transition-colors">
											{prevPage.label}
										</span>
										<span className="text-xs text-white/30">{prevPage.sectionTitle}</span>
									</a>
								) : (
									<a
										href="/"
										className="flex-1 group flex flex-col items-start gap-1 p-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/3 transition-colors"
									>
										<span className="text-xs text-white/40 flex items-center gap-1">
											<VscArrowLeft className="w-3 h-3" />
											Back
										</span>
										<span className="text-sm font-medium text-white/80 group-hover:text-emerald-400 transition-colors">
											Home
										</span>
									</a>
								)}
								{nextPage && (
									<a
										href={nextPage.href}
										className="flex-1 group flex flex-col items-end gap-1 p-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/3 transition-colors text-right"
									>
										<span className="text-xs text-white/40 flex items-center gap-1">
											Next
											<VscArrowRight className="w-3 h-3" />
										</span>
										<span className="text-sm font-medium text-white/80 group-hover:text-emerald-400 transition-colors">
											{nextPage.label}
										</span>
										<span className="text-xs text-white/30">{nextPage.sectionTitle}</span>
									</a>
								)}
							</div>
						</div>
					</div>
				</main>

				{/* Right Sidebar - Table of Contents */}
				{toc.length > 0 && (
					<aside className="hidden xl:block w-64 shrink-0 border-l border-white/5">
						<div data-docs-sidebar className="sticky top-14.25 h-[calc(100dvh-57px)] overflow-y-auto overscroll-contain p-4">
							<div className="flex items-center gap-2 mb-4 text-sm font-medium text-white/80">
								<VscListTree className="w-4 h-4 text-emerald-400/60" />
								On this page
							</div>
							<nav className="space-y-0.5">
								{toc.map((item) => (
									<a
										key={item.id}
										href={`#${item.id}`}
										className={`block text-[13px] py-1.5 transition-colors rounded-sm ${
											item.level === 3
												? "pl-4"
												: item.level === 4
													? "pl-7"
													: ""
										} ${
											activeId === item.id
												? "text-emerald-400 font-medium bg-emerald-400/5 pl-3 border-l-2 border-emerald-400/50"
												: "text-white/45 hover:text-white/75"
										}`}
									>
										{item.text}
									</a>
								))}
							</nav>
						</div>
					</aside>
				)}
			</div>
		</div>
	);
}

function PageLink({
	href,
	label,
	currentSlug,
	onClick,
}: {
	href: string;
	label: string;
	currentSlug?: string;
	onClick?: () => void;
}) {
	const isActive = currentSlug && href === `/docs/${currentSlug}`;

	return (
		<a
			href={href}
			onClick={onClick}
			className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
				isActive
					? "text-emerald-400 bg-emerald-400/10 font-medium"
					: "text-white/60 hover:text-white hover:bg-white/5"
			}`}
		>
			{label}
		</a>
	);
}

function NavTree({
	section,
	currentSlug,
	depth = 0,
	onLinkClick,
}: {
	section: NavSection;
	currentSlug?: string;
	depth?: number;
	onLinkClick?: () => void;
}) {
	const isWithin =
		currentSlug != null &&
		(currentSlug === section.slug ||
			currentSlug.startsWith(section.slug + "/"));
	const [expanded, setExpanded] = useState(isWithin);

	// Auto-expand when navigating into this subsection
	useEffect(() => {
		if (isWithin) setExpanded(true);
	}, [isWithin]);

	// Depth 0 is the top-level section — always visible, no collapse header
	if (depth === 0) {
		return (
			<div className="space-y-0.5">
				{section.links.map((link) => (
					<PageLink
						key={link.href}
						href={link.href}
						label={link.label}
						currentSlug={currentSlug}
						onClick={onLinkClick}
					/>
				))}
				{section.subsections.map((sub) => (
					<NavTree
						key={sub.slug}
						section={sub}
						currentSlug={currentSlug}
						depth={depth + 1}
						onLinkClick={onLinkClick}
					/>
				))}
			</div>
		);
	}

	return (
		<div className="mt-2">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className={`flex items-center gap-1.5 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
					isWithin
						? "text-emerald-400/80"
						: "text-white/40 hover:text-white/60"
				}`}
			>
				<VscChevronRight
					className={`w-3 h-3 shrink-0 transition-transform ${
						expanded ? "rotate-90" : ""
					}`}
				/>
				{section.title}
			</button>
			{expanded && (
				<div className="ml-2 pl-2 border-l border-white/10 space-y-0.5">
					{section.links.map((link) => (
						<PageLink
							key={link.href}
							href={link.href}
							label={link.label}
							currentSlug={currentSlug}
							onClick={onLinkClick}
						/>
					))}
					{section.subsections.map((sub) => (
						<NavTree
							key={sub.slug}
							section={sub}
							currentSlug={currentSlug}
							depth={depth + 1}
							onLinkClick={onLinkClick}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function Breadcrumb({
	title,
	currentSlug,
}: {
	title: string;
	currentSlug?: string;
}) {
	const trail = currentSlug
		? findBreadcrumbTrail(navSections, currentSlug)
		: [];
	const lastSection = trail[trail.length - 1];
	const isOverview = currentSlug != null && lastSection?.slug === currentSlug;

	return (
		<div className="flex items-center gap-2 mb-6 text-sm text-white/50 flex-wrap">
			<a
				href="/docs"
				className="hover:text-white transition-colors flex items-center gap-1.5"
			>
				<VscHome className="w-4 h-4" />
				<span>Docs</span>
			</a>
			{trail.map((section) => (
				<Fragment key={section.slug}>
					<span className="text-white/30">/</span>
					<a
						href={`/docs/${section.slug}`}
						className="hover:text-white transition-colors"
					>
						{section.title}
					</a>
				</Fragment>
			))}
			{!isOverview && (
				<>
					<span className="text-white/30">/</span>
					<span className="text-white/70">{title}</span>
				</>
			)}
		</div>
	);
}

function MobileSectionSelector({
	currentSection,
	onClose,
	currentSlug,
}: {
	currentSection: NavSection;
	onClose: () => void;
	currentSlug?: string;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="space-y-4">
			{/* Section Selector */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
			>
				<span className="text-emerald-400/80">
					{getSectionIcon(currentSection.slug)}
				</span>
				<div className="flex-1 text-left">
					<div className="text-sm font-medium text-white">
						{currentSection.title}
					</div>
					<div className="text-xs text-white/50">
						{currentSection.description}
					</div>
				</div>
				<VscChevronDown
					className={`w-4 h-4 text-white/50 transition-transform ${
						isExpanded ? "rotate-180" : ""
					}`}
				/>
			</button>

			{/* Expanded Section List */}
			{isExpanded && (
				<div className="space-y-1 pb-4 border-b border-white/10">
					{navSections.map((section) => (
						<a
							key={section.slug}
							href={`/docs/${section.slug}`}
							onClick={onClose}
							className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
								section.slug === currentSection.slug
									? "bg-emerald-400/10"
									: "hover:bg-white/5"
							}`}
						>
							<span
								className={
									section.slug === currentSection.slug
										? "text-emerald-400"
										: "text-white/50"
								}
							>
								{getSectionIcon(section.slug)}
							</span>
							<div className="flex-1">
								<div
									className={`text-sm font-medium ${
										section.slug === currentSection.slug
											? "text-emerald-400"
											: "text-white"
									}`}
								>
									{section.title}
								</div>
								<div className="text-xs text-white/50">
									{section.description}
								</div>
							</div>
						</a>
					))}
				</div>
			)}

			{/* Page Links */}
			<nav className="space-y-0.5">
				<NavTree
					section={currentSection}
					currentSlug={currentSlug}
					depth={0}
					onLinkClick={onClose}
				/>
			</nav>
		</div>
	);
}
