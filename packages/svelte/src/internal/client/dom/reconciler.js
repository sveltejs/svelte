import { hydrate_nodes, hydrating } from './hydration.js';
import { is_array } from '../utils.js';

/** @param {string} html */
export function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = html;
	return elem.content;
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
	if (hydrating) return hydrate_nodes;

	var html = value + '';
	if (svg) html = `<svg>${html}</svg>`;

	// Don't use create_fragment_with_script_from_html here because that would mean script tags are executed.
	// @html is basically `.innerHTML = ...` and that doesn't execute scripts either due to security reasons.
	/** @type {DocumentFragment | Element} */
	var node = create_fragment_from_html(html);

	if (svg) {
		node = /** @type {Element} */ (node.firstChild);
	}

	if (node.childNodes.length === 1) {
		var child = /** @type {Text | Element | Comment} */ (node.firstChild);
		target.before(child);
		return child;
	}

	var nodes = /** @type {Array<Text | Element | Comment>} */ ([...node.childNodes]);

	if (svg) {
		while (node.firstChild) {
			target.before(node.firstChild);
		}
	} else {
		target.before(node);
	}

	return nodes;
}
