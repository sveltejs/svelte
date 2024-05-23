import { hydrate_anchor, hydrate_nodes, hydrating } from './hydration.js';
import { DEV } from 'esm-env';
import { init_array_prototype_warnings } from '../dev/equality.js';

// We cache the Node and Element prototype methods, so that we can avoid doing
// expensive prototype chain lookups.

/** @type {Node} */
var node_prototype;

/** @type {Element} */
var element_prototype;

/** @type {Text} */
var text_prototype;

// export these for reference in the compiled code, making global name deduplication unnecessary
/**
 * @type {Window}
 */
export var $window;
/**
 * @type {Document}
 */
export var $document;

/**
 * Initialize these lazily to avoid issues when using the runtime in a server context
 * where these globals are not available while avoiding a separate server entry point
 */
export function init_operations() {
	if (node_prototype !== undefined) {
		return;
	}

	node_prototype = Node.prototype;
	element_prototype = Element.prototype;
	text_prototype = Text.prototype;

	$window = window;
	$document = document;

	// the following assignments improve perf of lookups on DOM nodes
	// @ts-expect-error
	element_prototype.__click = undefined;
	// @ts-expect-error
	text_prototype.__nodeValue = ' ';
	// @ts-expect-error
	element_prototype.__className = '';
	// @ts-expect-error
	element_prototype.__attributes = null;
	// @ts-expect-error
	element_prototype.__e = undefined;

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

	// when we _are_ hydrating, `fragment` is an array of nodes
	const first_node = /** @type {import('#client').TemplateNode[]} */ (fragment)[0];

	// if an {expression} is empty during SSR, there might be no
	// text node to hydrate — we must therefore create one
	if (is_text && first_node?.nodeType !== 3) {
		const text = empty();
		hydrate_nodes.unshift(text);
		first_node?.before(text);
		return text;
	}

	return hydrate_anchor(first_node);
}

/**
 * @template {Node} N
 * @param {N} node
 * @param {boolean} is_text
 * @returns {Node | null}
 */
/*#__NO_SIDE_EFFECTS__*/
export function sibling(node, is_text = false) {
	const next_sibling = node.nextSibling;

	if (!hydrating) {
		return next_sibling;
	}

	// if a sibling {expression} is empty during SSR, there might be no
	// text node to hydrate — we must therefore create one
	if (is_text && next_sibling?.nodeType !== 3) {
		const text = empty();
		if (next_sibling) {
			const index = hydrate_nodes.indexOf(/** @type {Text | Comment | Element} */ (next_sibling));
			hydrate_nodes.splice(index, 0, text);
			next_sibling.before(text);
		} else {
			hydrate_nodes.push(text);
		}

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
