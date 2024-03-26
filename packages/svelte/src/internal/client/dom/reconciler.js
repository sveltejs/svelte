import { hydrate_nodes, hydrating } from './hydration.js';
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
 * @param {import('#client').Dom} current
 * @param {Text | Element | Comment} sibling
 */
export function insert(current, sibling) {
	if (!current) return sibling;

	if (is_array(current)) {
		for (var i = 0; i < current.length; i++) {
			sibling.before(/** @type {Node} */ (current[i]));
		}
	} else {
		sibling.before(/** @type {Node} */ (current));
	}
}

/**
 * @param {import('#client').Dom} current
 */
export function remove(current) {
	if (is_array(current)) {
		for (var i = 0; i < current.length; i++) {
			var node = current[i];
			if (node.isConnected) {
				node.remove();
			}
		}
	} else if (current.isConnected) {
		current.remove();
	}
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
	if (hydrating) {
		return hydrate_nodes;
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
	frag_nodes = [...clone.childNodes];
	frag_nodes.forEach((node) => {
		target.before(node);
	});
	return /** @type {Array<Text | Comment | Element>} */ (frag_nodes);
}
