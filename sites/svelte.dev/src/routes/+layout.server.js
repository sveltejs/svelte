import { get_docs_data, get_docs_list } from '$lib/server/docs/index.js';

const list = new Map([
	[/^docs/, 'Docs'],
	[/^repl/, 'REPL'],
	[/^blog/, 'Blog'],
	[/^faq/, 'FAQ'],
	[/^tutorial/, 'Tutorial'],
	[/^search/, 'Search'],
	[/^examples/, 'Examples']
]);

/** @param {URL} url */
function get_nav_title(url) {
	for (const [regex, title] of list) {
		if (regex.test(url.pathname.replace(/^\/(.+)/, '$1'))) {
			return title;
		}
	}

	return '';
}

/** @param {URL} url */
async function get_nav_context_list(url) {
	const [docs_data] = await Promise.all([get_docs_data()]);

	const docs_list = get_docs_list(docs_data);
	const slug = url.pathname.replace(/^\/docs\/(.+)/, '$1');
	const docs_on_the_page =
		url.pathname.startsWith('/docs') &&
		docs_data
			.find(({ pages }) => pages.find((page) => slug === page.slug))
			.pages.find((page) => slug === page.slug);

	return {
		docs: { contents: docs_list, pageContents: docs_on_the_page }
	};
}

export const load = async ({ url }) => {
	return {
		nav_title: get_nav_title(url),
		nav_context_list: get_nav_context_list(url)
	};
};
