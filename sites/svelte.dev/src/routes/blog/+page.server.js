import { get_blog_data, get_blog_list } from '$lib/server/blog/index.js';

export const prerender = true;

export async function load() {
	return {
		posts: get_blog_list(get_blog_data())
	};
}
