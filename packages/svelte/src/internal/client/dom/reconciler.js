import { append_child } from './operations.js';
import { current_hydration_fragment, hydrate_block_anchor, hydrating } from './hydration.js';
import { is_array } from '../utils.js';

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = html;
	return elem.content;
}

/**
 * Creating a document fragment from HTML that contains script tags will not execute
 * the scripts. We need to replace the script tags with new ones so that they are executed.
 * @param {string} html
 */
export function create_fragment_with_script_from_html(html) {
	var content = create_fragment_from_html(html);
	var scripts = content.querySelectorAll('script');
	for (const script of scripts) {
		var new_script = document.createElement('script');
		for (var i = 0; i < script.attributes.length; i++) {
			new_script.setAttribute(script.attributes[i].name, script.attributes[i].value);
		}
		new_script.textContent = script.textContent;
		/** @type {Node} */ (script.parentNode).replaceChild(new_script, script);
	}
	return content;
}

/**
 * @param {Array<import('../types.js').TemplateNode> | import('../types.js').TemplateNode} current
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
 * @param {Array<import('../types.js').TemplateNode> | import('../types.js').TemplateNode} current
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
 * Creates the content for a `@html` tag from its string value,
 * inserts it before the target anchor and returns the new nodes.
 * @template V
 * @param {Element | Text | Comment} target
 * @param {V} value
 * @param {boolean} svg
 * @returns {Element | Comment | (Element | Comment | Text)[]}
 */
export function reconcile_html(target, value, svg) {
	hydrate_block_anchor(target);
	if (hydrating) {
		return current_hydration_fragment;
	}
	var html = value + '';
	// Even if html is the empty string we need to continue to insert something or
	// else the element ordering gets out of sync, resulting in subsequent values
	// not getting inserted anymore.
	var frag_nodes;
	if (svg) {
		html = `<svg>${html}</svg>`;
	}
	// Don't use create_fragment_with_script_from_html here because that would mean script tags are executed.
	// @html is basically `.innerHTML = ...` and that doesn't execute scripts either due to security reasons.
	var content = create_fragment_from_html(html);
	if (svg) {
		content = /** @type {DocumentFragment} */ (/** @type {unknown} */ (content.firstChild));
	}
	var clone = content.cloneNode(true);
	frag_nodes = Array.from(clone.childNodes);
	frag_nodes.forEach((node) => {
		target.before(node);
	});
	return /** @type {Array<Text | Comment | Element>} */ (frag_nodes);
}
