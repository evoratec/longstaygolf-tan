import { ArrowRight } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Button } from "../ui/Button";

export function CTASection() {
	return (
		<section className="relative py-24 px-6">
			<div className="max-w-4xl mx-auto">
				<div className="rounded-2xl bg-white/2 border border-white/10 p-12 md:p-16 text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Get Started with Cadence
					</h2>
					<p className="text-lg text-white/50 mb-8 max-w-xl mx-auto">
						Clone the repository and start detecting AI-generated content. Full
						documentation included.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
						<Button size="lg" asChild>
							<a
								href="https://github.com/TryCadence/Cadence"
								target="_blank"
								rel="noopener noreferrer"
								className="group"
							>
								<SiGithub className="w-5 h-5" />
								View Repository
								<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="secondary" asChild>
							<a href="/docs">Documentation</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
