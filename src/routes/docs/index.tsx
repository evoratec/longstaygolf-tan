import { createFileRoute } from "@tanstack/react-router";
import { docsMap, parseMarkdown } from "../../lib/docs";
import { DocsLayout } from "../../components/layouts/DocsLayout";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";

const SITE_URL = "https://noslop.tech";
const DOCS_IMAGE = `${SITE_URL}/og-docs.png`;

export const Route = createFileRoute("/docs/")({
	loader: () => parseMarkdown(docsMap["index"] || "# Documentation"),
	head: ({ loaderData }) => ({
		meta: [
			{ title: `${loaderData.title} | Cadence Docs` },
			{
				name: "description",
				content:
					loaderData.description ||
					"Cadence documentation - Learn how to detect AI-generated content in Git repositories and websites.",
			},
			{ property: "og:title", content: `${loaderData.title} | Cadence Docs` },
			{
				property: "og:description",
				content:
					loaderData.description ||
					"Cadence documentation - Learn how to detect AI-generated content in Git repositories and websites.",
			},
			{ property: "og:image", content: DOCS_IMAGE },
			{ property: "og:url", content: `${SITE_URL}/docs/` },
			{ name: "twitter:image", content: DOCS_IMAGE },
			{ name: "twitter:title", content: `${loaderData.title} | Cadence Docs` },
			{
				name: "twitter:description",
				content:
					loaderData.description ||
					"Cadence documentation - Learn how to detect AI-generated content in Git repositories and websites.",
			},
		],
	}),
	component: DocsIndexPage,
});

function DocsIndexPage() {
	const { markdown, title, description } = Route.useLoaderData();

	return (
		<DocsLayout title={title} description={description}>
			<MarkdownRenderer content={markdown} />
		</DocsLayout>
	);
}
