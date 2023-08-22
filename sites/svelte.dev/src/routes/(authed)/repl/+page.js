import { redirect } from '@sveltejs/kit';

/**
 * create a query params string from an object of query parameters
 * @param {Record<string, string>} queries
 * @returns {string}
 */
function add_query_params(queries) {
	const query_array = [];
	for (let query in queries) {
		if (queries[query] !== null) {
			query_array.push(`${query}=${queries[query]}`);
		}
	}
	return query_array.length > 0 ? `?${query_array.join('&')}` : ``;
}

export function load({ url }) {
	const query = url.searchParams;
	const gist = query.get('gist');
	const example = query.get('example');
	const version = query.get('version');
	const vim = query.get('vim');

	// redirect to v2 REPL if appropriate
	if (/^[^>]?[12]/.test(version)) {
		throw redirect(302, `https://v2.svelte.dev/repl?${query}`);
	}

	const id = gist || example || 'hello-world';
	const q = add_query_params({
		version,
		vim
	});
	throw redirect(301, `/repl/${id}${q}`);
}
