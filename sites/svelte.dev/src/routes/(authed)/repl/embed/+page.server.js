import { redirect } from '@sveltejs/kit';

export function load({ url }) {
	if (!url.searchParams.has('gist')) {
		throw redirect(301, '/repl/hello-world/embed');
	} else {
		const searchParamsWithoutGist = new URLSearchParams(url.searchParams);
		searchParamsWithoutGist.delete('gist');
		throw redirect(
			301,
			`/repl/${url.searchParams.get('gist')}/embed?${searchParamsWithoutGist.toString()}`
		);
	}
}
