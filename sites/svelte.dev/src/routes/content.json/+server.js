import { content } from '$lib/search/content';
import { json } from '@sveltejs/kit';

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export function GET() {
	return json({
		blocks: content(),
	});
}
