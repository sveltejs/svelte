import * as session from '$lib/db/session';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	// regions: ['pdx1', 'sfo1', 'cle1', 'iad1'],
	regions: 'all',
	runtime: 'edge'
};

export async function load({ request }) {
	return {
		user: session.from_cookie(request.headers.get('cookie'))
	};
}
