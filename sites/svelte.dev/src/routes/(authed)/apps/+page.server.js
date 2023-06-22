import * as gist from '$lib/db/gist';

export async function load({ url, parent }) {
	let gists = [];
	let next = null;

	const search = url.searchParams.get('search');

	const { user } = await parent();

	if (user) {
		const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')) : 0;
		const search = url.searchParams.get('search');

		({ gists, next } = await gist.list(user, { offset, search }));
	}

	return { user, gists, next, search };
}
