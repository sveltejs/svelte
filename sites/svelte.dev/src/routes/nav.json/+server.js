import { get_docs_data, get_docs_list } from '$lib/server/docs/index.js';
import { get_tutorial_list, get_tutorial_data } from '$lib/server/tutorial/index.js';
import { json } from '@sveltejs/kit';

export const prerender = true;

export const GET = async () => {
	return json(await get_nav_list());
};

/**
 * @returns {Promise<import('@sveltejs/site-kit').NavigationLink[]>}
 */
async function get_nav_list() {
	const [docs_list, tutorial_list] = await Promise.all([
		get_docs_list(await get_docs_data()),
		get_tutorial_list(await get_tutorial_data())
	]);

	const processed_docs_list = docs_list.map(({ title, pages }) => ({
		title,
		sections: pages.map(({ title, path }) => ({ title, path }))
	}));

	const processed_tutorial_list = tutorial_list.map(({ title, tutorials }) => ({
		title,
		sections: tutorials.map(({ title, slug }) => ({ title, path: '/tutorial/' + slug }))
	}));

	return [
		{
			title: 'Docs',
			prefix: 'docs',
			pathname: '/docs/introduction',
			sections: [
				{
					title: 'DOCS',
					sections: processed_docs_list
				}
			]
		},
		{
			title: 'Tutorial',
			prefix: 'tutorial',
			pathname: '/tutorial',
			sections: [
				{
					title: 'TUTORIAL',
					sections: processed_tutorial_list
				}
			]
		},
		{
			title: 'REPL',
			prefix: 'repl',
			pathname: 'https://svelte.dev/playground'
		},
		{
			title: 'Blog',
			prefix: 'blog',
			pathname: 'https://svelte.dev/blog'
		}
	];
}
