import { hydrate_nodes, hydrating } from './hydration.js';
import { clone_node, empty } from './operations.js';
import { create_fragment_from_html, insert } from './reconciler.js';
import { current_effect } from '../runtime.js';
import { TEMPLATE_FRAGMENT, TEMPLATE_USE_IMPORT_NODE } from '../../../constants.js';

/**
 * @param {string} content
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function template(content, flags) {
	var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
	var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;

	/** @type {Node} */
	var node;

	return () => {
		if (hydrating) {
			return is_fragment ? hydrate_nodes : /** @type {Node} */ (hydrate_nodes[0]);
		}

		if (!node) {
			node = create_fragment_from_html(content);
			if (!is_fragment) node = /** @type {Node} */ (node.firstChild);
		}

		return use_import_node ? document.importNode(node, true) : clone_node(node, true);
	};
}

/**
 * @param {string} content
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function template_with_script(content, flags) {
	var first = true;
	var fn = template(content, flags);

	return () => {
		if (hydrating) return fn();

		var node = /** @type {Element | DocumentFragment} */ (fn());

		if (first) {
			first = false;
			run_scripts(node);
		}

		return node;
	};
}

/**
 * @param {string} content
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function svg_template(content, flags) {
	var fn = template(`<svg>${content}</svg>`, 0); // we don't need to worry about using importNode for SVGs

	/** @type {Element | DocumentFragment} */
	var node;

	return () => {
		if (hydrating) {
			return fn();
		}

		if (!node) {
			var svg = /** @type {Element} */ (fn());

			if ((flags & TEMPLATE_FRAGMENT) === 0) {
				node = /** @type {Element} */ (svg.firstChild);
			} else {
				node = document.createDocumentFragment();
				while (svg.firstChild) {
					node.appendChild(svg.firstChild);
				}
			}
		}

		return node;
	};
}

/**
 * @param {string} content
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function svg_template_with_script(content, flags) {
	var first = true;
	var fn = svg_template(content, flags);

	return () => {
		if (hydrating) return fn();

		var node = /** @type {Element | DocumentFragment} */ (fn());

		if (first) {
			first = false;
			run_scripts(node);
		}

		return node;
	};
}

/**
 * Creating a document fragment from HTML that contains script tags will not execute
 * the scripts. We need to replace the script tags with new ones so that they are executed.
 * @param {Element | DocumentFragment} node
 */
function run_scripts(node) {
	for (const script of node.querySelectorAll('script')) {
		var clone = document.createElement('script');
		for (var attribute of script.attributes) {
			clone.setAttribute(attribute.name, attribute.value);
		}

		clone.textContent = script.textContent;
		script.replaceWith(clone);
	}
}

/**
 * @param {Text | Comment | Element} anchor
 */
/*#__NO_SIDE_EFFECTS__*/
export function text(anchor) {
	if (!hydrating) return empty();

	var node = hydrate_nodes[0];

	if (!node) {
		// if an {expression} is empty during SSR, `hydrate_nodes` will be empty.
		// we need to insert an empty text node
		anchor.before((node = empty()));
	}

	return node;
}

/*#__NO_SIDE_EFFECTS__*/
export const comment = template('<!>', TEMPLATE_FRAGMENT);

/**
 * Assign the created (or in hydration mode, traversed) dom elements to the current block
 * and insert the elements into the dom (in client mode).
 * @param {import('#client').Dom} dom
 * @param {boolean} is_fragment
 * @param {Text | Comment | Element} anchor
 * @returns {import('#client').Dom}
 */
function close_template(dom, is_fragment, anchor) {
	var current = dom;

	if (!hydrating) {
		if (is_fragment) {
			// if hydrating, `dom` is already an array of nodes, but if not then
			// we need to create an array to store it on the current effect
			current = /** @type {import('#client').Dom} */ ([.../** @type {Node} */ (dom).childNodes]);
		}

		// TODO ideally we'd do `anchor.before(dom)`, but that fails because `dom` can be an array of nodes in the SVG case
		insert(current, anchor);
	}

	/** @type {import('#client').Effect} */ (current_effect).dom = current;

	return current;
}

/**
 * @param {Text | Comment | Element} anchor
 * @param {Element | Text} dom
 */
export function close(anchor, dom) {
	return close_template(dom, false, anchor);
}

/**
 * @param {Text | Comment | Element} anchor
 * @param {Element | Text} dom
 */
export function close_frag(anchor, dom) {
	return close_template(dom, true, anchor);
}
