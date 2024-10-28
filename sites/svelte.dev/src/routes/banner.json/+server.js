import { json } from '@sveltejs/kit';
import { defineBanner } from '@sveltejs/site-kit/components';

export const prerender = true;

// This server route is used by all Svelte sites to load info about which banner to show.
// site-kit contains components/helpers to make fetching+displaying them easier.
export const GET = async () => {
	return json(
		defineBanner([
			{
				id: 'deprecated',
				start: new Date('1 Dec, 2023 00:00:00 UTC'),
				end: new Date('24 Dec, 2050 23:59:59 UTC'),
				arrow: true,
				content: {
					lg: 'This documentation is for Svelte 3 and 4. Go to the latest docs.',
					sm: 'These docs are for Svelte 3/4'
				},
				href: 'https://svelte.dev/'
			}
		])
	);
};
