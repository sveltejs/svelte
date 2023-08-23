import * as session from '$lib/db/session';

export async function load({ request }) {
	return {
		user: session.from_cookie(request.headers.get('cookie'))
	};
}
