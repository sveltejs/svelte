import { error } from '@sveltejs/kit';
import { VERSION } from 'svelte/compiler';

export async function load({ fetch, params, url }) {
	const res = await fetch(`/repl/${params.id}.json`);

	if (!res.ok) {
		throw error(res.status);
	}

	const gist = await res.json();

	return {
		gist,
		version: url.searchParams.get('version') || VERSION
	};
}
