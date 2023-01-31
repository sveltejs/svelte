import { PUBLIC_API_BASE } from '$env/static/public';

export async function load({ fetch }) {
	const examples = await fetch(`${PUBLIC_API_BASE}/docs/svelte/examples`).then((r) => r.json());
	return { examples };
}
