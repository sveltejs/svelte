import { PUBLIC_API_BASE } from '$env/static/public';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, setHeaders }) {
	const faqs = await fetch(`${PUBLIC_API_BASE}/docs/svelte/faq?content`).then((r) => r.json());

	setHeaders({
		'cache-control': 'public, max-age=60'
	});

	return { faqs };
}
