import { get_index } from '$lib/server/markdown';

export const prerender = true;

export async function load() {
	return {
		posts: get_index()
	};
}
