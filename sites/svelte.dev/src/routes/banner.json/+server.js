import { json } from '@sveltejs/kit';
import { defineBanner } from '@sveltejs/site-kit/components';

export const prerender = true;

// This server route is used by all Svelte sites to load info about which banner to show.
// site-kit contains components/helpers to make fetching+displaying them easier.
export const GET = async () => {
	return json(
		defineBanner([
			{
				id: 'advent2023',
				start: new Date('1 Dec, 2023 00:00:00 UTC'),
				end: new Date('24 Dec, 2023 23:59:59 UTC'),
				arrow: true,
				content: {
					lg: 'Advent of Svelte 2023 is here!',
					sm: 'Advent of Svelte'
				},
				href: 'https://advent.sveltesociety.dev/'
			},

			// This one skips the blog post and just changes the link
			{
				id: 'advent2023-finished',
				start: new Date('25 Dec, 2023 00:00:00 UTC'),
				end: new Date('1 Jan, 2024 00:00:00 UTC'),
				arrow: true,
				content: {
					lg: 'Advent of Svelte 2023 is over. See you next year!',
					sm: 'Advent of Svelte 2023 is over!'
				},
				href: 'https://advent.sveltesociety.dev/'
				// scope: ['svelte.dev, kit.svelte.dev'] // Dont show on learn.svelte.dev by not adding it to the array
			}
		])
	);
};
