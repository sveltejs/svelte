import { json } from '@sveltejs/kit';

/**
 * @typedef {(import('svelte').ComponentProps<import('@sveltejs/site-kit/components').Banner> & { content: string })[]} BannerData
 */

export const GET = async () => {
	return json(
		/** @satisfies {BannerData} */ ([
			{
				id: 'runes',
				start: new Date('20 Oct, 2023 00:00:00 UTC'),
				end: new Date('20 Dec, 2023 23:59:59 UTC'),
				arrow: true,
				content: 'Introducing the upcoming Svelte 5 API: Runes',
				href: 'https://svelte.dev/blog/runes'
			},

			// This one skips the blog post and just changes the link
			{
				id: 'after-runes',
				start: new Date('21 Dec, 2023 00:00:00 UTC'),
				end: new Date('30 Dec, 2023 23:59:59 UTC'),
				arrow: true,
				content: 'Introducing the upcoming Svelte 5 API: Runes',
				href: 'https://svelte-5-preview.vercel.app/docs/introduction'
			}
		])
	);
};
