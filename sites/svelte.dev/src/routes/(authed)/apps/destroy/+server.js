import * as session from '$lib/db/session';
import * as gist from '$lib/db/gist';

export async function POST({ request }) {
	const user = await session.from_cookie(request.headers.get('cookie'));
	if (!user) return new Response(undefined, { status: 401 });

	const body = await request.json();
	await gist.destroy(user.id, body.ids);

	return new Response(undefined, { status: 204 });
}
