import * as gist from '$lib/db/gist';

export async function load({ url, parent }) {
	let gists = [];
	let next = null;

	const search = url.searchParams.get('search');

	const { user } = await parent();

	if (user) {
		const offset_param = url.searchParams.get('offset');
		const offset = offset_param ? parseInt(offset_param) : 0;
		const search = url.searchParams.get('search');

		({ gists, next } = await gist.list(user, { offset, search }));
	}

	return { user, gists, next, search };
}
