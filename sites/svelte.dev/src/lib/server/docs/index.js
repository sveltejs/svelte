import { base as app_base } from '$app/paths';
import { modules } from '$lib/generated/type-info.js';
import fs from 'node:fs';
import { CONTENT_BASE_PATHS } from '../../../constants.js';
import {
	escape,
	extract_frontmatter,
	normalizeSlugify,
	removeMarkdown,
	transform
} from '../markdown/index.js';
import { render_markdown } from '../markdown/renderer.js';

/**
 * @param {import('./types').DocsData} docs_data
 * @param {string} slug
 */
export async function get_parsed_docs(docs_data, slug) {
	for (const { pages } of docs_data) {
		for (const page of pages) {
			if (page.slug === slug) {
				return {
					...page,
					content: await render_markdown(page.file, page.content, { modules })
				};
			}
		}
	}

	return null;
}

/** @return {import('./types').DocsData} */
export function get_docs_data(base = CONTENT_BASE_PATHS.DOCS) {
	/** @type {import('./types').DocsData} */
	const docs_data = [];

	for (const category_dir of fs.readdirSync(base)) {
		const match = /\d{2}-(.+)/.exec(category_dir);
		if (!match) continue;

		const category_slug = match[1];

		// Read the meta.json
		const { title: category_title, draft = 'false' } = JSON.parse(
			fs.readFileSync(`${base}/${category_dir}/meta.json`, 'utf-8')
		);

		if (draft === 'true') continue;

		/** @type {import('./types').Category} */
		const category = {
			title: category_title,
			slug: category_slug,
			pages: []
		};

		for (const filename of fs.readdirSync(`${base}/${category_dir}`)) {
			if (filename === 'meta.json') continue;
			const match = /\d{2}-(.+)/.exec(filename);
			if (!match) continue;

			const page_slug = match[1].replace('.md', '');

			const page_data = extract_frontmatter(
				fs.readFileSync(`${base}/${category_dir}/${filename}`, 'utf-8')
			);

			if (page_data.metadata.draft === 'true') continue;

			const page_title = page_data.metadata.title;
			const page_content = page_data.body;

			category.pages.push({
				title: page_title,
				slug: page_slug,
				content: page_content,
				sections: get_sections(page_content),
				path: `${app_base}/docs/${page_slug}`,
				file: `${category_dir}/${filename}`
			});
		}

		docs_data.push(category);
	}

	return docs_data;
}

/** @param {import('./types').DocsData} docs_data */
export function get_docs_list(docs_data) {
	return docs_data.map((category) => ({
		title: category.title,
		pages: category.pages.map((page) => ({
			title: page.title,
			path: page.path
		}))
	}));
}

/** @param {string} markdown */
function get_sections(markdown) {
	const headingRegex = /^##\s+(.*)$/gm;
	/** @type {import('./types').Section[]} */
	const secondLevelHeadings = [];
	let match;

	while ((match = headingRegex.exec(markdown)) !== null) {
		secondLevelHeadings.push({
			title: removeMarkdown(
				escape(transform(match[1], { paragraph: (txt) => txt }))
					.replace(/<\/?code>/g, '')
					.replace(/&#39;/g, "'")
					.replace(/&quot;/g, '"')
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/<(\/)?(em|b|strong|code)>/g, '')
			),
			slug: normalizeSlugify(match[1])
		});
	}

	return secondLevelHeadings;
}
