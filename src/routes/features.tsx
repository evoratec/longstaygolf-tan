import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Activity,
	ArrowLeft,
	Bot,
	Check,
	ChevronRight,
	Code2,
	FileSearch,
	GitBranch,
	Globe,
	Layers,
	Settings,
	Shield,
	Terminal,
	Webhook,
	Zap,
} from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { useState } from "react";
import { LogoIcon } from "../components/Logo";
import { Footer } from "../components/landing/Footer";
import { useVersion } from "../lib/useVersion";

const coreFeatures = [
	{
		icon: GitBranch,
		title: "Git Repository Analysis",
		description:
			"Deep analysis of Git commit history to detect patterns indicative of AI-generated code. Examines velocity, timing, commit messages, and structural patterns.",
		highlights: [
			"Commit velocity tracking",
			"Timing anomaly detection",
			"Message pattern analysis",
			"Author behavior profiling",
		],
	},
	{
		icon: Globe,
		title: "Web Content Detection",
		description:
			"Analyze web pages and text content for AI-generated patterns. Detects overused phrases, generic language, and formatting anomalies.",
		highlights: [
			"Phrase pattern detection",
			"Grammar consistency analysis",
			"Sentence structure scoring",
			"Content quality metrics",
		],
	},
	{
		icon: Shield,
		title: "38 Detection Strategies",
		description:
			"Comprehensive detection combining 18 Git-focused and 20 web-focused strategies for thorough analysis.",
		highlights: [
			"Velocity & size analysis",
			"Timing & burst patterns",
			"Structural consistency",
			"Statistical anomalies",
		],
	},
	{
		icon: Zap,
		title: "High Performance",
		description:
			"Built in Go for blazing fast analysis. Handle large repositories and high-volume web content without breaking a sweat.",
		highlights: [
			"Written in Go 1.24",
			"Concurrent processing",
			"Efficient memory usage",
			"Handles 100k+ commits",
		],
	},
];

const technicalFeatures = [
	{
		icon: Terminal,
		title: "Powerful CLI",
		description:
			"Full-featured command-line interface with intuitive commands for Git analysis, web scanning, and report generation.",
		command: "cadence analyze ./repo --format json",
	},
	{
		icon: Webhook,
		title: "Webhook Server",
		description:
			"Deploy as a webhook server for continuous monitoring. Integrates with GitHub, GitLab, and other platforms.",
		command: "cadence webhook --port 8080",
	},
	{
		icon: FileSearch,
		title: "Multiple Output Formats",
		description:
			"Generate reports in JSON for automation or human-readable text format with detailed reasoning.",
		command: "cadence analyze ./repo -o report.json",
	},
	{
		icon: Bot,
		title: "AI Enhancement (Optional)",
		description:
			"Integrate with OpenAI for enhanced analysis. Get detailed reasoning about why content may be AI-generated.",
		command: "cadence analyze ./repo --ai",
	},
];

const gitStrategies = [
	{ name: "Velocity Analysis", desc: "Lines added/removed per minute" },
	{ name: "Size Analysis", desc: "Suspicious commit sizes" },
	{ name: "Timing Patterns", desc: "Rapid successive commits" },
	{ name: "Merge Commit Detection", desc: "Suspicious merge patterns" },
	{ name: "File Dispersion", desc: "Excessive files per commit" },
	{ name: "Ratio Analysis", desc: "Addition/deletion ratios" },
	{ name: "Precision Analysis", desc: "Code structure consistency" },
	{ name: "Commit Messages", desc: "AI-like message patterns" },
	{ name: "Naming Patterns", desc: "Variable/function naming style" },
	{ name: "Structural Consistency", desc: "Code organization patterns" },
	{ name: "Burst Patterns", desc: "Rapid commit sequences" },
	{ name: "Error Handling", desc: "Exception pattern analysis" },
	{ name: "Template Patterns", desc: "Boilerplate code detection" },
	{ name: "File Extensions", desc: "File type modification patterns" },
	{ name: "Statistical Anomalies", desc: "Outlier detection in metrics" },
	{ name: "Timing Anomalies", desc: "Unusual time patterns" },
	{ name: "Emoji Usage", desc: "Excessive or unusual emoji patterns" },
	{
		name: "Special Characters",
		desc: "Overused hyphens, dashes, unusual punctuation",
	},
];

const webStrategies = [
	{ name: "Overused Phrases", desc: '"in today\'s world", "furthermore"' },
	{ name: "Generic Language", desc: '"enhance", "empower", "streamline"' },
	{ name: "Excessive Structure", desc: "Rigid formatting patterns" },
	{ name: "Perfect Grammar", desc: "Unnaturally perfect construction" },
	{ name: "Boilerplate Text", desc: "Template-like content" },
	{ name: "Repetitive Patterns", desc: "Repeated sentence structures" },
	{ name: "Missing Nuance", desc: "Lack of specific details" },
	{ name: "Excessive Transitions", desc: "Too many connector words" },
	{ name: "Uniform Sentences", desc: "Consistent sentence length" },
	{ name: "AI Vocabulary", desc: "Characteristic AI word choices" },
	{ name: "Emoji Overuse", desc: "Excessive or misplaced emojis" },
	{
		name: "Special Characters",
		desc: "Unusual special character usage patterns",
	},
	{
		name: "Missing Alt Text",
		desc: "Images without accessibility descriptions",
	},
	{ name: "Semantic HTML", desc: "Divs instead of semantic tags" },
	{
		name: "Accessibility Markers",
		desc: "Missing aria-labels, roles, lang attributes",
	},
	{ name: "Heading Hierarchy", desc: "Non-sequential heading levels" },
	{
		name: "Hardcoded Values",
		desc: "Fixed pixels, colors instead of variables",
	},
	{ name: "Form Issues", desc: "Missing labels, improper input types" },
	{ name: "Generic Link Text", desc: '"Click here", "Read more" patterns' },
	{ name: "Generic Styling", desc: "Default colors, no custom theming" },
];

function DetectionStrategiesSection() {
	const [activeTab, setActiveTab] = useState<"git" | "web">("git");
	const strategies = activeTab === "git" ? gitStrategies : webStrategies;

	return (
		<section className="py-16 px-4 md:px-6 border-b border-white/5">
			<div className="max-w-5xl mx-auto">
				<div className="text-center mb-8">
					<h2 className="text-2xl md:text-3xl font-bold mb-2">
						38 Detection Strategies
					</h2>
					<p className="text-white/50">
						Comprehensive pattern analysis for Git repositories and web content
					</p>
				</div>

				{/* Tab Buttons */}
				<div className="flex justify-center gap-2 mb-8">
					<button
						type="button"
						onClick={() => setActiveTab("git")}
						className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
							activeTab === "git"
								? "bg-white/10 text-white border border-white/20"
								: "bg-white/2 text-white/50 border border-white/5 hover:bg-white/5 hover:text-white/70"
						}`}
					>
						<GitBranch className="w-4 h-4" />
						Git Repository
						<span className="px-1.5 py-0.5 rounded bg-white/10 text-xs">
							{gitStrategies.length}
						</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("web")}
						className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
							activeTab === "web"
								? "bg-white/10 text-white border border-white/20"
								: "bg-white/2 text-white/50 border border-white/5 hover:bg-white/5 hover:text-white/70"
						}`}
					>
						<Globe className="w-4 h-4" />
						Web Content
						<span className="px-1.5 py-0.5 rounded bg-white/10 text-xs">
							{webStrategies.length}
						</span>
					</button>
				</div>

				{/* Strategies Grid */}
				<div className="rounded-xl bg-white/2 border border-white/5 p-8">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{strategies.map((strategy) => (
							<div key={strategy.name} className="space-y-1">
								<div className="text-sm font-medium text-white/90">
									{strategy.name}
								</div>
								<div className="text-xs text-white/40">{strategy.desc}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

const integrations = [
	{
		icon: Layers,
		title: "Agent Skills",
		description:
			"Use Cadence as an AI agent tool with the included skills.json manifest.",
	},
	{
		icon: Activity,
		title: "CI/CD Integration",
		description:
			"Add to your pipeline for automated AI content detection on every push.",
	},
	{
		icon: Settings,
		title: "Configurable Thresholds",
		description:
			"Fine-tune detection sensitivity with customizable threshold settings.",
	},
	{
		icon: Code2,
		title: "JSON API",
		description:
			"Programmatic access with structured JSON output for automation.",
	},
];

export const Route = createFileRoute("/features")({
	component: FeaturesPage,
});

function FeaturesPage() {
	const { version } = useVersion();

	return (
		<div className="min-h-screen bg-[#09090b] text-white">
			{/* Header */}
			<header className="sticky top-0 z-50 w-full">
				<div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5" />
				<div className="relative max-w-5xl mx-auto px-4 md:px-6">
					<div className="flex items-center justify-between h-14">
						<Link to="/" className="flex items-center gap-2 group">
							<LogoIcon size={20} />
							<span className="font-semibold text-white">Cadence</span>
							<span className="text-xs text-white/30">{version}</span>
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
								href="https://github.com/TryCadence/Cadence"
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
				<div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Home
					</Link>

					<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
						Features
					</h1>
					<p className="text-base md:text-lg text-white/60 max-w-2xl">
						Everything you need to detect AI-generated content in code and text.
						Built for performance, designed for accuracy.
					</p>
				</div>
			</div>

			{/* Core Features */}
			<section className="py-16 px-4 md:px-6 border-b border-white/5">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-2xl md:text-3xl font-bold mb-8">
						Core Capabilities
					</h2>
					<div className="grid md:grid-cols-2 gap-6">
						{coreFeatures.map((feature) => {
							const Icon = feature.icon;
							return (
								<div
									key={feature.title}
									className="rounded-xl bg-white/2 border border-white/5 p-6 hover:bg-white/3 hover:border-white/10 transition-all"
								>
									<div className="inline-flex p-2.5 rounded-lg bg-white/5 border border-white/10 mb-4">
										<Icon className="w-5 h-5 text-white/70" />
									</div>
									<h3 className="text-lg font-semibold text-white mb-2">
										{feature.title}
									</h3>
									<p className="text-sm text-white/50 mb-4 leading-relaxed">
										{feature.description}
									</p>
									<ul className="space-y-1.5">
										{feature.highlights.map((highlight) => (
											<li
												key={highlight}
												className="flex items-center gap-2 text-sm text-white/60"
											>
												<Check className="w-3.5 h-3.5 text-emerald-400" />
												{highlight}
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Technical Features */}
			<section className="py-16 px-4 md:px-6 border-b border-white/5">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-2xl md:text-3xl font-bold mb-8">
						Technical Features
					</h2>
					<div className="grid md:grid-cols-2 gap-6">
						{technicalFeatures.map((feature) => {
							const Icon = feature.icon;
							return (
								<div
									key={feature.title}
									className="rounded-xl bg-white/2 border border-white/5 p-6"
								>
									<div className="flex items-start gap-4 mb-4">
										<div className="p-2 rounded-lg bg-white/5 border border-white/10">
											<Icon className="w-5 h-5 text-white/70" />
										</div>
										<div>
											<h3 className="font-semibold text-white mb-1">
												{feature.title}
											</h3>
											<p className="text-sm text-white/50">
												{feature.description}
											</p>
										</div>
									</div>
									<div className="px-3 py-2 rounded-lg bg-[#0a0a0c] border border-white/5 font-mono text-sm text-white/70">
										$ {feature.command}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Detection Strategies */}
			<DetectionStrategiesSection />

			{/* Integrations */}
			<section className="py-16 px-4 md:px-6 border-b border-white/5">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-2xl md:text-3xl font-bold mb-8">
						Integrations & Automation
					</h2>
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{integrations.map((item) => {
							const Icon = item.icon;
							return (
								<div
									key={item.title}
									className="rounded-lg bg-white/2 border border-white/5 p-5 hover:bg-white/3 transition-colors"
								>
									<Icon className="w-5 h-5 text-white/50 mb-3" />
									<h3 className="font-medium text-white mb-1">{item.title}</h3>
									<p className="text-xs text-white/40">{item.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-16 px-4 md:px-6">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-2xl md:text-3xl font-bold mb-4">
						Ready to get started?
					</h2>
					<p className="text-white/50 mb-8">
						Install Cadence in minutes and start detecting AI-generated content.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link
							to="/docs/getting-started/installation"
							className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
						>
							Get Started
							<ChevronRight className="w-4 h-4" />
						</Link>
						<Link
							to="/examples"
							className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
						>
							View Examples
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
