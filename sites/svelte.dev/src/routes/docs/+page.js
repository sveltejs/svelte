import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load() {
	throw redirect(307, `${base}/docs/introduction`);
}
