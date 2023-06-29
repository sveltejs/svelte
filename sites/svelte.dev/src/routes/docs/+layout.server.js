export const prerender = true;

export async function load({ url }) {
	const is_docs_index = url.pathname === '/docs';

	if (!is_docs_index) {
		const { get_docs_data, get_docs_list } = await import('$lib/server/docs/index.js');

		return {
			sections: url.pathname === '/docs' ? [] : get_docs_list(get_docs_data())
		};
	}

	return {
		sections: []
	};
}
