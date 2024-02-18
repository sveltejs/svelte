import { current_hydration_fragment, get_hydration_fragment, hydrating } from './hydration.js';
import { get_descriptor } from './utils.js';

// We cache the Node and Element prototype methods, so that we can avoid doing
// expensive prototype chain lookups.

/** @type {Node} */
var node_prototype;

/** @type {Element} */
var element_prototype;

/** @type {Text} */
var text_prototype;

/** @type {Map<any, any>} */
var map_prototype;

/** @type {typeof Node.prototype.appendChild} */
var append_child_method;

/** @type {typeof Node.prototype.cloneNode} */
var clone_node_method;

/** @type {typeof Map.prototype.set} */
var map_set_method;

/** @type {typeof Map.prototype.get} */
var map_get_method;

/** @type {typeof Map.prototype.delete} */
var map_delete_method;

/** @type {(this: Node) => ChildNode | null} */
var first_child_get;

/** @type {(this: Node) => ChildNode | null} */
var next_sibling_get;

/** @type {(this: Node, text: string ) => void} */
var text_content_set;

/** @type {(this: Element, class_name: string) => void} */
var class_name_set;

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
	map_prototype = Map.prototype;

	append_child_method = node_prototype.appendChild;
	clone_node_method = node_prototype.cloneNode;
	map_set_method = map_prototype.set;
	map_get_method = map_prototype.get;
	map_delete_method = map_prototype.delete;

	$window = window;
	$document = document;

	// the following assignments improve perf of lookups on DOM nodes
	// @ts-expect-error
	element_prototype.__click = undefined;
	// @ts-expect-error
	text_prototype.__nodeValue = ' ';
	// @ts-expect-error
	element_prototype.__className = '';

	first_child_get = /** @type {(this: Node) => ChildNode | null} */ (
		// @ts-ignore
		get_descriptor(node_prototype, 'firstChild').get
	);

	next_sibling_get = /** @type {(this: Node) => ChildNode | null} */ (
		// @ts-ignore
		get_descriptor(node_prototype, 'nextSibling').get
	);

	text_content_set = /** @type {(this: Node, text: string ) => void} */ (
		// @ts-ignore
		get_descriptor(node_prototype, 'textContent').set
	);

	class_name_set = /** @type {(this: Element, class_name: string) => void} */ (
		// @ts-ignore
		get_descriptor(element_prototype, 'className').set
	);
}

/**
 * @template {Element} E
 * @template {Node} T
 * @param {E} element
 * @param {T} child
 */
export function append_child(element, child) {
	append_child_method.call(element, child);
}

/**
 * @template K
 * @template V
 * @param {Map<K, V>} map
 * @param {K} key
 * @param {V} value
 */
export function map_set(map, key, value) {
	map_set_method.call(map, key, value);
}

/**
 * @template K
 * @template V
 * @param {Map<K, V>} map
 * @param {K} key
 */
export function map_delete(map, key) {
	map_delete_method.call(map, key);
}

/**
 * @template K
 * @template V
 * @param {Map<K, V>} map
 * @param {K} key
 * @return {V}
 */
export function map_get(map, key) {
	return map_get_method.call(map, key);
}

/**
 * @template {Node} N
 * @param {N} node
 * @param {boolean} deep
 * @returns {N}
 */
/*#__NO_SIDE_EFFECTS__*/
export function clone_node(node, deep) {
	return /** @type {N} */ (clone_node_method.call(node, deep));
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
	const child = first_child_get.call(node);
	if (hydrating) {
		// Child can be null if we have an element with a single child, like `<p>{text}</p>`, where `text` is empty
		if (child === null) {
			const text = empty();
			node.appendChild(text);
			return text;
		} else {
			return capture_fragment_from_node(child);
		}
	}
	return child;
}

/**
 * @template {Node | Node[]} N
 * @param {N} node
 * @param {boolean} is_text
 * @returns {Node | null}
 */
/*#__NO_SIDE_EFFECTS__*/
export function child_frag(node, is_text) {
	if (hydrating) {
		const first_node = /** @type {Node[]} */ (node)[0];

		// if an {expression} is empty during SSR, there might be no
		// text node to hydrate — we must therefore create one
		if (is_text && first_node?.nodeType !== 3) {
			const text = empty();
			current_hydration_fragment.unshift(text);
			if (first_node) {
				/** @type {DocumentFragment} */ (first_node.parentNode).insertBefore(text, first_node);
			}
			return text;
		}

		if (first_node !== null) {
			return capture_fragment_from_node(first_node);
		}

		return first_node;
	}

	return first_child_get.call(/** @type {Node} */ (node));
}

/**
 * @template {Node} N
 * @param {N} node
 * @param {boolean} is_text
 * @returns {Node | null}
 */
/*#__NO_SIDE_EFFECTS__*/
export function sibling(node, is_text = false) {
	const next_sibling = next_sibling_get.call(node);
	if (hydrating) {
		// if a sibling {expression} is empty during SSR, there might be no
		// text node to hydrate — we must therefore create one
		if (is_text && next_sibling?.nodeType !== 3) {
			const text = empty();
			if (next_sibling) {
				const index = current_hydration_fragment.indexOf(
					/** @type {Text | Comment | Element} */ (next_sibling)
				);
				current_hydration_fragment.splice(index, 0, text);
				/** @type {DocumentFragment} */ (next_sibling.parentNode).insertBefore(text, next_sibling);
			} else {
				current_hydration_fragment.push(text);
			}

			return text;
		}

		if (next_sibling !== null) {
			return capture_fragment_from_node(next_sibling);
		}
	}
	return next_sibling;
}

/**
 * @template {Element} N
 * @param {N} node
 * @param {string} class_name
 * @returns {void}
 */
export function set_class_name(node, class_name) {
	class_name_set.call(node, class_name);
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {void}
 */
export function clear_text_content(node) {
	text_content_set.call(node, '');
}

/** @param {string} name */
/*#__NO_SIDE_EFFECTS__*/
export function create_element(name) {
	return document.createElement(name);
}

/**
 * Expects to only be called in hydration mode
 * @param {Node} node
 * @returns {Node}
 */
function capture_fragment_from_node(node) {
	if (
		node.nodeType === 8 &&
		/** @type {Comment} */ (node).data.startsWith('ssr:') &&
		current_hydration_fragment.at(-1) !== node
	) {
		const fragment = /** @type {Array<Element | Text | Comment>} */ (get_hydration_fragment(node));
		const last_child = fragment.at(-1) || node;
		const target = /** @type {Node} */ (last_child.nextSibling);
		// @ts-ignore
		target.$$fragment = fragment;
		return target;
	}
	return node;
}
