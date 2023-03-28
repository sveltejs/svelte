import fs from 'fs';
// import { read_file } from '$lib/server/docs';
import { error } from '@sveltejs/kit';
import { read_file } from '$lib/server/docs';

export const prerender = true;

const base = '../../site/content/docs/';

/**
 * ASSUMPTION FOR FUTURE: This assumes the directory structure of docs is flat. AKA, no nested folders
 */
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	for (const file of fs.readdirSync(`${base}`)) {
		if (file.slice(3, -3) === params.slug) {
			return {
				page: await read_file(file)
			};
		}
	}

	throw error(404);
}
