export const prerender = true;

/**
 * @type {import('./$types').LayoutServerLoad}
 */
export const load = async ({ params, url }) => {
	if (url.pathname === '/docs') {
		return {
			sections: []
		};
	}

	const { get_docs_data, get_docs_list } = await import('$lib/server/docs/index.js');

	return {
		sections: get_docs_list(await get_docs_data(params.version))
	};
};
