import { get_docs_data, get_parsed_docs } from '$lib/server/docs/index.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const processed_page = await get_parsed_docs(await get_docs_data(), params.slug);

	if (!processed_page) throw error(404);

	return { page: processed_page };
}
