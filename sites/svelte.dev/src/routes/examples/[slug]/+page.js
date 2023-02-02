import { PUBLIC_API_BASE } from '$env/static/public';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params, setHeaders }) {
	const example = await fetch(`${PUBLIC_API_BASE}/docs/svelte/examples/${params.slug}`, {
		credentials: 'omit'
	});

	setHeaders({
		'cache-control': 'public, max-age=60'
	});

	return {
		example: await example.json(),
		slug: params.slug
	};
}
