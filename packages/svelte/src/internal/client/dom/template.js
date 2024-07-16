/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
import { hydrate_next, hydrate_node, hydrating, set_hydrate_node } from './hydration.js';
import { empty } from './operations.js';
import { create_fragment_from_html } from './reconciler.js';
import { current_effect } from '../runtime.js';
import { TEMPLATE_FRAGMENT, TEMPLATE_USE_IMPORT_NODE } from '../../../constants.js';
import { queue_micro_task } from './task.js';

/**
 * @param {TemplateNode} start
 * @param {TemplateNode | null} end
 */
export function assign_nodes(start, end) {
	/** @type {Effect} */ (current_effect).nodes ??= { start, end };
}

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

	/**
	 * Whether or not the first item is a text/element node. If not, we need to
	 * create an additional comment node to act as `effect.nodes.start`
	 */
	var has_start = !content.startsWith('<!>');

	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}

		if (!node) {
			node = create_fragment_from_html(has_start ? content : '<!>' + content);
			if (!is_fragment) node = /** @type {Node} */ (node.firstChild);
		}

		var clone = /** @type {TemplateNode} */ (
			use_import_node ? document.importNode(node, true) : node.cloneNode(true)
		);

		if (is_fragment) {
			var start = /** @type {TemplateNode} */ (clone.firstChild);
			var end = /** @type {TemplateNode} */ (clone.lastChild);

			assign_nodes(start, end);
		} else {
			assign_nodes(clone, clone);
		}

		return clone;
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
 * @param {'svg' | 'math'} ns
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function ns_template(content, flags, ns = 'svg') {
	/**
	 * Whether or not the first item is a text/element node. If not, we need to
	 * create an additional comment node to act as `effect.nodes.start`
	 */
	var has_start = !content.startsWith('<!>');

	var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
	var wrapped = `<${ns}>${has_start ? content : '<!>' + content}</${ns}>`;

	/** @type {Element | DocumentFragment} */
	var node;

	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}

		if (!node) {
			var fragment = /** @type {DocumentFragment} */ (create_fragment_from_html(wrapped));
			var root = /** @type {Element} */ (fragment.firstChild);

			if (is_fragment) {
				node = document.createDocumentFragment();
				while (root.firstChild) {
					node.appendChild(root.firstChild);
				}
			} else {
				node = /** @type {Element} */ (root.firstChild);
			}
		}

		var clone = /** @type {TemplateNode} */ (node.cloneNode(true));

		if (is_fragment) {
			var start = /** @type {TemplateNode} */ (clone.firstChild);
			var end = /** @type {TemplateNode} */ (clone.lastChild);

			assign_nodes(start, end);
		} else {
			assign_nodes(clone, clone);
		}

		return clone;
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
	var fn = ns_template(content, flags);

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
export function mathml_template(content, flags) {
	return ns_template(content, flags, 'math');
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
			queue_micro_task(() => script.replaceWith(clone));
		} else {
			script.replaceWith(clone);
		}
	}
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 */
export function text() {
	if (!hydrating) {
		var t = empty();
		assign_nodes(t, t);
		return t;
	}

	var node = hydrate_node;

	if (node.nodeType !== 3) {
		// if an {expression} is empty during SSR, we need to insert an empty text node
		node.before((node = empty()));
		set_hydrate_node(node);
	}

	assign_nodes(node, node);
	return node;
}

export function comment() {
	// we're not delegating to `template` here for performance reasons
	if (hydrating) {
		assign_nodes(hydrate_node, null);
		return hydrate_node;
	}

	var frag = document.createDocumentFragment();
	var start = document.createComment('');
	var anchor = empty();
	frag.append(start, anchor);

	assign_nodes(start, anchor);

	return frag;
}

/**
 * Assign the created (or in hydration mode, traversed) dom elements to the current block
 * and insert the elements into the dom (in client mode).
 * @param {Text | Comment | Element} anchor
 * @param {DocumentFragment | Element} dom
 */
export function append(anchor, dom) {
	if (hydrating) {
		/** @type {Effect & { nodes: EffectNodes }} */ (current_effect).nodes.end = hydrate_node;
		hydrate_next();
		return;
	}

	if (anchor === null) {
		// edge case — void `<svelte:element>` with content
		return;
	}

	anchor.before(/** @type {Node} */ (dom));
}
