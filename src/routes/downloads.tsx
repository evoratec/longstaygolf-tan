import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	VscLoading,
	VscPackage,
	VscTerminal,
	VscWarning,
} from "react-icons/vsc";
import { SiDocker, SiGithub } from "react-icons/si";
import { LandingLayout } from "../components/layouts/LandingLayout";
import { Button } from "../components/ui/Button";

interface Asset {
	name: string;
	download_count: number;
	browser_download_url: string;
	size: number;
}

interface Release {
	tag_name: string;
	name: string;
	published_at: string;
	prerelease: boolean;
	assets: Asset[];
}

const GITHUB_REPO = "TryCadence/Cadence";

export const Route = createFileRoute("/downloads")({
	head: () => ({
		meta: [
			{ title: "Downloads | Cadence" },
			{
				name: "description",
				content:
					"Download Cadence binaries for Linux, macOS, and Windows. Access current and previous releases.",
			},
			{
				property: "og:title",
				content: "Downloads | Cadence",
			},
			{
				property: "og:description",
				content:
					"Download Cadence binaries for Linux, macOS, and Windows. Access current and previous releases.",
			},
			{
				property: "og:url",
				content: "https://noslop.tech/downloads",
			},
		],
	}),
	component: DownloadsPage,
});

function DownloadsPage() {
	const [releases, setReleases] = useState<Release[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchReleases = async () => {
			try {
				const response = await fetch(
					`https://api.github.com/repos/${GITHUB_REPO}/releases`,
					{
						headers: {
							Accept: "application/vnd.github.v3+json",
						},
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch releases");
				}

				const data: Release[] = await response.json();
				// Filter out pre-releases for production, but include them in the list
				setReleases(data.filter((r) => !r.prerelease).slice(0, 20));
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Unknown error occurred"
				);
				setReleases([]);
			} finally {
				setLoading(false);
			}
		};

		fetchReleases();
	}, []);

	const latest = releases[0];
	const previous = releases.slice(1);

	return (
		<LandingLayout>
			<div className="min-h-screen bg-gradient-to-b from-[#09090b] to-[#0f0f13] pt-24 pb-20">
				<div className="max-w-6xl mx-auto px-6">
					{/* Header */}
					<div className="text-center mb-16">
						<h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
							Downloads
						</h1>
						<p className="text-xl text-white/60">
							Get the latest Cadence binaries for your platform
						</p>
					</div>

					{/* Error State */}
					{error && (
						<div className="mb-12 p-6 rounded-xl bg-red-500/10 border border-red-500/20">
							<div className="flex items-start gap-3">
								<VscWarning className="w-5 h-5 text-red-400 mt-1 shrink-0" />
								<div>
									<p className="font-semibold text-red-300 mb-1">
										Failed to load releases
									</p>
									<p className="text-sm text-red-200/70">{error}</p>
									<p className="text-sm text-red-200/50 mt-2">
										Visit{" "}
										<a
											href={`https://github.com/${GITHUB_REPO}/releases`}
											target="_blank"
											rel="noopener noreferrer"
											className="underline hover:text-red-200"
										>
											GitHub Releases
										</a>{" "}
										to download manually.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Loading State */}
					{loading && (
						<div className="flex items-center justify-center py-20">
							<div className="text-center">
								<VscLoading className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
								<p className="text-white/60">Loading releases...</p>
							</div>
						</div>
					)}

					{/* Latest Release */}
					{latest && !loading && (
						<div className="mb-16">
							<div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
								<span className="text-sm font-medium text-emerald-300">
									Latest Version
								</span>
							</div>

							<div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm p-8 md:p-10">
								<div className="flex items-start justify-between mb-8">
									<div>
										<h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
											{latest.tag_name}
										</h2>
										<p className="text-white/60">
											Released{" "}
											{new Date(latest.published_at).toLocaleDateString()}
										</p>
									</div>
									<a
										href={`https://github.com/${GITHUB_REPO}/releases/tag/${latest.tag_name}`}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-colors text-sm"
									>
										<SiGithub className="w-4 h-4" />
										Release Notes
									</a>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Platform Cards */}
									<PlatformGroup
										assets={latest.assets}
										platform="linux"
										icon={<VscTerminal className="w-5 h-5" />}
										label="Linux"
									/>
									<PlatformGroup
										assets={latest.assets}
										platform="darwin"
										icon={<VscTerminal className="w-5 h-5" />}
										label="macOS"
									/>
									<PlatformGroup
										assets={latest.assets}
										platform="windows"
										icon={<VscTerminal className="w-5 h-5" />}
										label="Windows"
									/>
									<div className="rounded-lg bg-white/5 border border-white/10 p-4 flex items-center gap-3">
										<div className="p-3 rounded-lg bg-blue-500/20">
											<SiDocker className="w-5 h-5 text-blue-400" />
										</div>
										<div>
											<p className="font-semibold text-white text-sm">
												Docker
											</p>
											<p className="text-xs text-white/50">
												trycadence/cadence:{latest.tag_name.replace(
													/^v/,
													""
												)}
											</p>
										</div>
									</div>
								</div>

								<div className="mt-8 pt-8 border-t border-white/10">
									<div className="grid grid-cols-3 gap-4 text-center">
										<div>
											<p className="text-2xl font-bold text-emerald-400">
												{latest.assets.length}
											</p>
											<p className="text-sm text-white/60">Binaries</p>
										</div>
										<div>
											<p className="text-2xl font-bold text-emerald-400">
												{(
													latest.assets.reduce(
														(sum, a) => sum + a.size,
														0
													) / (1024 * 1024)
												).toFixed(1)}
												MB
											</p>
											<p className="text-sm text-white/60">Total Size</p>
										</div>
										<div>
											<p className="text-2xl font-bold text-emerald-400">
												{latest.assets.reduce(
													(sum, a) => sum + a.download_count,
													0
												)}
											</p>
											<p className="text-sm text-white/60">Downloads</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Previous Releases */}
					{previous.length > 0 && !loading && (
						<div>
							<h2 className="text-2xl font-bold text-white mb-6">
								Previous Versions
							</h2>
							<div className="space-y-3">
								{previous.map((release) => (
									<a
										key={release.tag_name}
										href={`https://github.com/${GITHUB_REPO}/releases/tag/${release.tag_name}`}
										target="_blank"
										rel="noopener noreferrer"
										className="block rounded-lg border border-white/10 bg-white/3 hover:bg-white/5 backdrop-blur-sm p-4 transition-colors group"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<VscPackage className="w-4 h-4 text-white/40 group-hover:text-white/60" />
												<div>
													<p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
														{release.tag_name}
													</p>
													<p className="text-xs text-white/50">
														{release.assets.length} files •{" "}
														{new Date(release.published_at).toLocaleDateString()}
													</p>
												</div>
											</div>
											<div className="text-xs bg-white/10 px-2.5 py-1 rounded text-white/60 group-hover:text-white/80">
												{(
													release.assets.reduce(
														(sum, a) => sum + a.size,
														0
													) / 1024 / 1024
												).toFixed(1)}
												MB
											</div>
										</div>
									</a>
								))}
							</div>
						</div>
					)}

					{/* Installation Methods */}
					<div className="mt-20 pt-20 border-t border-white/10">
						<h2 className="text-2xl font-bold text-white mb-8">
							Installation Methods
						</h2>

						<div className="grid md:grid-cols-3 gap-6">
							{/* Direct Binary */}
							<div className="rounded-lg border border-white/10 bg-white/3 p-6">
								<div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
									<VscTerminal className="w-6 h-6 text-white/60" />
								</div>
								<h3 className="font-semibold text-white mb-2">
									Direct Download
								</h3>
								<p className="text-sm text-white/60 mb-4">
									Download the binary for your platform from the releases above.
								</p>
								<code className="text-xs bg-black/30 text-emerald-300 p-2 rounded block">
									chmod +x cadence
									<br />
									./cadence --version
								</code>
							</div>

							{/* Docker */}
							<div className="rounded-lg border border-white/10 bg-white/3 p-6">
								<div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
									<SiDocker className="w-6 h-6 text-blue-400" />
								</div>
								<h3 className="font-semibold text-white mb-2">Docker</h3>
								<p className="text-sm text-white/60 mb-4">
									Run Cadence in a Docker container.
								</p>
								<code className="text-xs bg-black/30 text-emerald-300 p-2 rounded block">
									docker pull
									<br />
									trycadence/cadence
								</code>
							</div>

							{/* From Source */}
							<div className="rounded-lg border border-white/10 bg-white/3 p-6">
								<div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
									<SiGithub className="w-6 h-6 text-purple-400" />
								</div>
								<h3 className="font-semibold text-white mb-2">From Source</h3>
								<p className="text-sm text-white/60 mb-4">
									Build from the GitHub repository.
								</p>
								<code className="text-xs bg-black/30 text-emerald-300 p-2 rounded block">
									git clone
									<br />
									... && make build
								</code>
							</div>
						</div>
					</div>

					{/* CTA Footer */}
					<div className="mt-20 pt-20 border-t border-white/10 text-center">
						<h2 className="text-2xl font-bold text-white mb-4">
							Need Help?
						</h2>
						<p className="text-white/60 mb-8">
							Check out our documentation or report issues on GitHub
						</p>
						<div className="flex flex-wrap items-center justify-center gap-4">
							<Button asChild>
								<a href="/docs/getting-started/installation">
									View Installation Guide
								</a>
							</Button>
							<Button variant="secondary" asChild>
								<a
									href={`https://github.com/${GITHUB_REPO}/issues`}
									target="_blank"
									rel="noopener noreferrer"
								>
									Report Issues
								</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</LandingLayout>
	);
}

function PlatformGroup({
	assets,
	platform,
	icon,
	label,
}: {
	assets: Asset[];
	platform: string;
	icon: React.ReactNode;
	label: string;
}) {
	const binaries = assets.filter((a) =>
		a.name.toLowerCase().includes(platform.toLowerCase())
	);

	if (binaries.length === 0) return null;

	return (
		<div className="rounded-lg bg-white/5 border border-white/10 p-4">
			<div className="flex items-start gap-3">
				<div className="p-3 rounded-lg bg-white/10" style={{ width: "fit-content" }}>
					{icon}
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-semibold text-white text-sm mb-3">{label}</p>
					<div className="space-y-2">
						{binaries.map((binary) => (
							<a
								key={binary.name}
								href={binary.browser_download_url}
								download
								className="flex items-center justify-between text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2.5 py-1.5 transition-colors group"
							>
								<span className="text-white/70 group-hover:text-white truncate">
									{binary.name}
								</span>
								<span className="text-white/40 group-hover:text-white/60 text-xs whitespace-nowrap ml-2">
									{(binary.size / (1024 * 1024)).toFixed(1)}MB
								</span>
							</a>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

