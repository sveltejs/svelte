import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	const query = url.searchParams;
	const gist = query.get('gist');
	const example = query.get('example');
	const version = query.get('version');

	// redirect to v2 REPL if appropriate
	if (/^[^>]?[12]/.test(version)) {
		throw redirect(302, `https://v2.svelte.dev/repl?${query}`);
	}

	const id = gist || example || 'hello-world';
	const q = version ? `?version=${version}` : ``;

	throw redirect(301, `/repl/${id}${q}`);
}
