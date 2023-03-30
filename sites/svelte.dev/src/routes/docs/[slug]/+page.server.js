import { get_parsed_docs } from '$lib/server/docs';
import { get_docs_data } from '$lib/server/docs/get-docs';
import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	const processed_page = get_parsed_docs(get_docs_data(), params.slug);

	if (!processed_page) throw error(404);

	return { page: processed_page };
}
