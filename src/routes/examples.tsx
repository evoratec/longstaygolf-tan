import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	ChevronRight,
	Clock,
	FileJson,
	GitBranch,
	Globe,
	Users,
	Zap,
} from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { LogoIcon } from "../components/Logo";
import { Footer } from "../components/landing/Footer";
import { useVersion } from "../lib/useVersion";

const gitExamples = [
	{
		title: "High Velocity Commits",
		repo: "example/frontend-app",
		score: 87,
		assessment: "Likely AI-Generated",
		description:
			"Repository showing extremely high commit velocity with 2,400+ lines added in under 2 minutes.",
		metrics: {
			commits: 47,
			velocity: "750 additions/min",
			timeSpan: "3 hours",
			authors: 1,
		},
		patterns: [
			{
				name: "Velocity Anomaly",
				severity: "high",
				detail: "750+ additions/min",
			},
			{
				name: "Burst Pattern",
				severity: "high",
				detail: "12 commits in 45 seconds",
			},
			{
				name: "Template Patterns",
				severity: "medium",
				detail: "Repetitive structure detected",
			},
			{
				name: "Perfect Formatting",
				severity: "medium",
				detail: "100% consistent style",
			},
		],
	},
	{
		title: "Suspicious Timing Patterns",
		repo: "example/api-service",
		score: 64,
		assessment: "Suspicious Activity",
		description:
			"Multiple commits with unnaturally consistent timing intervals suggesting automated generation.",
		metrics: {
			commits: 156,
			velocity: "45 additions/min",
			timeSpan: "2 days",
			authors: 2,
		},
		patterns: [
			{
				name: "Timing Anomaly",
				severity: "high",
				detail: "Exactly 60s between commits",
			},
			{
				name: "Message Patterns",
				severity: "medium",
				detail: "Generic commit messages",
			},
			{
				name: "Size Analysis",
				severity: "low",
				detail: "Consistent 200-line commits",
			},
		],
	},
	{
		title: "Clean Human Repository",
		repo: "example/cli-tool",
		score: 12,
		assessment: "Likely Human-Written",
		description:
			"Natural commit patterns with varied timing, reasonable velocities, and organic development flow.",
		metrics: {
			commits: 342,
			velocity: "15 additions/min",
			timeSpan: "6 months",
			authors: 4,
		},
		patterns: [
			{
				name: "Natural Velocity",
				severity: "none",
				detail: "Human-typical pace",
			},
			{ name: "Varied Timing", severity: "none", detail: "Organic intervals" },
		],
	},
];

const webExamples = [
	{
		title: "Marketing Landing Page",
		url: "example.com/solutions",
		score: 82,
		assessment: "Likely AI-Generated",
		description:
			"Corporate landing page with excessive buzzwords, perfect grammar, and generic language patterns.",
		stats: {
			words: 850,
			sentences: 42,
			avgLength: "20.2 words",
		},
		patterns: [
			{
				name: "Generic Language",
				severity: "high",
				detail: '"leverage", "synergy", "empower" (15 instances)',
			},
			{
				name: "Perfect Grammar",
				severity: "high",
				detail: "98% perfect sentence structure",
			},
			{
				name: "Overused Phrases",
				severity: "medium",
				detail: '"in today\'s digital landscape" (3x)',
			},
			{
				name: "Uniform Sentences",
				severity: "medium",
				detail: "Very low variance in length",
			},
		],
	},
	{
		title: "Technical Blog Post",
		url: "example.com/blog/react-hooks",
		score: 45,
		assessment: "Possibly AI-Assisted",
		description:
			"Technical tutorial with some AI-like patterns but also includes specific code examples and personal insights.",
		stats: {
			words: 1240,
			sentences: 68,
			avgLength: "18.2 words",
		},
		patterns: [
			{
				name: "Generic Transitions",
				severity: "medium",
				detail: '"Furthermore", "Additionally" overused',
			},
			{
				name: "Missing Nuance",
				severity: "low",
				detail: "Some sections lack specific details",
			},
		],
	},
	{
		title: "Personal Developer Blog",
		url: "example.com/devlog",
		score: 8,
		assessment: "Likely Human-Written",
		description:
			"Personal blog with natural voice, varied sentence structure, and authentic imperfections.",
		stats: {
			words: 720,
			sentences: 45,
			avgLength: "16 words",
		},
		patterns: [
			{
				name: "Natural Voice",
				severity: "none",
				detail: "Authentic writing style",
			},
			{
				name: "Varied Structure",
				severity: "none",
				detail: "Organic paragraph flow",
			},
		],
	},
];

const jsonExample = `{
  "url": "https://example.com/article",
  "title": "Understanding Modern Development",
  "status_code": 200,
  "analyzed_at": "2026-01-30T10:15:00Z",
  "content_stats": {
    "word_count": 850,
    "character_count": 5420,
    "heading_count": 8,
    "quality_score": 0.72
  },
  "analysis": {
    "confidence_score": 78,
    "suspicion_rate": 0.82,
    "pattern_count": 4,
    "assessment": "LIKELY AI-GENERATED"
  },
  "flagged_items": [
    {
      "pattern_type": "generic_language",
      "severity": 1.0,
      "description": "Excessive use of generic business language",
      "examples": ["leverage", "synergy", "empower"]
    },
    {
      "pattern_type": "perfect_grammar",
      "severity": 0.85,
      "description": "Suspiciously consistent sentence structure"
    }
  ]
}`;

function getSeverityColor(severity: string) {
	switch (severity) {
		case "high":
			return "text-red-400 bg-red-400/10 border-red-400/20";
		case "medium":
			return "text-amber-400 bg-amber-400/10 border-amber-400/20";
		case "low":
			return "text-blue-400 bg-blue-400/10 border-blue-400/20";
		default:
			return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
	}
}

function getScoreColor(score: number) {
	if (score >= 70) return "text-red-400";
	if (score >= 40) return "text-amber-400";
	return "text-emerald-400";
}

function getScoreBgColor(score: number) {
	if (score >= 70) return "bg-red-400";
	if (score >= 40) return "bg-amber-400";
	return "bg-emerald-400";
}

export const Route = createFileRoute("/examples")({
	component: ExamplesPage,
});

function ExamplesPage() {
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
						Example Reports
					</h1>
					<p className="text-base md:text-lg text-white/60 max-w-2xl">
						See how Cadence analyzes Git repositories and web content. These
						examples demonstrate the detection capabilities and output format.
					</p>
				</div>
			</div>

			{/* Git Examples */}
			<section className="py-16 px-4 md:px-6 border-b border-white/5">
				<div className="max-w-5xl mx-auto">
					<div className="flex items-center gap-3 mb-8">
						<div className="p-2 rounded-lg bg-white/5 border border-white/10">
							<GitBranch className="w-5 h-5 text-white/70" />
						</div>
						<div>
							<h2 className="text-2xl md:text-3xl font-bold">
								Git Repository Analysis
							</h2>
							<p className="text-white/50 text-sm">
								Detecting AI-generated code through commit patterns
							</p>
						</div>
					</div>

					<div className="space-y-6">
						{gitExamples.map((example) => (
							<div
								key={example.title}
								className="rounded-xl bg-white/2 border border-white/5 overflow-hidden"
							>
								{/* Header */}
								<div className="px-5 py-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
									<div>
										<h3 className="font-semibold text-white text-lg">
											{example.title}
										</h3>
										<p className="text-sm text-white/40 font-mono">
											{example.repo}
										</p>
									</div>
									<div className="flex items-center gap-3">
										<div
											className={`w-2 h-2 rounded-full ${getScoreBgColor(example.score)}`}
										/>
										<span
											className={`text-2xl font-bold ${getScoreColor(example.score)}`}
										>
											{example.score}%
										</span>
									</div>
								</div>

								<div className="p-5">
									<p className="text-sm text-white/60 mb-5">
										{example.description}
									</p>

									{/* Metrics */}
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
										<div className="p-3 rounded-lg bg-white/2">
											<div className="flex items-center gap-2 text-white/40 text-xs mb-1">
												<GitBranch className="w-3 h-3" />
												Commits
											</div>
											<div className="text-white font-medium">
												{example.metrics.commits}
											</div>
										</div>
										<div className="p-3 rounded-lg bg-white/2">
											<div className="flex items-center gap-2 text-white/40 text-xs mb-1">
												<Zap className="w-3 h-3" />
												Velocity
											</div>
											<div className="text-white font-medium">
												{example.metrics.velocity}
											</div>
										</div>
										<div className="p-3 rounded-lg bg-white/2">
											<div className="flex items-center gap-2 text-white/40 text-xs mb-1">
												<Clock className="w-3 h-3" />
												Time Span
											</div>
											<div className="text-white font-medium">
												{example.metrics.timeSpan}
											</div>
										</div>
										<div className="p-3 rounded-lg bg-white/2">
											<div className="flex items-center gap-2 text-white/40 text-xs mb-1">
												<Users className="w-3 h-3" />
												Authors
											</div>
											<div className="text-white font-medium">
												{example.metrics.authors}
											</div>
										</div>
									</div>

									{/* Patterns */}
									<div>
										<p className="text-xs text-white/30 uppercase tracking-wide mb-3">
											Detected Patterns
										</p>
										<div className="space-y-2">
											{example.patterns.map((pattern) => (
												<div
													key={pattern.name}
													className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
												>
													<div className="flex items-center gap-3">
														<span
															className={`px-2 py-0.5 rounded text-xs border ${getSeverityColor(pattern.severity)}`}
														>
															{pattern.severity}
														</span>
														<span className="text-sm text-white/80">
															{pattern.name}
														</span>
													</div>
													<span className="text-xs text-white/40">
														{pattern.detail}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Web Examples */}
			<section className="py-16 px-4 md:px-6 border-b border-white/5">
				<div className="max-w-5xl mx-auto">
					<div className="flex items-center gap-3 mb-8">
						<div className="p-2 rounded-lg bg-white/5 border border-white/10">
							<Globe className="w-5 h-5 text-white/70" />
						</div>
						<div>
							<h2 className="text-2xl md:text-3xl font-bold">
								Web Content Analysis
							</h2>
							<p className="text-white/50 text-sm">
								Detecting AI-generated text through linguistic patterns
							</p>
						</div>
					</div>

					<div className="space-y-6">
						{webExamples.map((example) => (
							<div
								key={example.title}
								className="rounded-xl bg-white/2 border border-white/5 overflow-hidden"
							>
								{/* Header */}
								<div className="px-5 py-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
									<div>
										<h3 className="font-semibold text-white text-lg">
											{example.title}
										</h3>
										<p className="text-sm text-white/40 font-mono">
											{example.url}
										</p>
									</div>
									<div className="flex items-center gap-3">
										<div
											className={`w-2 h-2 rounded-full ${getScoreBgColor(example.score)}`}
										/>
										<span
											className={`text-2xl font-bold ${getScoreColor(example.score)}`}
										>
											{example.score}%
										</span>
									</div>
								</div>

								<div className="p-5">
									<p className="text-sm text-white/60 mb-5">
										{example.description}
									</p>

									{/* Stats */}
									<div className="grid grid-cols-3 gap-4 mb-5">
										<div className="p-3 rounded-lg bg-white/2 text-center">
											<div className="text-white font-medium">
												{example.stats.words}
											</div>
											<div className="text-xs text-white/40">Words</div>
										</div>
										<div className="p-3 rounded-lg bg-white/2 text-center">
											<div className="text-white font-medium">
												{example.stats.sentences}
											</div>
											<div className="text-xs text-white/40">Sentences</div>
										</div>
										<div className="p-3 rounded-lg bg-white/2 text-center">
											<div className="text-white font-medium">
												{example.stats.avgLength}
											</div>
											<div className="text-xs text-white/40">Avg Length</div>
										</div>
									</div>

									{/* Patterns */}
									<div>
										<p className="text-xs text-white/30 uppercase tracking-wide mb-3">
											Detected Patterns
										</p>
										<div className="space-y-2">
											{example.patterns.map((pattern) => (
												<div
													key={pattern.name}
													className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
												>
													<div className="flex items-center gap-3">
														<span
															className={`px-2 py-0.5 rounded text-xs border ${getSeverityColor(pattern.severity)}`}
														>
															{pattern.severity}
														</span>
														<span className="text-sm text-white/80">
															{pattern.name}
														</span>
													</div>
													<span className="text-xs text-white/40 text-right max-w-50 truncate">
														{pattern.detail}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* JSON Output Example */}
			<section className="py-16 px-4 md:px-6 border-b border-white/5">
				<div className="max-w-5xl mx-auto">
					<div className="flex items-center gap-3 mb-8">
						<div className="p-2 rounded-lg bg-white/5 border border-white/10">
							<FileJson className="w-5 h-5 text-white/70" />
						</div>
						<div>
							<h2 className="text-2xl md:text-3xl font-bold">JSON Output</h2>
							<p className="text-white/50 text-sm">
								Structured output for automation and integration
							</p>
						</div>
					</div>

					<div className="rounded-xl bg-[#0a0a0c] border border-white/5 overflow-hidden">
						<div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-[#0d0d0f]">
							<div className="flex items-center gap-2">
								<FileJson className="w-4 h-4 text-white/40" />
								<span className="text-sm text-white/40">web_analysis.json</span>
							</div>
							<div className="flex gap-1.5">
								<div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
								<div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
								<div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
							</div>
						</div>
						<pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-white/70">
							<code>{jsonExample}</code>
						</pre>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-16 px-4 md:px-6">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-2xl md:text-3xl font-bold mb-4">
						Try it yourself
					</h2>
					<p className="text-white/50 mb-8">
						Install Cadence and start analyzing your own repositories and
						content.
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
							to="/features"
							className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
						>
							View Features
						</Link>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
