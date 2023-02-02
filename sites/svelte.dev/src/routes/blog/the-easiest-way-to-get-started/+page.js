import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

export function load() {
	throw redirect(dev ? 307 : 308, '/docs');
}
