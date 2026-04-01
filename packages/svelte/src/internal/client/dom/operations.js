/** @import { Effect, TemplateNode } from '#client' */
import { hydrate_node, hydrating, set_hydrate_node } from './hydration.js';
import { DEV } from 'esm-env';
import { init_array_prototype_warnings } from '../dev/equality.js';
import { get_descriptor, is_extensible } from '../../shared/utils.js';
import { active_effect } from '../runtime.js';
import { async_mode_flag } from '../../flags/index.js';
import {
	TEXT_NODE,
	REACTION_RAN,
	CUSTOM_RENDERER_NODE_TYPE_MAP,
	COMMENT_NODE
} from '#client/constants';
import { eager_block_effects } from '../reactivity/batch.js';
import { NAMESPACE_HTML } from '../../../constants.js';
import { custom_renderer_window, renderer } from '../custom-renderer/state.js';

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
	if (renderer) return /** @type {Text} */ (renderer.createTextNode(value));
	return document.createTextNode(value);
}

/**
 * @template {Node} N
 * @param {N} node
 */
/*@__NO_SIDE_EFFECTS__*/
export function get_first_child(node) {
	if (renderer) return /** @type {TemplateNode | null} */ (renderer.getFirstChild(node));
	return /** @type {TemplateNode | null} */ (first_child_getter.call(node));
}

/**
 * @template {Node} N
 * @param {N} node
 */
/*@__NO_SIDE_EFFECTS__*/
export function get_next_sibling(node) {
	if (renderer) return /** @type {TemplateNode | null} */ (renderer.getNextSibling(node));
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
		child = /** @type {TemplateNode} */ (append_child(hydrate_node, create_text()));
	} else if (is_text && node_type(child) !== TEXT_NODE) {
		var text = create_text();
		insert_before(child, text);
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
		if (is_comment(first) && get_node_value(first) === '') return get_next_sibling(first);

		return first;
	}

	if (is_text) {
		// if an {expression} is empty during SSR, there might be no
		// text node to hydrate — we must therefore create one
		if (node_type(hydrate_node) !== TEXT_NODE) {
			var text = create_text();

			if (hydrate_node) insert_before(hydrate_node, text);
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
		if (node_type(next_sibling) !== TEXT_NODE) {
			var text = create_text();
			// If the next sibling is `null` and we're handling text then it's because
			// the SSR content was empty for the text, so we need to generate a new text
			// node and insert it after the last sibling
			if (next_sibling === null) {
				if (last_sibling) insert_after(last_sibling, text);
			} else {
				insert_before(next_sibling, text);
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
	if (renderer) {
		var child = renderer.getFirstChild(node);
		while (child !== null) {
			var next = renderer.getNextSibling(child);
			renderer.remove(child);
			child = next;
		}
		return;
	}
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
	if (renderer)
		return /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */ (
			renderer.createElement(tag)
		);
	let options = is ? { is } : undefined;
	return /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */ (
		document.createElementNS(namespace ?? NAMESPACE_HTML, tag, options)
	);
}

export function create_fragment() {
	if (renderer) return /** @type {DocumentFragment} */ (renderer.createFragment());
	return document.createDocumentFragment();
}

/**
 * @param {string} data
 * @returns
 */
export function create_comment(data = '') {
	if (renderer) return /** @type {Comment} */ (renderer.createComment(data));
	return document.createComment(data);
}

/**
 * @param {Element} element
 * @param {string} key
 * @param {string} value
 * @returns
 */
export function set_attribute(element, key, value = '') {
	if (renderer) {
		renderer.setAttribute(element, key, value);
		return;
	}
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
	// if we have a renderer we will not hydrate so we can skip this
	if (renderer) return;

	if (/** @type {string} */ (text.nodeValue).length < 65536) {
		return;
	}

	let next = text.nextSibling;

	while (next !== null && node_type(next) === TEXT_NODE) {
		next.remove();

		/** @type {string} */ (text.nodeValue) += /** @type {string} */ (next.nodeValue);

		next = text.nextSibling;
	}
}

/**
 * @param {TemplateNode | null} node
 * @returns {node is Comment}
 */
function is_comment(node) {
	if (renderer) return !!node && node_type(node) === COMMENT_NODE;
	return node instanceof Comment;
}

/**
 * @param {Node | null | undefined} node
 */
export function node_type(node) {
	if (node == null) return undefined;
	if (renderer) {
		const type = renderer.nodeType(node);
		return CUSTOM_RENDERER_NODE_TYPE_MAP[type];
	}
	return node?.nodeType;
}

/**
 * @param {Node | null | undefined} node
 */
export function node_name(node) {
	if (node == null) return undefined;
	if (renderer) {
		// for custom renderers we don't need to return the node name since all the
		// checks that we do on specific node names are meant to be for the HTML
		return '';
	}
	return node?.nodeName;
}

/**
 * @param {Node} node
 * @returns {TemplateNode | null}
 */
export function get_last_child(node) {
	if (renderer) return /** @type {TemplateNode | null} */ (renderer.getLastChild(node));
	return /** @type {TemplateNode | null} */ (node.lastChild);
}

/**
 * @param {Node} node
 * @returns {TemplateNode | null}
 */
export function get_parent_node(node) {
	if (renderer) return /** @type {TemplateNode | null} */ (renderer.getParent(node));
	return /** @type {TemplateNode | null} */ (node.parentNode);
}

/**
 * @param {Node} parent
 * @param {Node} child
 * @returns {Node}
 */
export function append_child(parent, child) {
	if (renderer) {
		renderer.insert(parent, child, null);
		return child;
	}
	return parent.appendChild(child);
}

/**
 * Insert `new_node` before `ref_node` (equivalent to `ref_node.before(new_node)`)
 * @param {ChildNode} ref_node
 * @param {Node} new_node
 */
export function insert_before(ref_node, new_node) {
	if (renderer) {
		var parent = renderer.getParent(ref_node);
		renderer.insert(parent, new_node, ref_node);
		return;
	}
	ref_node.before(new_node);
}

/**
 * Insert `new_node` after `ref_node` (equivalent to `ref_node.after(new_node)`)
 * @param {ChildNode} ref_node
 * @param {Node} new_node
 */
export function insert_after(ref_node, new_node) {
	if (renderer) {
		var parent = renderer.getParent(ref_node);
		var next = renderer.getNextSibling(ref_node);
		renderer.insert(parent, new_node, next);
		return;
	}
	ref_node.after(new_node);
}

/**
 * @param {ChildNode} node
 */
export function remove_node(node) {
	if (renderer) {
		renderer.remove(node);
		return;
	}
	node.remove();
}

/**
 * @param {Node} parent
 * @param {ChildNode} child
 * @returns {ChildNode}
 */
export function remove_child(parent, child) {
	if (renderer) {
		renderer.remove(child);
		return child;
	}
	return /** @type {ChildNode} */ (parent.removeChild(child));
}

/**
 * @param {ChildNode} old_node
 * @param {Node} new_node
 */
export function replace_with(old_node, new_node) {
	if (renderer) {
		var parent = renderer.getParent(old_node);
		renderer.insert(parent, new_node, old_node);
		renderer.remove(old_node);
		return;
	}
	old_node.replaceWith(new_node);
}

/**
 * @param {Node} node
 * @param {string} value
 */
export function set_text_content(node, value) {
	if (renderer) {
		renderer.setText(node, value);
		return;
	}
	node.textContent = value;
}

/**
 * @param {Node} node
 * @param {string} value
 */
export function set_node_value(node, value) {
	if (renderer) {
		renderer.setText(node, value);
		return;
	}
	node.nodeValue = value;
}

// --- Helpers for style attribute string manipulation (custom renderer) ---

/**
 * @param {string} style_string
 * @param {string} property
 * @param {string} value
 * @param {string} [priority]
 * @returns {string}
 */
function set_style_property_in_string(style_string, property, value, priority) {
	var declaration = property + ': ' + value + (priority ? ' !' + priority : '');
	var parts = style_string.split(';');
	var found = false;

	for (var i = 0; i < parts.length; i++) {
		var colon_index = parts[i].indexOf(':');
		if (colon_index !== -1 && parts[i].substring(0, colon_index).trim() === property) {
			parts[i] = ' ' + declaration;
			found = true;
			break;
		}
	}

	if (!found) {
		parts.push(' ' + declaration);
	}

	return parts
		.map((p) => p.trim())
		.filter(Boolean)
		.join('; ');
}

/**
 * @param {string} style_string
 * @param {string} property
 * @returns {string}
 */
function remove_style_property_in_string(style_string, property) {
	return style_string
		.split(';')
		.filter((part) => {
			var colon_index = part.indexOf(':');
			if (colon_index === -1) return false;
			return part.substring(0, colon_index).trim() !== property;
		})
		.map((p) => p.trim())
		.filter(Boolean)
		.join('; ');
}

/**
 * @param {Node} node
 * @returns {string | null}
 */
export function get_node_value(node) {
	if (renderer) return renderer.getNodeValue(node);
	return node.nodeValue;
}

/**
 * Sets the `value` property on an element. For custom renderers, uses `setAttribute`.
 * @param {Element} element
 * @param {any} value
 */
export function set_element_value(element, value) {
	if (renderer) {
		renderer.setAttribute(element, 'value', value ?? '');
		return;
	}
	// @ts-expect-error
	element.value = value ?? '';
}

/**
 * Sets the `checked` property on an element. For custom renderers, uses `setAttribute`.
 * @param {Element} element
 * @param {boolean} checked
 */
export function set_element_checked(element, checked) {
	if (renderer) {
		if (checked) {
			renderer.setAttribute(element, 'checked', '');
		} else {
			renderer.removeAttribute(element, 'checked');
		}
		return;
	}
	// @ts-expect-error
	element.checked = checked;
}

/**
 * Sets the `defaultValue` property on an element without affecting the current `value`.
 * For custom renderers, uses `setAttribute` on `defaultvalue`.
 * @param {Element} element
 * @param {string} value
 */
export function set_element_default_value(element, value) {
	if (renderer) {
		renderer.setAttribute(element, 'defaultValue', value);
		return;
	}
	// @ts-expect-error
	const existing_value = element.value;
	// @ts-expect-error
	element.defaultValue = value;
	// @ts-expect-error
	element.value = existing_value;
}

/**
 * Sets the `defaultChecked` property on an element without affecting the current `checked` state.
 * For custom renderers, uses `setAttribute` on `defaultchecked`.
 * @param {Element} element
 * @param {boolean} checked
 */
export function set_element_default_checked(element, checked) {
	if (renderer) {
		if (checked) {
			renderer.setAttribute(element, 'defaultChecked', '');
		} else {
			renderer.removeAttribute(element, 'defaultChecked');
		}
		return;
	}
	// @ts-expect-error
	const existing_value = element.checked;
	// @ts-expect-error
	element.defaultChecked = checked;
	// @ts-expect-error
	element.checked = existing_value;
}

/**
 * @param {Element} element
 * @param {string} name
 * @returns {string | null}
 */
export function get_attribute(element, name) {
	if (renderer) return renderer.getAttribute(element, name);
	return element.getAttribute(name);
}

/**
 * @param {Element} element
 * @param {string} name
 */
export function remove_attribute(element, name) {
	if (renderer) {
		renderer.removeAttribute(element, name);
		return;
	}
	element.removeAttribute(name);
}

/**
 * @param {Element} element
 * @param {string} name
 * @returns {boolean}
 */
export function has_attribute(element, name) {
	if (renderer) return renderer.hasAttribute(element, name);
	return element.hasAttribute(name);
}

/**
 * @param {Element} element
 * @param {string} value
 */
export function set_inner_html(element, value) {
	if (renderer) {
		throw new Error('setInnerHTML is not supported with custom renderers');
	}
	element.innerHTML = value;
}

/**
 * @param {Node} node
 * @param {boolean} deep
 * @returns {Node}
 */
export function clone_node(node, deep) {
	if (renderer) {
		throw new Error('cloneNode is not supported with custom renderers');
	}
	return node.cloneNode(deep);
}

/**
 * @param {Node} node
 * @param {boolean} deep
 * @returns {Node}
 */
export function import_node(node, deep) {
	if (renderer) {
		throw new Error('importNode is not supported with custom renderers');
	}
	return document.importNode(node, deep);
}

/**
 * @param {EventTarget} target
 * @param {string} type
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions} [options]
 */
export function add_event_listener(target, type, handler, options) {
	if (renderer) {
		renderer.addEventListener(target, type, handler, options);
		return;
	}
	target.addEventListener(type, handler, options);
}

/**
 * @param {EventTarget} target
 * @param {string} type
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | EventListenerOptions} [options]
 */
export function remove_event_listener(target, type, handler, options) {
	if (renderer) {
		renderer.removeEventListener(target, type, handler, options);
		return;
	}
	target.removeEventListener(type, handler, options);
}

/**
 * @param {EventTarget} target
 * @param {Event} event
 * @returns {boolean}
 */
export function dispatch_event(target, event) {
	if (renderer) {
		// is only used in SSR which is not a thing for custom renderers
		throw new Error('dispatchEvent is not supported with custom renderers');
	}
	return target.dispatchEvent(event);
}

/**
 * @param {HTMLElement} element
 * @param {string} property
 * @param {string} value
 * @param {string} [priority]
 */
export function style_set_property(element, property, value, priority) {
	if (renderer) {
		var style = renderer.getAttribute(element, 'style') || '';
		var updated = set_style_property_in_string(style, property, value, priority);
		renderer.setAttribute(element, 'style', updated);
		return;
	}
	element.style.setProperty(property, value, priority);
}

/**
 * @param {HTMLElement} element
 * @param {string} property
 */
export function style_remove_property(element, property) {
	if (renderer) {
		var style = renderer.getAttribute(element, 'style') || '';
		var updated = remove_style_property_in_string(style, property);
		renderer.setAttribute(element, 'style', updated);
		return;
	}
	element.style.removeProperty(property);
}

/**
 * @param {HTMLElement} element
 * @param {string} value
 */
export function set_css_text(element, value) {
	if (renderer) {
		renderer.setAttribute(element, 'style', value);
		return;
	}
	element.style.cssText = value;
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {boolean} force
 */
export function class_list_toggle(element, name, force) {
	if (renderer) {
		const classes = renderer.getAttribute(element, 'class')?.split(/\s+/) ?? [];
		const has_class = classes.includes(name);
		if (force === has_class) {
			return;
		}
		if (force) {
			classes.push(name);
		} else {
			const index = classes.indexOf(name);
			if (index !== -1) {
				classes.splice(index, 1);
			}
		}
		renderer.setAttribute(element, 'class', classes.join(' '));
		return;
	}
	element.classList.toggle(name, force);
}

export function get_window() {
	if (renderer) {
		return custom_renderer_window;
	}
	return window;
}
