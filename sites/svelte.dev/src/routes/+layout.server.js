export const prerender = true;

const list = new Map([
	[/^docs/, 'Docs'],
	[/^repl/, 'REPL'],
	[/^blog/, 'Blog'],
	[/^faq/, 'FAQ'],
	[/^tutorial/, 'Tutorial'],
	[/^search/, 'Search'],
	[/^examples/, 'Examples']
]);

export const load = async ({ url }) => {
	let title = '';

	for (const [regex, title] of list) {
		if (regex.test(url.pathname.replace(/^\/(.+)/, '$1'))) {
			return { nav_title: title };
		}
	}

	return { nav_title: title };
};
