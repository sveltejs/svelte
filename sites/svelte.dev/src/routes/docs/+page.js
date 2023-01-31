import { PUBLIC_API_BASE } from '$env/static/public';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, setHeaders }) {
	const sections = await (await fetch(`${PUBLIC_API_BASE}/docs/svelte/docs?content`)).json();

	setHeaders({
		'cache-control': 'public, max-age=60'
	});

	return { sections };
}
