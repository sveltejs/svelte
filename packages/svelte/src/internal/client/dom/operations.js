/** @import { Effect, TemplateNode } from '#client' */
import { hydrate_node, hydrating, set_hydrate_node } from './hydration.js';
import { DEV } from 'esm-env';
import { init_array_prototype_warnings } from '../dev/equality.js';
import { get_descriptor, is_extensible } from '../../shared/utils.js';
import { active_effect } from '../runtime.js';
import { async_mode_flag } from '../../flags/index.js';
import { TEXT_NODE, REACTION_RAN } from '#client/constants';
import { eager_block_effects } from '../reactivity/batch.js';
import { NAMESPACE_HTML } from '../../../constants.js';

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
	is_firefox = /Firefox/.test(navigator.userAgent);

	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;

	// @ts-ignore
	first_child_getter = get_descriptor(node_prototype, 'firstChild').get;
	// @ts-ignore
	next_sibling_getter = get_descriptor(node_prototype, 'nextSibling').get;

	if (is_extensible(element_prototype)) {
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
	return document.createTextNode(value);
}

/**
 * @template {Node} N
 * @param {N} node
 */
/*@__NO_SIDE_EFFECTS__*/
export function get_first_child(node) {
	return /** @type {TemplateNode | null} */ (first_child_getter.call(node));
}

/**
 * @template {Node} N
 * @param {N} node
 */
/*@__NO_SIDE_EFFECTS__*/
export function get_next_sibling(node) {
	return /** @type {TemplateNode | null} */ (next_sibling_getter.call(node));
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @template {Node} N
 * @param {N} node
 * @param {boolean} is_text
 * @returns {TemplateNode | null}
 */
export function child(node, is_text) {
	if (!hydrating) {
		return get_first_child(node);
	}

	var child = get_first_child(hydrate_node);

	// Child can be null if we have an element with a single child, like `<p>{text}</p>`, where `text` is empty
	if (child === null) {
		child = hydrate_node.appendChild(create_text());
	} else if (is_text && child.nodeType !== TEXT_NODE) {
		var text = create_text();
		child?.before(text);
		set_hydrate_node(text);
		return text;
	}

	if (is_text) {
		merge_text_nodes(/** @type {Text} */ (child));
	}

	set_hydrate_node(child);
	return child;
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @param {TemplateNode} node
 * @param {boolean} [is_text]
 * @returns {TemplateNode | null}
 */
export function first_child(node, is_text = false) {
	if (!hydrating) {
		var first = get_first_child(node);

		// TODO prevent user comments with the empty string when preserveComments is true
		if (first instanceof Comment && first.data === '') return get_next_sibling(first);

		return first;
	}

	if (is_text) {
		// if an {expression} is empty during SSR, there might be no
		// text node to hydrate — we must therefore create one
		if (hydrate_node?.nodeType !== TEXT_NODE) {
			var text = create_text();

			hydrate_node?.before(text);
			set_hydrate_node(text);
			return text;
		}

		merge_text_nodes(/** @type {Text} */ (hydrate_node));
	}

	return hydrate_node;
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @param {TemplateNode} node
 * @param {number} count
 * @param {boolean} is_text
 * @returns {TemplateNode | null}
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

	if (is_text) {
		// if a sibling {expression} is empty during SSR, there might be no
		// text node to hydrate — we must therefore create one
		if (next_sibling?.nodeType !== TEXT_NODE) {
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

		merge_text_nodes(/** @type {Text} */ (next_sibling));
	}

	set_hydrate_node(next_sibling);
	return next_sibling;
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
 * Returns `true` if we're updating the current block, for example `condition` in
 * an `{#if condition}` block just changed. In this case, the branch should be
 * appended (or removed) at the same time as other updates within the
 * current `<svelte:boundary>`
 */
export function should_defer_append() {
	if (!async_mode_flag) return false;
	if (eager_block_effects !== null) return false;

	var flags = /** @type {Effect} */ (active_effect).f;
	return (flags & REACTION_RAN) !== 0;
}

/**
 * @template {keyof HTMLElementTagNameMap | string} T
 * @param {T} tag
 * @param {string} [namespace]
 * @param {string} [is]
 * @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element}
 */
export function create_element(tag, namespace, is) {
	let options = is ? { is } : undefined;
	return /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */ (
		document.createElementNS(namespace ?? NAMESPACE_HTML, tag, options)
	);
}

export function create_fragment() {
	return document.createDocumentFragment();
}

/**
 * @param {string} data
 * @returns
 */
export function create_comment(data = '') {
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

/**
 * Browsers split text nodes larger than 65536 bytes when parsing.
 * For hydration to succeed, we need to stitch them back together
 * @param {Text} text
 */
export function merge_text_nodes(text) {
	if (/** @type {string} */ (text.nodeValue).length < 65536) {
		return;
	}

	let next = text.nextSibling;

	while (next !== null && next.nodeType === TEXT_NODE) {
		next.remove();

		/** @type {string} */ (text.nodeValue) += /** @type {string} */ (next.nodeValue);

		next = text.nextSibling;
	}
}
