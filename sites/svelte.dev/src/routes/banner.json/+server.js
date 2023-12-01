import { json } from '@sveltejs/kit';

export const GET = async () => {
	return json(
		/** @satisfies {Awaited<ReturnType<typeof import('@sveltejs/site-kit/components').fetchBanner>>} */ ([
			{
				id: 'advent2023',
				start: new Date('1 Dec, 2023 00:00:00 UTC'),
				end: new Date('24 Dec, 2024 23:59:59 UTC'),
				arrow: true,
				content: 'Svelte Advent 2023 is here!',
				href: 'https://advent.sveltesociety.dev/'
			},

			// This one skips the blog post and just changes the link
			{
				id: 'after-runes',
				start: new Date('25 Dec, 2023 00:00:00 UTC'),
				end: new Date('15 Jan, 2024 23:59:59 UTC'),
				arrow: true,
				content: 'Svelte Advent 2023 is over. See you next year!',
				href: 'https://advent.sveltesociety.dev/'
			}
		])
	);
};
