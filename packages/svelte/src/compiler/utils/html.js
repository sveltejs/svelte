const interactive_elements = ['a', 'button', 'iframe', 'embed', 'select', 'textarea'];

/** @type {Record<string, string[]>} */
export const disallowed_children = {
	dd: ['dd', 'dt'],
	dt: ['dd', 'dt'],
	form: ['form'],
	li: ['li'],
	optgroup: ['optgroup'],
	option: ['option', 'optgroup'],
	p: [
		'address',
		'article',
		'aside',
		'blockquote',
		'div',
		'dl',
		'fieldset',
		'footer',
		'form',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'header',
		'hgroup',
		'hr',
		'main',
		'menu',
		'nav',
		'ol',
		'p',
		'pre',
		'section',
		'table',
		'ul'
	],
	rp: ['rp', 'rt'],
	rt: ['rp', 'rt'],
	tbody: ['tbody', 'tfoot'],
	td: ['td', 'th', 'tr'],
	th: ['td', 'th', 'tr'],
	tfoot: ['tbody'],
	thead: ['tbody', 'tfoot'],
	tr: ['tr', 'tbody']
};

for (const interactive_element of interactive_elements) {
	disallowed_children[interactive_element] = [...interactive_elements];
}

/** @type {Record<string, string[]>} */
export const disallowed_parents = {};

for (const parent in disallowed_children) {
	for (const child of disallowed_children[parent]) {
		(disallowed_parents[child] ??= []).push(parent);
	}
}
