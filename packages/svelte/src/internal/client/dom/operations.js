/** @import { TemplateNode } from '#client' */
import { hydrate_node, hydrating, set_hydrate_node } from './hydration.js';
import { DEV } from 'esm-env';
import { init_array_prototype_warnings } from '../dev/equality.js';
import { get_descriptor, is_extensible } from '../../shared/utils.js';

// export these for reference in the compiled code, making global name deduplication unnecessary
/** @type {Window} */
export var $window;

/** @type {Document} */
export var $document;

/** @type {boolean} */
export var is_firefox;

/** @type {() => Node | null} */
var first_child_getter;
/** @type {() => Node | null} */
var next_sibling_getter;

var renderer;

/**
 * Initialize these lazily to avoid issues when using the runtime in a server context
 * where these globals are not available while avoiding a separate server entry point
 */
export function init_operations() {
	if ($window !== undefined) {
		return;
	}

	$window = typeof window === 'undefined' ? /** @type {Window} */ ({}) : window;
	$document = typeof document === 'undefined' ? /** @type {Document} */ ({}) : document;
	is_firefox = typeof navigator === 'undefined' ? true : /Firefox/.test(navigator.userAgent);

	var element_prototype;
	if (window.Element) element_prototype = Element.prototype;
	var node_prototype;
	if (window.Node) node_prototype = Node.prototype;
	var text_prototype;
	if (window.Text) text_prototype = Text.prototype;

	// @ts-ignore
	first_child_getter = get_descriptor(node_prototype, 'firstChild')?.get;
	// @ts-ignore
	next_sibling_getter = get_descriptor(node_prototype, 'nextSibling')?.get;

	if (element_prototype && is_extensible(element_prototype)) {
		// the following assignments improve perf of lookups on DOM nodes
		// @ts-expect-error
		element_prototype.__click = undefined;
		// @ts-expect-error
		element_prototype.__className = undefined;
		// @ts-expect-error
		element_prototype.__attributes = null;
		// @ts-expect-error
		element_prototype.__style = undefined;
		// @ts-expect-error
		element_prototype.__e = undefined;
	}

	if (is_extensible(text_prototype)) {
		// @ts-expect-error
		text_prototype.__t = undefined;
	}

	if (DEV) {
		// @ts-expect-error
		element_prototype.__svelte_meta = null;

		init_array_prototype_warnings();
	}
}

/**
 * @param {string} value
 * @returns {Text}
 */
export function create_text(value = '') {
	if (renderer) {
		return renderer.document.createTextNode(value);
	}
	return document.createTextNode(value);
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {Node | null}
 */
/*@__NO_SIDE_EFFECTS__*/
export function get_first_child(node) {
	if (renderer_first_child) {
		return renderer_first_child.call(node);
	}
	return first_child_getter.call(node);
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {Node | null}
 */
/*@__NO_SIDE_EFFECTS__*/
export function get_next_sibling(node) {
	if (renderer_next_sibling) {
		return renderer_next_sibling.call(node);
	}
	return next_sibling_getter.call(node);
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @template {Node} N
 * @param {N} node
 * @param {boolean} is_text
 * @returns {Node | null}
 */
export function child(node, is_text) {
	if (!hydrating) {
		return get_first_child(node);
	}

	var child = /** @type {TemplateNode} */ (get_first_child(hydrate_node));

	// Child can be null if we have an element with a single child, like `<p>{text}</p>`, where `text` is empty
	if (child === null) {
		child = hydrate_node.appendChild(create_text());
	} else if (is_text && child.nodeType !== 3) {
		var text = create_text();
		child?.before(text);
		set_hydrate_node(text);
		return text;
	}

	set_hydrate_node(child);
	return child;
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @param {DocumentFragment | TemplateNode[]} fragment
 * @param {boolean} is_text
 * @returns {Node | null}
 */
export function first_child(fragment, is_text) {
	if (!hydrating) {
		// when not hydrating, `fragment` is a `DocumentFragment` (the result of calling `open_frag`)
		var first = /** @type {DocumentFragment} */ (get_first_child(/** @type {Node} */ (fragment)));

		// TODO prevent user comments with the empty string when preserveComments is true
		if (first instanceof Comment && first.data === '') return get_next_sibling(first);

		return first;
	}

	// if an {expression} is empty during SSR, there might be no
	// text node to hydrate — we must therefore create one
	if (is_text && hydrate_node?.nodeType !== 3) {
		var text = create_text();

		hydrate_node?.before(text);
		set_hydrate_node(text);
		return text;
	}

	return hydrate_node;
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @param {TemplateNode} node
 * @param {number} count
 * @param {boolean} is_text
 * @returns {Node | null}
 */
export function sibling(node, count = 1, is_text = false) {
	let next_sibling = hydrating ? hydrate_node : node;
	var last_sibling;

	while (count--) {
		last_sibling = next_sibling;
		next_sibling = /** @type {TemplateNode} */ (get_next_sibling(next_sibling));
	}

	if (!hydrating) {
		return next_sibling;
	}

	var type = next_sibling?.nodeType;

	// if a sibling {expression} is empty during SSR, there might be no
	// text node to hydrate — we must therefore create one
	if (is_text && type !== 3) {
		var text = create_text();
		// If the next sibling is `null` and we're handling text then it's because
		// the SSR content was empty for the text, so we need to generate a new text
		// node and insert it after the last sibling
		if (next_sibling === null) {
			last_sibling?.after(text);
		} else {
			next_sibling.before(text);
		}
		set_hydrate_node(text);
		return text;
	}

	set_hydrate_node(next_sibling);
	return /** @type {TemplateNode} */ (next_sibling);
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {void}
 */
export function clear_text_content(node) {
	node.textContent = '';
}

/**
 *
 * @param {string} tag
 * @param {string} [namespace]
 * @param {string} [is]
 * @returns
 */
export function create_element(tag, namespace, is) {
	if (renderer) {
		return renderer.document.createElement(tag);
	}
	let options = is ? { is } : undefined;
	if (namespace) {
		return document.createElementNS(namespace, tag, options);
	}
	return document.createElement(tag, options);
}

export function create_fragment() {
	if (renderer) {
		return renderer.document.createDocumentFragment();
	}
	return document.createDocumentFragment();
}

/**
 * @param {string} data
 * @returns
 */
export function create_comment(data = '') {
	if (renderer) {
		return renderer.document.createComment(data);
	}
	return document.createComment(data);
}

/**
 * @param {Element} element
 * @param {string} key
 * @param {string} value
 * @returns
 */
export function set_attribute(element, key, value = '') {
	if (key.startsWith('xlink:')) {
		element.setAttributeNS('http://www.w3.org/1999/xlink', key, value);
		return;
	}
	return element.setAttribute(key, value);
}

var renderer_next_sibling;
var renderer_first_child;

export function push_renderer(custom_renderer) {
	var old_next_sibling = renderer_next_sibling;
	var old_first_child = renderer_first_child;
	var old_renderer = renderer;
	renderer_next_sibling = get_descriptor(custom_renderer.Node.prototype, 'nextSibling')?.get;
	renderer_first_child = get_descriptor(custom_renderer.Node.prototype, 'firstChild')?.get;
	renderer = custom_renderer;
	return () => {
		renderer_next_sibling = old_next_sibling;
		renderer_first_child = old_first_child;
		renderer = old_renderer;
	};
}

export function get_renderer() {
	return renderer;
}
