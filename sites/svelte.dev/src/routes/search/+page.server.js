import { init, inited, search } from '@sveltejs/site-kit/search';

export async function load({ url, fetch }) {
	if (!inited) {
		const res = await fetch('/content.json');
		if (!res.ok) throw new Error("Couldn't fetch content");

		const blocks = (await res.json()).blocks;
		init(blocks);
	}

	const query = url.searchParams.get('q');

	const results = query ? search(query) : [];

	return {
		query,
		results
	};
}
