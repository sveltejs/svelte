import * as gist from '$lib/db/gist';
import * as session from '$lib/db/session';
import { error } from '@sveltejs/kit';

// TODO reimplement as an action
export async function PUT({ params, request }) {
	const user = await session.from_cookie(request.headers.get('cookie'));
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();
	await gist.update(user, params.id, body);

	return new Response(undefined, { status: 204 });
}
