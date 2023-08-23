import * as session from '$lib/db/session';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
  runtime: 'nodejs18.x'
};

export async function load({ request }) {
	return {
		user: session.from_cookie(request.headers.get('cookie'))
	};
}
