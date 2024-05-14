export const prerender = true;

/**
 * @type {import('./$types').LayoutServerLoad}
 */
export const load = async ({ params, url, fetch }) => {
	const { get_versions } = await import('$lib/server/docs/index.js');
	const version_groups = await get_versions();

	if (url.pathname === '/docs') {
		return {
			sections: [],
			version_groups
		};
	}

	const { get_docs_data, get_docs_list } = await import('$lib/server/docs/index.js');

	return {
		sections: get_docs_list(await get_docs_data(params.version)),
		version_groups
	};
};
