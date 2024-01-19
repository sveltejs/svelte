import { error } from '@sveltejs/kit';

export async function load({ fetch, params, url }) {
	const res = await fetch(`/repl/api/${params.id}.json`);

	if (!res.ok) {
		error(/** @type {any} */ (res.status)); // TODO loosen the types so we can get rid of this
	}

	const gist = await res.json();

	return {
		gist,
		version: url.searchParams.get('version') || '4'
	};
}
