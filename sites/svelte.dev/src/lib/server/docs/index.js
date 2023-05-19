import { render_markdown } from '../markdown/renderer.js';

/**
 * @param {import('./types').DocsData} docs_data
 * @param {string} slug
 */
export async function get_parsed_docs(docs_data, slug) {
	const page = docs_data
		.find(({ pages }) => pages.find((page) => slug === page.slug))
		?.pages.find((page) => slug === page.slug);

	if (!page) return null;

	return {
		...page,
		content: await render_markdown(page.file, page.content)
	};
}
