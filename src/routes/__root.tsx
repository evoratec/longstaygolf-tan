import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

const SITE_URL = "https://noslop.tech";
const SITE_TITLE = "Cadence";
const SITE_DESCRIPTION =
	"AI Content Detection for Git and Web. Analyze repositories and websites for AI-generated code and text with pattern-based detection and confidence scoring.";
const SITE_IMAGE = `${SITE_URL}/og-image.png`;
const SITE_DOCS_IMAGE = `${SITE_URL}/og-docs.png`;
const SITE_AUTHOR = "CodeMeAPixel";

// Export for use in other routes
export { SITE_URL, SITE_TITLE, SITE_IMAGE, SITE_DOCS_IMAGE, SITE_AUTHOR };

export const Route = createRootRoute({
	head: () => ({
		meta: [
			// Essential metadata

			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=5",
			},
			{
				title: `${SITE_TITLE} - Detect AI-Generated Content`,
			},
			{
				name: "description",
				content: SITE_DESCRIPTION,
			},

			// Keywords
			{
				name: "keywords",
				content:
					"AI detection, content detection, git analysis, repository analysis, AI-generated code, AI-generated text, pattern detection, machine learning, code analysis, web analysis",
			},

			// Author and creator
			{
				name: "author",
				content: SITE_AUTHOR,
			},
			{
				name: "creator",
				content: SITE_AUTHOR,
			},

			// Open Graph / Facebook
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:url",
				content: `${SITE_URL}/`,
			},
			{
				property: "og:title",
				content: SITE_TITLE,
			},
			{
				property: "og:description",
				content: SITE_DESCRIPTION,
			},
			{
				property: "og:image",
				content: SITE_IMAGE,
			},
			{
				property: "og:image:width",
				content: "1200",
			},
			{
				property: "og:image:height",
				content: "630",
			},
			{
				property: "og:site_name",
				content: SITE_TITLE,
			},
			{
				property: "og:locale",
				content: "en_US",
			},

			// Twitter
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:url",
				content: SITE_URL,
			},
			{
				name: "twitter:title",
				content: SITE_TITLE,
			},
			{
				name: "twitter:description",
				content: SITE_DESCRIPTION,
			},
			{
				name: "twitter:image",
				content: SITE_IMAGE,
			},
			{
				name: "twitter:creator",
				content: "@CodeMeAPixel",
			},

			// Theme and browser
			{
				name: "theme-color",
				content: "#09090b",
			},
			{
				name: "color-scheme",
				content: "dark",
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes",
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent",
			},
			{
				name: "apple-mobile-web-app-title",
				content: SITE_TITLE,
			},

			// Microsoft/Windows
			{
				name: "msapplication-TileColor",
				content: "#09090b",
			},
			{
				name: "msapplication-config",
				content: "/browserconfig.xml",
			},

			// Robots and crawlers
			{
				name: "robots",
				content: "noindex, nofollow",
			//	content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
			},
			{
				name: "googlebot",
				content: "index, follow",
			},

			// Canonical (set in links)
			// Additional SEO
			{
				name: "language",
				content: "English",
			},
			{
				name: "revisit-after",
				content: "7 days",
			},
			{
				name: "format-detection",
				content: "telephone=no",
			},
		],
		links: [
			// Stylesheet
			{
				rel: "stylesheet",
				href: appCss,
			},

			// Canonical URL
			{
				rel: "canonical",
				href: SITE_URL,
			},

			// Favicon
			{
				rel: "icon",
				href: "/favicon.ico",
			},
			{
				rel: "apple-touch-icon",
				href: "/logo192.png",
			},

			// Manifest
			{
				rel: "manifest",
				href: "/manifest.json",
			},

			// Humans.txt
			{
				rel: "author",
				href: "/humans.txt",
			},

			// Sitemap
			{
				rel: "sitemap",
				type: "application/xml",
				href: "/sitemap.xml",
			},

			// Preconnect to external domains
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://api.github.com",
			},
			{
				rel: "dns-prefetch",
				href: "https://github.com",
			},
		],
	}),

	errorComponent: ({ error }) => <ErrorComponent error={error} />,

	notFoundComponent: () => <NotFoundPage />,

	shellComponent: RootDocument,
});

import { NotFoundError } from "../components/errors/NotFoundError";
import { ServerError } from "../components/errors/ServerError";

function NotFoundPage() {
	return <NotFoundError />;
}

function ErrorComponent({ error }: { error: Error }) {
	console.error("Root error:", error);
	return <ServerError error={error} />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				{/* JSON-LD Structured Data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "SoftwareApplication",
							name: "Cadence",
							description: "AI Content Detection for Git and Web",
							url: "https://noslop.tech",
							applicationCategory: "DeveloperApplication",
							operatingSystem: "Windows, Linux, macOS",
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "USD",
							},
							author: {
								"@type": "Organization",
								name: "CodeMeAPixel",
								url: "https://codemeapixel.dev",
							},
							license:
								"https://github.com/TryCadence/Website/blob/main/LICENSE",
							codeRepository: "https://github.com/TryCadence/Website",
						}),
					}}
				/>
				{/* Ackee Analytics */}

			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
