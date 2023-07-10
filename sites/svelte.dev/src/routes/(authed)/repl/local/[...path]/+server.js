import { env } from '$env/dynamic/private';

const local_svelte_path = env.LOCAL_SVELTE_PATH || '../../../svelte';

export async function GET({ params: { path } }) {
	if (import.meta.env.PROD || ('/' + path).includes('/.')) {
		return new Response(undefined, { status: 403 });
	}

	const { readFile } = await import('node:fs/promises');

	return new Response(await readFile(`${local_svelte_path}/${path}`), {
		headers: { 'Content-Type': 'text/javascript' }
	});
}
