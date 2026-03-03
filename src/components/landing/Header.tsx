import { Menu, X } from "lucide-react";
import { SiGithub, SiX } from "react-icons/si";
import { useState } from "react";
import { useVersion } from "../../lib/useVersion";
import { LogoIcon } from "../Logo";
import { Button } from "../ui/Button";

export function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { version } = useVersion();

	return (
		<header className="sticky top-0 z-50 w-full">
			<div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5" />

			<div className="relative max-w-6xl mx-auto px-6">
				<div className="flex items-center justify-between h-14">
					{/* Logo */}
					<a href="/" className="flex items-center gap-2 group">
						<LogoIcon size={20} />
						<span className="font-semibold text-white">Cadence</span>
						<span className="text-xs text-white/30">{version}</span>
					</a>

					{/* Desktop Nav */}
					<nav className="hidden md:flex items-center gap-6">
						<a
							href="/features"
							className="text-sm text-white/50 hover:text-white transition-colors"
						>
							Features
						</a>
						<a
							href="/examples"
							className="text-sm text-white/50 hover:text-white transition-colors"
						>
							Examples
						</a>
						<a
							href="/analysis"
							className="text-sm text-white/50 hover:text-white transition-colors"
						>
							Playground
						</a>
						<a
							href="/downloads"
							className="text-sm text-white/50 hover:text-white transition-colors"
						>
							Downloads
						</a>
						<a
							href="/changelog"
							className="text-sm text-white/50 hover:text-white transition-colors"
						>
							Changelog
						</a>
						<a
							href="/docs"
							className="text-sm text-white/50 hover:text-white transition-colors"
						>
							Docs
						</a>
					</nav>

					{/* Actions */}
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="hidden sm:inline-flex"
						>
							<a
								href="https://x.com/NoSlopTech"
								target="_blank"
								rel="noopener noreferrer"
							>
								<SiX className="w-3.5 h-3.5" />
								Twitter/X
							</a>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							asChild
							className="hidden sm:inline-flex"
						>
							<a
								href="https://github.com/TryCadence/Cadence"
								target="_blank"
								rel="noopener noreferrer"
							>
								<SiGithub className="w-4 h-4" />
								GitHub
							</a>
						</Button>

						<button
							type="button"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
						>
							{mobileMenuOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="md:hidden absolute top-full left-0 right-0 bg-[#09090b]/95 backdrop-blur-md border-b border-white/5">
					<nav className="flex flex-col p-4 gap-1">
						<a
							href="/features"
							className="px-3 py-2 text-sm text-white/50 hover:text-white rounded transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Features
						</a>
						<a
							href="/examples"
							className="px-3 py-2 text-sm text-white/50 hover:text-white rounded transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Examples
						</a>
						<a
							href="/analysis"
							className="px-3 py-2 text-sm text-white/50 hover:text-white rounded transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Playground
						</a>
						<a
							href="/downloads"
							className="px-3 py-2 text-sm text-white/50 hover:text-white rounded transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Downloads
						</a>
						<a
							href="/changelog"
							className="px-3 py-2 text-sm text-white/50 hover:text-white rounded transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Changelog
						</a>
						<a
							href="/docs"
							className="px-3 py-2 text-sm text-white/50 hover:text-white rounded transition-colors"
							onClick={() => setMobileMenuOpen(false)}
						>
							Docs
						</a>
						<a
							href="https://x.com/NoSlopTech"
							target="_blank"
							rel="noopener noreferrer"
							className="px-3 py-2 text-sm text-white/50 hover:text-white rounded transition-colors"
						>
							Twitter/X
						</a>
						<a
							href="https://github.com/TryCadence/Cadence"
							target="_blank"
							rel="noopener noreferrer"
							className="px-3 py-2 text-sm text-white/50 hover:text-white rounded transition-colors"
						>
							GitHub
						</a>
					</nav>
				</div>
			)}
		</header>
	);
}
