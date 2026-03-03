import { ArrowRight, Play, Terminal } from "lucide-react";
import { Button } from "../ui/Button";

export function AnalysisPlaygroundSection() {
	return (
		<section className="relative py-24 px-6">
			<div className="max-w-4xl mx-auto">
				<div className="rounded-2xl bg-white/2 border border-white/10 p-12 md:p-16">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
						<div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10">
							<Terminal className="w-6 h-6 text-white/70" />
						</div>
						<div>
							<h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
								Try the Playground
							</h2>
							<p className="text-lg text-white/50">
								Analyze repositories and websites instantly in your browser.
							</p>
						</div>
					</div>

					{/* Features Grid */}
					<div className="grid sm:grid-cols-2 gap-6 mb-10">
						<div className="p-4 rounded-lg bg-white/2 border border-white/5">
							<h3 className="text-white font-medium mb-1">Repository Analysis</h3>
							<p className="text-sm text-white/40">
								Analyze git commits for suspicious patterns and AI-generated code.
							</p>
						</div>
						<div className="p-4 rounded-lg bg-white/2 border border-white/5">
							<h3 className="text-white font-medium mb-1">Website Analysis</h3>
							<p className="text-sm text-white/40">
								Check web content for AI-generated text and generic language.
							</p>
						</div>
						<div className="p-4 rounded-lg bg-white/2 border border-white/5">
							<h3 className="text-white font-medium mb-1">Real-time Progress</h3>
							<p className="text-sm text-white/40">
								Watch as analysis runs with detailed status updates.
							</p>
						</div>
						<div className="p-4 rounded-lg bg-white/2 border border-white/5">
							<h3 className="text-white font-medium mb-1">Detailed Reports</h3>
							<p className="text-sm text-white/40">
								Get comprehensive metrics and pattern breakdown.
							</p>
						</div>
					</div>

					{/* CTA */}
					<div className="flex flex-col sm:flex-row items-center gap-4">
						<Button size="lg" asChild>
							<a href="/analysis" className="group">
								<Play className="w-4 h-4" />
								Open Playground
								<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="secondary" asChild>
							<a href="/docs/analysis">Learn More</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
