import { createFileRoute } from "@tanstack/react-router";
import { docsMap, parseMarkdown } from "../../lib/docs";
import { DocsLayout } from "../../components/layouts/DocsLayout";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";

const SITE_URL = "https://noslop.tech";
const DOCS_IMAGE = `${SITE_URL}/og-docs.png`;

export const Route = createFileRoute("/docs/$")({
	loader: ({ params }) => {
		const slug = params._splat || "index";
		const content = docsMap[slug];

		if (!content) {
			throw new Error(`Documentation not found: ${slug}`);
		}

		return { ...parseMarkdown(content), slug };
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: `${loaderData.title} | Cadence Docs` },
			{
				name: "description",
				content:
					loaderData.description ||
					"Cadence documentation for AI content detection.",
			},
			{ property: "og:title", content: `${loaderData.title} | Cadence Docs` },
			{
				property: "og:description",
				content:
					loaderData.description ||
					"Cadence documentation for AI content detection.",
			},
			{ property: "og:image", content: DOCS_IMAGE },
			{ property: "og:url", content: `${SITE_URL}/docs/${loaderData.slug}` },
			{ name: "twitter:image", content: DOCS_IMAGE },
			{ name: "twitter:title", content: `${loaderData.title} | Cadence Docs` },
			{
				name: "twitter:description",
				content:
					loaderData.description ||
					"Cadence documentation for AI content detection.",
			},
		],
	}),
	component: DocsPage,
});

function DocsPage() {
	const { markdown, title, description, slug } = Route.useLoaderData();

	return (
		<DocsLayout
			title={title}
			description={description}
			content={markdown}
			slug={slug}
		>
			<MarkdownRenderer content={markdown} />
		</DocsLayout>
	);
}
