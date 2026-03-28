export function LogoIcon({ size = 24 }: { size?: number }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Cadence logo"
		>
			<title>Cadence logo</title>
			{/* Waveform bars */}
			<g fill="currentColor">
				<rect x="4" y="14" width="3" height="4" rx="1.5" opacity="0.4" />
				<rect x="9" y="11" width="3" height="10" rx="1.5" opacity="0.6" />
				<rect x="14" y="8" width="3" height="16" rx="1.5" opacity="0.8" />
				<rect x="19" y="5" width="3" height="22" rx="1.5" />
				<rect x="24" y="9" width="3" height="14" rx="1.5" opacity="0.7" />
			</g>

			{/* Detection indicator */}
			<circle cx="20.5" cy="2" r="2" fill="#22c55e" />
		</svg>
	);
}

export function LogoType() {
	return (
		<div className="flex items-center gap-2">
			<LogoIcon size={28} />
			<span className="text-xl font-bold tracking-tight">Long Stay Golf</span>
		</div>
	);
}
