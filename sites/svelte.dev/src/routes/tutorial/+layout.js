import { PUBLIC_API_BASE } from '$env/static/public';

export async function load({ fetch }) {
	const tutorials = await fetch(`${PUBLIC_API_BASE}/docs/svelte/tutorial`).then((r) => r.json());
	return { tutorials };
}
