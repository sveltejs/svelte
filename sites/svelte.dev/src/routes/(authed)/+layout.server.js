import * as session from '$lib/db/session';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	regions: ['iad1', 'cle1'], // our supabase instance is in us-east-1. stay close to it
	runtime: 'edge'
};

export async function load({ request }) {
	return {
		user: session.from_cookie(request.headers.get('cookie'))
	};
}
