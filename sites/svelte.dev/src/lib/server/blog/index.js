// @ts-check
import { render_markdown } from '../markdown/renderer';

/**
 * @param {import('./types').BlogData} blog_data
 * @param {string} slug
 */
export async function get_processed_blog_post(blog_data, slug) {
	const post = blog_data.find((post) => post.slug === slug);

	if (!post) return null;

	return {
		...post,
		content: await render_markdown(post.file, post.content)
	};
}
