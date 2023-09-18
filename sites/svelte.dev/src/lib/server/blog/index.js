// @ts-check
import { extractFrontmatter } from '@sveltejs/site-kit/markdown';
import { CONTENT_BASE_PATHS } from '../../../constants.js';
import { render_content } from '../renderer.js';
import { get_sections } from '../docs/index.js';

/**
 * @param {import('./types').BlogData} blog_data
 * @param {string} slug
 */
export async function get_processed_blog_post(blog_data, slug) {
	for (const post of blog_data) {
		if (post.slug === slug) {
			return {
				...post,
				content: await render_content(post.file, post.content)
			};
		}
	}

	return null;
}

const BLOG_NAME_REGEX = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

/** @returns {Promise<import('./types').BlogData>} */
export async function get_blog_data(base = CONTENT_BASE_PATHS.BLOG) {
	const { readdir, readFile } = await import('node:fs/promises');

	/** @type {import('./types').BlogData} */
	const blog_posts = [];

	for (const file of (await readdir(base)).reverse()) {
		if (!BLOG_NAME_REGEX.test(file)) continue;

		const { date, date_formatted, slug } = get_date_and_slug(file);
		const { metadata, body } = extractFrontmatter(await readFile(`${base}/${file}`, 'utf-8'));

		blog_posts.push({
			date,
			date_formatted,
			content: body,
			description: metadata.description,
			draft: metadata.draft === 'true',
			slug,
			title: metadata.title,
			file,
			author: {
				name: metadata.author,
				url: metadata.authorURL
			},
			sections: await get_sections(body)
		});
	}

	return blog_posts;
}

/** @param {import('./types').BlogData} blog_data */
export function get_blog_list(blog_data) {
	return blog_data.map(({ slug, date, title, description, draft }) => ({
		slug,
		date,
		title,
		description,
		draft
	}));
}

/** @param {string} filename */
function get_date_and_slug(filename) {
	const match = BLOG_NAME_REGEX.exec(filename);
	if (!match) throw new Error(`Invalid filename for blog: '${filename}'`);

	const [, date, slug] = match;
	const [y, m, d] = date.split('-');
	const date_formatted = `${months[+m - 1]} ${+d} ${y}`;

	return { date, date_formatted, slug };
}

const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
