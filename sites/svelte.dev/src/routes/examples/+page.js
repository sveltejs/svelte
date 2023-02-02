import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load() {
	throw redirect(301, 'examples/hello-world');
}
