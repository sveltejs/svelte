import * as gist from '$lib/db/gist';
import * as session from '$lib/db/session';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, url }) {
	const res = await fetch(`/repl/${params.id}.json`);

	if (!res.ok) {
		throw error(res.status);
	}

	const gist = await res.json();

	return {
		gist,
		version: url.searchParams.get('version') || '3',
	};
}

export const actions = {
	default: async ({ params, request }) => {
		const user = await session.from_cookie(request.headers.get('cookie'));
		if (!user) throw error(401, 'Unauthorized');

		const body = await request.json();
		await gist.update(user, params.id, body);

		return new Response(undefined, { status: 204 });
	},
};
