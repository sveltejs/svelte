// @ts-check
import fs from 'fs';
import { extract_frontmatter } from '../markdown';

const BLOG_NAME_REGEX = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;
const BASE = '../../documentation/content/blog';

/** @returns {import('./types').BlogData} */
export function get_blog_data(base = BASE) {
	/** @type {import('./types').BlogData} */
	const blog_posts = [];

	for (const file of fs.readdirSync(base).reverse()) {
		if (!BLOG_NAME_REGEX.test(file)) continue;

		const { date, date_formatted, slug } = get_date_and_slug(file);
		const { metadata, body } = extract_frontmatter(fs.readFileSync(`${base}/${file}`, 'utf-8'));

		blog_posts.push({
			date,
			date_formatted,
			content: body,
			description: metadata.description,
			draft: metadata.draft === 'true',
			slug,
			title: metadata.title,
			author: {
				name: metadata.author,
				url: metadata.authorURL
			}
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
