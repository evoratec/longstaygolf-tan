import {
	Activity,
	FileSearch,
	GitBranch,
	Globe,
	Shield,
	Zap,
} from "lucide-react";
import { useId } from "react";

const features = [
	{
		icon: GitBranch,
		title: "Git Repository Analysis",
		description:
			"Detect suspicious commits using velocity anomalies, timing patterns, statistical markers, and structural analysis.",
	},
	{
		icon: Globe,
		title: "Website Content Detection",
		description:
			"Analyze web pages for AI-generated text using pattern-based strategies for overused phrases, generic language, and formatting anomalies.",
	},
	{
		icon: Shield,
		title: "16 Detection Strategies",
		description:
			"Combines multiple detection methods including size analysis, velocity metrics, precision patterns, commit messaging, and naming conventions.",
	},
	{
		icon: Zap,
		title: "Built for Performance",
		description:
			"Written in Go (v1.24) for fast analysis of large repositories and high-volume web content scanning.",
	},
	{
		icon: Activity,
		title: "Webhook Server and API",
		description:
			"Deploy as a webhook server with Fiber framework for continuous monitoring and automated CI/CD integration.",
	},
	{
		icon: FileSearch,
		title: "Detailed Scoring & Reports",
		description:
			"Get confidence scores, pattern matches, and comprehensive reports in JSON or text format with reasoning.",
	},
];

export function FeaturesGrid() {
	const featuresId = useId();
	return (
		<section id={`features-${featuresId}`} className="relative py-20 px-6">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Features
					</h2>
					<p className="text-base text-white/50 max-w-xl mx-auto">
						Herramientas for detecting AI-generated content in code and text
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature) => {
						const Icon = feature.icon;

						return (
							<div
								key={feature.title}
								className="group rounded-xl bg-white/2 border border-white/5 p-6 hover:bg-white/4 hover:border-white/10 transition-all duration-200"
							>
								<div className="inline-flex p-2.5 rounded-lg bg-white/5 border border-white/10 mb-4 group-hover:bg-white/10 group-hover:border-white/15 transition-colors">
									<Icon className="w-5 h-5 text-white/70 group-hover:text-white/90 transition-colors" />
								</div>

								<h3 className="text-lg font-medium text-white mb-2">
									{feature.title}
								</h3>

								<p className="text-sm text-white/50 leading-relaxed">
									{feature.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
