import { AlertTriangle, ChevronRight, Terminal } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { useVersion } from "../../lib/useVersion";
import { Button } from "../ui/Button";

export function Hero() {
	const { version } = useVersion();

	return (
		<section className="relative py-24 px-6 text-center">
			<div className="max-w-5xl mx-auto">
				{/* Version badge */}
				<a
					href={`https://github.com/TryCadence/Cadence/releases/tag/${version}`}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm mb-8 hover:bg-white/10 hover:border-white/20 transition-colors group"
				>
					<Terminal className="w-4 h-4" />
					<span className="font-mono">{version}</span>
					<span className="w-px h-3 bg-white/20" />
					<span>38 Detection Strategies</span>
					<ChevronRight className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
				</a>

				{/* Title */}
				<h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
					<span className="bg-linear-to-b from-white to-white/70 bg-clip-text text-transparent">
						Long Stay Golf
					</span>
				</h1>

				{/* Tagline */}
				<p className="text-lg md:text-xl text-white/70 mb-4">
					Securing the SDLC through{" "}
					<span className="text-white/90">deep pattern detection</span> and{" "}
					<span className="text-white/90">statistical markers.</span>
				</p>

				{/* Disclaimer Alert */}
				<div className="max-w-2xl mx-auto mb-6">
					<a
						href="/docs/disclaimer"
						className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs hover:bg-amber-500/15 hover:border-amber-500/30 transition-colors"
					>
						<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
						<span>Cadence is not perfect and is under active development</span>
						<span className="text-amber-200/60">Learn more</span>
					</a>
				</div>

				{/* CTA Buttons */}
				<div className="flex flex-wrap items-center justify-center gap-4 mb-12">
					<Button size="lg" asChild>
						<a
							href="https://github.com/TryCadence/Cadence"
							target="_blank"
							rel="noopener noreferrer"
							className="group"
						>
							<SiGithub className="w-5 h-5" />
							View on GitHub
							<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</a>
					</Button>
					<Button size="lg" variant="secondary" asChild>
						<a href="/docs">Documentation</a>
					</Button>
				</div>

				{/* Info line */}
				<div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
					<span>Open Source</span>
					<span className="w-1 h-1 rounded-full bg-white/20" />
					<span>Built with Go</span>
				</div>
			</div>
		</section>
	);
}
