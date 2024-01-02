import { error } from '@sveltejs/kit';

export async function load({ fetch, params, url }) {
	const res = await fetch(`/repl/api/${params.id}.json`);

	if (!res.ok) {
		error(/** @type {import('@sveltejs/kit').NumericRange<400, 599>}  */(res.status));
	}

	const gist = await res.json();

	return {
		gist,
		version: url.searchParams.get('version') || '4'
	};
}
