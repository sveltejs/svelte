/**
 * Map of elements that have certain elements that are not allowed inside them, in the sense that they will auto-close the parent/ancestor element.
 * Theoretically one could take advantage of it but most of the time it will just result in confusing behavior and break when SSR'd.
 * There are more elements that are invalid inside other elements, but they're not auto-closed and so don't break SSR and are therefore not listed here.
 * @type {Record<string, { direct: string[]} | { descendant: string[]; reset_by?: string[] }>}
 */
const autoclosing_children = {
	// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
	li: { direct: ['li'] },
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dt#technical_summary
	dt: { descendant: ['dt', 'dd'], reset_by: ['dl'] },
	dd: { descendant: ['dt', 'dd'], reset_by: ['dl'] },
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
 * @type {Record<string, { direct: string[]} | { descendant: string[]; reset_by?: string[]; only?: string[] } | { only: string[] }>}
 */
const disallowed_children = {
	...autoclosing_children,
	optgroup: { only: ['option', '#text'] },
	// Strictly speaking, seeing an <option> doesn't mean we're in a <select>, but we assume it here
	option: { only: ['#text'] },
	form: { descendant: ['form'] },
	a: { descendant: ['a'] },
	button: { descendant: ['button'] },
	h1: { descendant: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
	h2: { descendant: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
	h3: { descendant: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
	h4: { descendant: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
	h5: { descendant: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
	h6: { descendant: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inselect
	select: { only: ['option', 'optgroup', '#text', 'hr', 'script', 'template'] },

	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incaption
	// No special behavior since these rules fall back to "in body" mode for
	// all except special table nodes which cause bad parsing behavior anyway.

	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
	tr: { only: ['th', 'td', 'style', 'script', 'template'] },
	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intbody
	tbody: { only: ['tr', 'style', 'script', 'template'] },
	thead: { only: ['tr', 'style', 'script', 'template'] },
	tfoot: { only: ['tr', 'style', 'script', 'template'] },
	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incolgroup
	colgroup: { only: ['col', 'template'] },
	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intable
	table: {
		only: ['caption', 'colgroup', 'tbody', 'thead', 'tfoot', 'style', 'script', 'template']
	},
	// https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
	head: {
		only: [
			'base',
			'basefont',
			'bgsound',
			'link',
			'meta',
			'title',
			'noscript',
			'noframes',
			'style',
			'script',
			'template'
		]
	},
	// https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
	html: { only: ['head', 'body', 'frameset'] },
	frameset: { only: ['frame'] },
	'#document': { only: ['html'] }
};

/**
 * Returns an error message if the tag is not allowed inside the ancestor tag (which is grandparent and above) such that it will result
 * in the browser repairing the HTML, which will likely result in an error during hydration.
 * @param {string} child_tag
 * @param {string[]} ancestors All nodes starting with the parent, up until the ancestor, which means two entries minimum
 * @param {string} [child_loc]
 * @param {string} [ancestor_loc]
 * @returns {string | null}
 */
export function is_tag_valid_with_ancestor(child_tag, ancestors, child_loc, ancestor_loc) {
	if (child_tag.includes('-')) return null; // custom elements can be anything

	const ancestor_tag = ancestors[ancestors.length - 1];
	const disallowed = disallowed_children[ancestor_tag];
	if (!disallowed) return null;

	if ('reset_by' in disallowed && disallowed.reset_by) {
		for (let i = ancestors.length - 2; i >= 0; i--) {
			const ancestor = ancestors[i];
			if (ancestor.includes('-')) return null; // custom elements can be anything

			// A reset means that forbidden descendants are allowed again
			if (disallowed.reset_by.includes(ancestors[i])) {
				return null;
			}
		}
	}

	if ('descendant' in disallowed && disallowed.descendant.includes(child_tag)) {
		const child = child_loc ? `\`<${child_tag}>\` (${child_loc})` : `\`<${child_tag}>\``;
		const ancestor = ancestor_loc
			? `\`<${ancestor_tag}>\` (${ancestor_loc})`
			: `\`<${ancestor_tag}>\``;

		return `${child} cannot be a descendant of ${ancestor}`;
	}

	return null;
}

/**
 * Returns an error message if the tag is not allowed inside the parent tag such that it will result
 * in the browser repairing the HTML, which will likely result in an error during hydration.
 * @param {string} child_tag
 * @param {string} parent_tag
 * @param {string} [child_loc]
 * @param {string} [parent_loc]
 * @returns {string | null}
 */
export function is_tag_valid_with_parent(child_tag, parent_tag, child_loc, parent_loc) {
	if (child_tag.includes('-') || parent_tag?.includes('-')) return null; // custom elements can be anything

	if (parent_tag === 'template') return null; // no errors or warning should be thrown in immediate children of template tags

	const disallowed = disallowed_children[parent_tag];

	const child = child_loc ? `\`<${child_tag}>\` (${child_loc})` : `\`<${child_tag}>\``;
	const parent = parent_loc ? `\`<${parent_tag}>\` (${parent_loc})` : `\`<${parent_tag}>\``;

	if (disallowed) {
		if ('direct' in disallowed && disallowed.direct.includes(child_tag)) {
			return `${child} cannot be a direct child of ${parent}`;
		}

		if ('descendant' in disallowed && disallowed.descendant.includes(child_tag)) {
			return `${child} cannot be a child of ${parent}`;
		}

		if ('only' in disallowed && disallowed.only) {
			if (disallowed.only.includes(child_tag)) {
				return null;
			} else {
				return `${child} cannot be a child of ${parent}. \`<${parent_tag}>\` only allows these children: ${disallowed.only.map((d) => `\`<${d}>\``).join(', ')}`;
			}
		}
	}

	// These tags are only valid with a few parents that have special child
	// parsing rules - if we're down here, then none of those matched and
	// so we allow it only if we don't know what the parent is, as all other
	// cases are invalid (and we only get into this function if we know the parent).
	switch (child_tag) {
		case 'body':
		case 'caption':
		case 'col':
		case 'colgroup':
		case 'frameset':
		case 'frame':
		case 'head':
		case 'html':
			return `${child} cannot be a child of ${parent}`;
		case 'thead':
		case 'tbody':
		case 'tfoot':
			return `${child} must be the child of a \`<table>\`, not a ${parent}`;
		case 'td':
		case 'th':
			return `${child} must be the child of a \`<tr>\`, not a ${parent}`;
		case 'tr':
			return `\`<tr>\` must be the child of a \`<thead>\`, \`<tbody>\`, or \`<tfoot>\`, not a ${parent}`;
	}

	return null;
}
