import { append_child } from './operations.js';
import { current_hydration_fragment, hydrate_block_anchor } from './hydration.js';
import { is_array } from './utils.js';

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = html;
	return elem.content;
}

/**
 * @param {Array<import('./types.js').TemplateNode> | import('./types.js').TemplateNode} current
 * @param {null | Element} parent_element
 * @param {null | Text | Element | Comment} sibling
 * @returns {Text | Element | Comment}
 */
export function insert(current, parent_element, sibling) {
	if (is_array(current)) {
		var i = 0;
		var node;
		for (; i < current.length; i++) {
			node = current[i];
			if (sibling === null) {
				append_child(/** @type {Element} */ (parent_element), /** @type {Node} */ (node));
			} else {
				sibling.before(/** @type {Node} */ (node));
			}
		}
		return current[0];
	} else if (current !== null) {
		if (sibling === null) {
			append_child(/** @type {Element} */ (parent_element), /** @type {Node} */ (current));
		} else {
			sibling.before(/** @type {Node} */ (current));
		}
	}
	return /** @type {Text | Element | Comment} */ (current);
}

/**
 * @param {Array<import('./types.js').TemplateNode> | import('./types.js').TemplateNode} current
 * @returns {Element | Comment | Text}
 */
export function remove(current) {
	var first_node = current;
	if (is_array(current)) {
		var i = 0;
		var node;
		for (; i < current.length; i++) {
			node = current[i];
			if (i === 0) {
				first_node = node;
			}
			if (node.isConnected) {
				node.remove();
			}
		}
	} else if (current.isConnected) {
		current.remove();
	}
	return /** @type {Element | Comment | Text} */ (first_node);
}

/**
 * @template V
 * @param {Element | Text | Comment} dom
 * @param {V} value
 * @param {boolean} svg
 * @returns {Element | Comment | (Element | Comment | Text)[]}
 */
export function reconcile_html(dom, value, svg) {
	hydrate_block_anchor(dom);
	if (current_hydration_fragment !== null) {
		return current_hydration_fragment;
	}
	var html = value + '';
	// Even if html is the empty string we need to continue to insert something or
	// else the element ordering gets out of sync, resulting in subsequent values
	// not getting inserted anymore.
	var target = dom;
	var frag_nodes;
	if (svg) {
		html = `<svg>${html}</svg>`;
	}
	var content = create_fragment_from_html(html);
	if (svg) {
		content = /** @type {DocumentFragment} */ (/** @type {unknown} */ (content.firstChild));
	}
	var clone = content.cloneNode(true);
	frag_nodes = Array.from(clone.childNodes);
	target.before(svg ? /** @type {Node} */ (clone.firstChild) : clone);
	return /** @type {Array<Text | Comment | Element>} */ (frag_nodes);
}
