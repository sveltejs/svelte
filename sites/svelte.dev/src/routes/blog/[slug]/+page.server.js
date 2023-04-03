import { get_processed_blog_post } from '$lib/server/blog';
import { get_blog_data } from '$lib/server/blog/get-blog-data';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const post = get_processed_blog_post(get_blog_data(), params.slug);

	if (!post) {
		throw error(404);
	}

	return {
		post
	};
}
