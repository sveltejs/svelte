export const load = async ({ url, fetch }) => {
	const nav_list = await fetch('/nav.json').then((r) => r.json());

	return {
		nav: {
			title: get_nav_title(url),
			links: nav_list
		},
		search: {
			priority_map: get_search_priority_list()
		}
	};
};

/** @returns {Record<string, number>} */
function get_search_priority_list() {
	return {
		'docs/v4-migration-guide': 2,
		'docs/typescript': 3,
		docs: 4
	};
}

/** @param {URL} url */
function get_nav_title(url) {
	const list = new Map([
		[/^docs/, 'Docs'],
		[/^repl/, 'REPL'],
		[/^blog/, 'Blog'],
		[/^faq/, 'FAQ'],
		[/^tutorial/, 'Tutorial'],
		[/^search/, 'Search'],
		[/^examples/, 'Examples']
	]);

	for (const [regex, title] of list) {
		if (regex.test(url.pathname.replace(/^\/(.+)/, '$1'))) {
			return title;
		}
	}

	return '';
}
