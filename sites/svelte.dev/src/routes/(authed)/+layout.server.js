import * as session from '$lib/db/session';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
  runtime: 'nodejs18.x' // see https://github.com/sveltejs/svelte/pull/9136
};

export async function load({ request }) {
	return {
		user: session.from_cookie(request.headers.get('cookie'))
	};
}
