import { get_docs_data, get_parsed_docs } from '$lib/server/docs/index.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

/**
 * @type {import('./$types').PageServerLoad}
 */
export const load = async ({ params }) => {
	const processed_page = await get_parsed_docs(await get_docs_data(params.version), params.slug);

	if (!processed_page) error(404);

	return { page: processed_page };
};
