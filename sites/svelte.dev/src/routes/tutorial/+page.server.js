import { redirect } from '@sveltejs/kit';

export const prerender = true;

export function load() {
	redirect(301, '/tutorial/basics');
}
