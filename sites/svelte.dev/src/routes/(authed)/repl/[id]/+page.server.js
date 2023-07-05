import { error } from '@sveltejs/kit';

export async function load({ fetch, params, url }) {
	const res = await fetch(`/repl/${params.id}.json`);

	console.log(1, res);

	if (!res.ok) {
		throw error(res.status);
	}

	console.log(2);

	const gist = await res.json();
	console.log(3, gist);

	return {
		gist,
		version: url.searchParams.get('version') || '4'
	};
}
