import { error } from '@sveltejs/kit';

export async function entries() {
	const { get_docs_data } = await import('../render.js');

	const data = await get_docs_data();
	return data[0].pages.map((page) => ({ slug: page.slug }));
}

export async function load({ params }) {
	const { get_docs_data, get_parsed_docs } = await import('../render.js');

	const data = await get_docs_data();
	const processed_page = await get_parsed_docs(data, params.slug);

	if (!processed_page) error(404);

	return { page: processed_page };
}
