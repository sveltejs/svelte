import { get_blog_data, get_blog_list } from '$lib/server/blog/index.js';
import { get_docs_data, get_docs_list } from '$lib/server/docs/index.js';
import { get_examples_data, get_examples_list } from '$lib/server/examples/index.js';
import { get_tutorial_data, get_tutorial_list } from '$lib/server/tutorial/index.js';
import { json } from '@sveltejs/kit';

export const prerender = true;

export const GET = async () => {
	return json(await get_nav_list());
};

/**
 * @returns {Promise<import('@sveltejs/site-kit').NavigationLink[]>}
 */
async function get_nav_list() {
	const docs_list = get_docs_list(get_docs_data());
	const processed_docs_list = docs_list.map(({ title, pages }) => ({
		title,
		sections: pages.map(({ title, path }) => ({ title, path }))
	}));

	const blog_list = get_blog_list(get_blog_data());
	const processed_blog_list = [
		{
			title: 'Blog',
			sections: blog_list.map(({ title, slug, date }) => ({
				title,
				path: '/blog/' + slug,
				// Put a NEW badge on blog posts that are less than 14 days old
				badge: (+new Date() - +new Date(date)) / (1000 * 60 * 60 * 24) < 14 ? 'NEW' : undefined
			}))
		}
	];

	const tutorial_list = get_tutorial_list(get_tutorial_data());
	const processed_tutorial_list = tutorial_list.map(({ title, tutorials }) => ({
		title,
		sections: tutorials.map(({ title, slug }) => ({ title, path: '/tutorial/' + slug }))
	}));

	const examples_list = get_examples_list(get_examples_data());
	const processed_examples_list = examples_list
		.map(({ title, examples }) => ({
			title,
			sections: examples.map(({ title, slug }) => ({ title, path: '/examples/' + slug }))
		}))
		.filter(({ title }) => title !== 'Embeds');

	return [
		{
			title: 'Tutorial',
			prefix: 'tutorial',
			pathname: '/tutorial',
			sections: processed_tutorial_list
		},
		{
			title: 'Docs',
			prefix: 'docs',
			pathname: '/docs/introduction',
			sections: processed_docs_list
		},
		{
			title: 'Examples',
			prefix: 'examples',
			pathname: '/examples',
			sections: processed_examples_list
		},
		{
			title: 'REPL',
			prefix: 'repl',
			pathname: '/repl'
		},
		{
			title: 'Blog',
			prefix: 'blog',
			pathname: '/blog',
			sections: processed_blog_list
		}
	];
}
