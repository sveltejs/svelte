import { get_post } from '$lib/server/blog/index.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const post = get_post(params.slug);

	if (!post) {
		throw error(404);
	}

	return {
		post,
	};
}
