import { get_blog_data, get_processed_blog_post } from '$lib/server/blog/index.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const post = await get_processed_blog_post(await get_blog_data(), params.slug);

	if (!post) error(404);

	// forgive me — terrible hack necessary to get diffs looking sensible
	// on the `runes` blog post
	post.content = post.content.replace(/(    )+/gm, (match) => '  '.repeat(match.length / 4));

	return {
		post
	};
}
