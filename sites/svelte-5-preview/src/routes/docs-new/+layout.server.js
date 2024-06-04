export async function load({ url }) {
	if (url.pathname === '/docs') {
		return {
			sections: []
		};
	}

	const { get_docs_data, get_docs_list } = await import('../docs/render.js');

	const sections = get_docs_list(await get_docs_data('./src/routes/docs-new/content', 'docs-new'));
	sections.push(
		{
			title: 'Reference - Runes',
			pages: [
				{ title: '$state' },
				{ title: '$derived' },
				{ title: '$effect' },
				{ title: '$props' },
				{ title: '$inspect' },
				{ title: '$host' }
			]
		},
		{
			title: 'Reference - Imports',
			pages: [
				{ title: 'svelte' },
				{ title: 'svelte/reactivity' },
				{ title: 'svelte/server' },
				{ title: `svelte/elements` },
				{ title: `svelte/store` },
				{ title: `svelte/actions` },
				{ title: `svelte/transition` },
				{ title: `svelte/animate` },
				{ title: `svelte/motion` },
				{ title: `svelte/easing` },
				{ title: `svelte/compiler` }
			]
		},
		{
			title: 'Reference - Other',
			pages: [{ title: 'Warnings' }, { title: 'Errors' }]
		}
	);

	return {
		sections
		// sections: /** @type {Array<{title: string; pages: Array<{title: string }>}>} */ ([
		// 	{ title: 'Introduction', pages: [{ title: 'Overview' }, { title: 'Getting started' }] },
		// 	{
		// 		title: 'Template syntax',
		// 		pages: [
		// 			{ title: 'Component fundamentals' },
		// 			{ title: 'Basic markup' },
		// 			{ title: 'Control flow' },
		// 			{ title: 'Snippets' },
		// 			{ title: 'Styles & Classes' },
		// 			{ title: 'Transitions & Animations' },
		// 			{ title: 'Bindings' },
		// 			{ title: 'Actions' },
		// 			{ title: 'Special elements' }
		// 		]
		// 	},
		// 	{
		// 		title: 'Runes',
		// 		pages: [{ title: 'State' }, { title: 'Side effects' }]
		// 	},
		// 	{
		// 		title: 'Runtime',
		// 		pages: [
		// 			{ title: 'Stores' },
		// 			{ title: 'Context' },
		// 			{ title: 'Lifecycle hooks' },
		// 			{ title: 'Imperative component API' }
		// 		]
		// 	},
		// 	{
		// 		title: 'Misc',
		// 		pages: [
		// 			{ title: 'Debugging' },
		// 			{ title: 'Testing' },
		// 			{ title: 'TypeScript' },
		// 			{ title: 'Custom elements API' },
		// 			{ title: 'Legacy syntax' },
		// 			{ title: 'Reactivity indepth' },
		// 			{ title: 'Svelte 5 migration guide' }
		// 		]
		// 	},
		// 	// {
		// 	// 	title: 'Reference',
		// 	// 	pages: [
		// 	// 		{ title: 'Runes' },
		// 	// 		{ title: 'svelte' },
		// 	// 		{ title: 'svelte/reactivity' },
		// 	// 		{ title: 'svelte/server' },
		// 	// 		{ title: `svelte/elements` },
		// 	// 		{ title: `svelte/store` },
		// 	// 		{ title: `svelte/actions` },
		// 	// 		{ title: `svelte/transition` },
		// 	// 		{ title: `svelte/animate` },
		// 	// 		{ title: `svelte/motion` },
		// 	// 		{ title: `svelte/easing` },
		// 	// 		{ title: `svelte/compiler` },
		// 	// 		{ title: 'Warnings' }
		// 	// 	]
		// 	// },
		// ])
	};
}
