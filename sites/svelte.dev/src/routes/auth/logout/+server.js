import * as cookie from 'cookie';
import * as session from '$lib/db/session';

export async function GET({ request, url }) {
	const cookies = cookie.parse(request.headers.get('cookie') || '');
	await session.destroy(cookies.sid);

	return new Response(undefined, {
		headers: {
			'Set-Cookie': cookie.serialize('sid', '', {
				maxAge: -1,
				path: '/',
				httpOnly: true,
				secure: url.protocol === 'https'
			})
		}
	});
}
