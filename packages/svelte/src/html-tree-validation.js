/**
 * Map of elements that have certain elements that are not allowed inside them, in the sense that they will auto-close the parent/ancestor element.
 * Theoretically one could take advantage of it but most of the time it will just result in confusing behavior and break when SSR'd.
 * There are more elements that are invalid inside other elements, but they're not auto-closed and so don't break SSR and are therefore not listed here.
 * @type {Record<string, { direct: string[]} | { descendant: string[] }>}
 */
const autoclosing_children = {
	// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
	li: { direct: ['li'] },
	dt: { descendant: ['dt', 'dd'] },
	dd: { descendant: ['dt', 'dd'] },
	p: {
		descendant: [
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
		]
	},
	rt: { descendant: ['rt', 'rp'] },
	rp: { descendant: ['rt', 'rp'] },
	optgroup: { descendant: ['optgroup'] },
	option: { descendant: ['option', 'optgroup'] },
	thead: { direct: ['tbody', 'tfoot'] },
	tbody: { direct: ['tbody', 'tfoot'] },
	tfoot: { direct: ['tbody'] },
	tr: { direct: ['tr', 'tbody'] },
	td: { direct: ['td', 'th', 'tr'] },
	th: { direct: ['td', 'th', 'tr'] }
};

const interactive_elements = [
	// while `input` is also an interactive element, it is never moved by the browser, so we don't need to check for it
	'a',
	'button',
	'iframe',
	'embed',
	'select',
	'textarea'
];

for (const interactive_element of interactive_elements) {
	autoclosing_children[interactive_element] = { descendant: interactive_elements };
}

/**
 * Returns true if the tag is either the last in the list of siblings and will be autoclosed,
 * or not allowed inside the parent tag such that it will auto-close it. The latter results
 * in the browser repairing the HTML, which will likely result in an error during hydration.
 * @param {string} current
 * @param {string} [next]
 */
export function closing_tag_omitted(current, next) {
	const disallowed = autoclosing_children[current];
	if (disallowed) {
		if (
			!next ||
			('direct' in disallowed ? disallowed.direct : disallowed.descendant).includes(next)
		) {
			return true;
		}
	}
	return false;
}

/**
 * Map of elements that have certain elements that are not allowed inside them, in the sense that the browser will somehow repair the HTML.
 * There are more elements that are invalid inside other elements, but they're not repaired and so don't break SSR and are therefore not listed here.
 * @type {Record<string, { direct: string[]} | { descendant: string[] } | { only: string[] }>}
 */
const disallowed_children = {
	...autoclosing_children,
	form: { descendant: ['form'] },
	a: { descendant: ['a'] },
	button: { descendant: ['button'] },
	select: { only: ['option', 'optgroup', '#text', 'hr', 'script', 'template'] }
};

/**
 * Returns false if the tag is not allowed inside the ancestor tag (which is grandparent and above) such that it will result
 * in the browser repairing the HTML, which will likely result in an error during hydration.
 * @param {string} tag
 * @param {string | null} ancestor Must not be the parent, but higher up the tree
 * @returns {boolean}
 */
export function is_tag_valid_with_ancestor(tag, ancestor) {
	const disallowed = ancestor && autoclosing_children[ancestor];
	return !disallowed || ('descendant' in disallowed ? !disallowed.descendant.includes(tag) : true);
}

// https://html.spec.whatwg.org/multipage/syntax.html#generate-implied-end-tags
const implied_end_tags = ['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'];

/**
 * Returns false if the tag is not allowed inside the parent tag such that it will result
 * in the browser repairing the HTML, which will likely result in an error during hydration.
 * @param {string} tag
 * @param {string | null} parent_tag
 * @returns {boolean}
 */
export function is_tag_valid_with_parent(tag, parent_tag) {
	const disallowed = parent_tag && autoclosing_children[parent_tag];
	if (
		disallowed &&
		('direct' in disallowed ? disallowed.direct : disallowed.descendant).includes(tag)
	) {
		return false;
	}

	// First, let's check if we're in an unusual parsing mode...
	switch (parent_tag) {
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inselect
		case 'select':
			return (
				tag === 'option' ||
				tag === 'optgroup' ||
				tag === '#text' ||
				tag === 'hr' ||
				tag === 'script' ||
				tag === 'template'
			);
		case 'optgroup':
			return tag === 'option' || tag === '#text';
		// Strictly speaking, seeing an <option> doesn't mean we're in a <select>
		// but
		case 'option':
			return tag === '#text';
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incaption
		// No special behavior since these rules fall back to "in body" mode for
		// all except special table nodes which cause bad parsing behavior anyway.

		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intr
		case 'tr':
			return (
				tag === 'th' || tag === 'td' || tag === 'style' || tag === 'script' || tag === 'template'
			);
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intbody
		case 'tbody':
		case 'thead':
		case 'tfoot':
			return tag === 'tr' || tag === 'style' || tag === 'script' || tag === 'template';
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incolgroup
		case 'colgroup':
			return tag === 'col' || tag === 'template';
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intable
		case 'table':
			return (
				tag === 'caption' ||
				tag === 'colgroup' ||
				tag === 'tbody' ||
				tag === 'tfoot' ||
				tag === 'thead' ||
				tag === 'style' ||
				tag === 'script' ||
				tag === 'template'
			);
		// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
		case 'head':
			return (
				tag === 'base' ||
				tag === 'basefont' ||
				tag === 'bgsound' ||
				tag === 'link' ||
				tag === 'meta' ||
				tag === 'title' ||
				tag === 'noscript' ||
				tag === 'noframes' ||
				tag === 'style' ||
				tag === 'script' ||
				tag === 'template'
			);
		// https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
		case 'html':
			return tag === 'head' || tag === 'body' || tag === 'frameset';
		case 'frameset':
			return tag === 'frame';
		case '#document':
			return tag === 'html';
	}

	// Probably in the "in body" parsing mode, so we outlaw only tag combos
	// where the parsing rules cause implicit opens or closes to be added.
	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
	switch (tag) {
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
			return (
				parent_tag !== 'h1' &&
				parent_tag !== 'h2' &&
				parent_tag !== 'h3' &&
				parent_tag !== 'h4' &&
				parent_tag !== 'h5' &&
				parent_tag !== 'h6'
			);

		case 'rp':
		case 'rt':
			return parent_tag == null || implied_end_tags.indexOf(parent_tag) === -1;

		case 'body':
		case 'caption':
		case 'col':
		case 'colgroup':
		case 'frameset':
		case 'frame':
		case 'head':
		case 'html':
		case 'tbody':
		case 'td':
		case 'tfoot':
		case 'th':
		case 'thead':
		case 'tr':
			// These tags are only valid with a few parents that have special child
			// parsing rules -- if we're down here, then none of those matched and
			// so we allow it only if we don't know what the parent is, as all other
			// cases are invalid.
			return parent_tag == null;
	}

	return true;
}
