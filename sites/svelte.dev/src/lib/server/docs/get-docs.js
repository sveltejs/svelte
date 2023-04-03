// @ts-check
import { base as app_base } from '$app/paths';
import fs from 'fs';
import {
	escape,
	extract_frontmatter,
	normalizeSlugify,
	removeMarkdown,
	transform
} from '../markdown';

const BASE = '../../site/content/docs/';

/** @return {import('./types').DocsData} */
export function get_docs_data(base = BASE) {
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

		for (const page_md of fs
			.readdirSync(`${base}/${category_dir}`)
			.filter((filename) => filename !== 'meta.json')) {
			const match = /\d{2}-(.+)/.exec(page_md);
			if (!match) continue;

			const page_slug = match[1].replace('.md', '');

			const page_data = extract_frontmatter(
				fs.readFileSync(`${base}/${category_dir}/${page_md}`, 'utf-8')
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
				file: `${category_dir}/${page_md}`
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
