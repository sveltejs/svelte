import { readFileSync } from 'fs';
import { join } from 'path';
import { env } from '$env/dynamic/private';

const local_svelte_path = env.LOCAL_SVELTE_PATH || '../../../svelte';

export function GET({ params: { path } }) {
	if (import.meta.env.PROD || ('/' + path).includes('/.')) {
		return new Response(undefined, { status: 403 });
	}
	return new Response(readFileSync(join(local_svelte_path, path)), {
		headers: { 'Content-Type': 'text/javascript' }
	});
}
