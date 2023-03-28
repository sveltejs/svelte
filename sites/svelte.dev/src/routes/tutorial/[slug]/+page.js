import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_BASE } from '$env/static/public';

export async function load({ fetch, params, setHeaders }) {
	// TODO: Use local data
	const tutorial = await fetch(`${PUBLIC_API_BASE}/docs/svelte/tutorial/${params.slug}`);

	if (!tutorial.ok) {
		throw redirect(301, '/tutorial/basics');
	}

	setHeaders({
		'cache-control': 'public, max-age=60',
	});

	return { tutorial: await tutorial.json(), slug: params.slug };
}
