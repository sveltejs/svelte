import { json } from '@sveltejs/kit';
import { get_versions } from '$lib/server/docs/index.js';

export const prerender = true;

export const GET = async () => {
	return json(await get_versions());
};
