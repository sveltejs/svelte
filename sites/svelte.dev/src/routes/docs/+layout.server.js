import { get_docs_data, get_docs_list } from '$lib/server/docs/index.js';

export const prerender = true;

export function load({ url }) {
	return {
		sections: url.pathname === '/docs' ? [] : get_docs_list(get_docs_data())
	};
}
