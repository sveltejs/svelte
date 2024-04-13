import { hydrate_nodes, hydrating } from './hydration.js';
import { clone_node, empty } from './operations.js';
import { create_fragment_from_html } from './reconciler.js';
import { current_effect } from '../runtime.js';
import { TEMPLATE_FRAGMENT, TEMPLATE_USE_IMPORT_NODE } from '../../../constants.js';
import { effect } from '../reactivity/effects.js';

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
	var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
	var fn = template(`<svg>${content}</svg>`, 0); // we don't need to worry about using importNode for SVGs

	/** @type {Element | DocumentFragment} */
	var node;

	return () => {
		if (hydrating) {
			return is_fragment ? hydrate_nodes : /** @type {Node} */ (hydrate_nodes[0]);
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

		return clone_node(node, true);
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
	// scripts were SSR'd, in which case they will run
	if (hydrating) return;

	const scripts =
		/** @type {HTMLElement} */ (node).tagName === 'SCRIPT'
			? [/** @type {HTMLScriptElement} */ (node)]
			: node.querySelectorAll('script');
	for (const script of scripts) {
		var clone = document.createElement('script');
		for (var attribute of script.attributes) {
			clone.setAttribute(attribute.name, attribute.value);
		}

		clone.textContent = script.textContent;
		// If node === script tag, replaceWith will do nothing because there's no parent yet,
		// waiting until that's the case using an effect solves this.
		// Don't do it in other circumstances or we could accidentally execute scripts
		// in an adjacent @html tag that was instantiated in the meantime.
		if (script === node) {
			effect(() => script.replaceWith(clone));
		} else {
			script.replaceWith(clone);
		}
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

export const comment = template('<!>', TEMPLATE_FRAGMENT);

/**
 * Assign the created (or in hydration mode, traversed) dom elements to the current block
 * and insert the elements into the dom (in client mode).
 * @param {Text | Comment | Element} anchor
 * @param {import('#client').Dom} dom
 */
export function append(anchor, dom) {
	var current = dom;

	if (!hydrating) {
		var node = /** @type {Node} */ (dom);

		if (node.nodeType === 11) {
			// if hydrating, `dom` is already an array of nodes, but if not then
			// we need to create an array to store it on the current effect
			current = /** @type {import('#client').Dom} */ ([...node.childNodes]);
		}

		anchor.before(node);
	}

	/** @type {import('#client').Effect} */ (current_effect).dom = current;
}
