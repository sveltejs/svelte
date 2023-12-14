import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	const query = url.searchParams;
	const gist = query.get('gist');
	const example = query.get('example');
	const version = query.get('version');
	const vim = query.get('vim');

	// redirect to v2 REPL if appropriate
	if (version && /^[^>]?[12]/.test(version)) {
		redirect(302, `https://v2.svelte.dev/repl?${query}`);
	}

	const id = gist || example || 'hello-world';
	// we need to filter out null values
	const q = new URLSearchParams();
	if (version) q.set('version', version);
	if (vim) q.set('vim', vim);
	redirect(301, `/repl/${id}?${q}`);
}
