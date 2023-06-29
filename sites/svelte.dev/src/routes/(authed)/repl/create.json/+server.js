import * as gist from '$lib/db/gist';
import * as session from '$lib/db/session';
import { error, json } from '@sveltejs/kit';

export async function POST({ request }) {
	const user = await session.from_cookie(request.headers.get('cookie'));
	if (!user) throw error(401);

	const body = await request.json();
	const result = await gist.create(user, body);

	// normalize id
	result.id = result.id.replace(/-/g, '');

	return json(result, {
		status: 201
	});
}
