import { GitBranch, Globe } from "lucide-react";
import { useState } from "react";

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

const webPatterns = [
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

export function DetectionStrategies() {
	const [activeTab, setActiveTab] = useState<"git" | "web">("git");

	const strategies = activeTab === "git" ? gitStrategies : webPatterns;

	return (
		<section className="py-20 px-6">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Detection Strategies
					</h2>
					<p className="text-base text-white/50 max-w-2xl mx-auto">
						38 specialized detection strategies combining pattern analysis with
						statistical markers
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
							18
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
							20
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
