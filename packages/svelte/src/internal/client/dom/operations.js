import { hydrate_anchor, hydrate_start, hydrating } from './hydration.js';
import { DEV } from 'esm-env';
import { init_array_prototype_warnings } from '../dev/equality.js';
import { current_effect } from '../runtime.js';
import { HYDRATION_ANCHOR } from '../../../constants.js';

// export these for reference in the compiled code, making global name deduplication unnecessary
/** @type {Window} */
export var $window;

/** @type {Document} */
export var $document;

/**
 * Initialize these lazily to avoid issues when using the runtime in a server context
 * where these globals are not available while avoiding a separate server entry point
 */
export function init_operations() {
	if ($window !== undefined) {
		return;
	}

	$window = window;
	$document = document;

	var element_prototype = Element.prototype;

	// the following assignments improve perf of lookups on DOM nodes
	// @ts-expect-error
	element_prototype.__click = undefined;
	// @ts-expect-error
	element_prototype.__className = '';
	// @ts-expect-error
	element_prototype.__attributes = null;
	// @ts-expect-error
	element_prototype.__e = undefined;

	// @ts-expect-error
	Text.prototype.__nodeValue = ' ';

	if (DEV) {
		// @ts-expect-error
		element_prototype.__svelte_meta = null;

		init_array_prototype_warnings();
	}
}

/** @returns {Text} */
export function empty() {
	return document.createTextNode('');
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {Node | null}
 */
/*#__NO_SIDE_EFFECTS__*/
export function child(node) {
	const child = node.firstChild;
	if (!hydrating) return child;

	// Child can be null if we have an element with a single child, like `<p>{text}</p>`, where `text` is empty
	if (child === null) {
		return node.appendChild(empty());
	}

	return hydrate_anchor(child);
}

/**
 * @param {DocumentFragment | import('#client').TemplateNode[]} fragment
 * @param {boolean} is_text
 * @returns {Node | null}
 */
/*#__NO_SIDE_EFFECTS__*/
export function first_child(fragment, is_text) {
	if (!hydrating) {
		// when not hydrating, `fragment` is a `DocumentFragment` (the result of calling `open_frag`)
		return /** @type {DocumentFragment} */ (fragment).firstChild;
	}

	// if an {expression} is empty during SSR, there might be no
	// text node to hydrate — we must therefore create one
	if (is_text && hydrate_start?.nodeType !== 3) {
		var text = empty();
		var dom = /** @type {import('#client').TemplateNode[]} */ (
			/** @type {import('#client').Effect} */ (current_effect).dom
		);

		dom.unshift(text);
		hydrate_start?.before(text);

		return text;
	}

	return hydrate_anchor(hydrate_start);
}

/**
 * @template {Node} N
 * @param {N} node
 * @param {boolean} is_text
 * @returns {Node | null}
 */
/*#__NO_SIDE_EFFECTS__*/
export function sibling(node, is_text = false) {
	var next_sibling = /** @type {import('#client').TemplateNode} */ (node.nextSibling);

	if (!hydrating) {
		return next_sibling;
	}

	var type = next_sibling.nodeType;

	if (type === 8 && /** @type {Comment} */ (next_sibling).data === HYDRATION_ANCHOR) {
		return sibling(next_sibling, is_text);
	}

	// if a sibling {expression} is empty during SSR, there might be no
	// text node to hydrate — we must therefore create one
	if (is_text && type !== 3) {
		var text = empty();
		var dom = /** @type {import('#client').TemplateNode[]} */ (
			/** @type {import('#client').Effect} */ (current_effect).dom
		);

		dom.unshift(text);
		next_sibling?.before(text);

		return text;
	}

	return hydrate_anchor(/** @type {Node} */ (next_sibling));
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {void}
 */
export function clear_text_content(node) {
	node.textContent = '';
}

/** @param {string} name */
/*#__NO_SIDE_EFFECTS__*/
export function create_element(name) {
	return document.createElement(name);
}
