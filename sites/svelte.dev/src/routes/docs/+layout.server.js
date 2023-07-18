export const prerender = true;

export async function load({ url }) {
	if (url.pathname === '/docs') {
		return {
			sections: []
		};
	}

	const { get_docs_data, get_docs_list } = await import('$lib/server/docs/index.js');

	return {
		sections: get_docs_list(await get_docs_data())
	};
}
