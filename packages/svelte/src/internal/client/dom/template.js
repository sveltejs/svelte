/** @import { Effect, TemplateNode } from '#client' */
import { hydrate_next, hydrate_node, hydrating, set_hydrate_node } from './hydration.js';
import { create_text, get_first_child, is_firefox } from './operations.js';
import { create_fragment_from_html } from './reconciler.js';
import { active_effect } from '../runtime.js';
import {
	NAMESPACE_MATHML,
	NAMESPACE_SVG,
	TEMPLATE_FRAGMENT,
	TEMPLATE_USE_IMPORT_NODE
} from '../../../constants.js';

/**
 * @param {TemplateNode} start
 * @param {TemplateNode | null} end
 */
export function assign_nodes(start, end) {
	var effect = /** @type {Effect} */ (active_effect);
	if (effect.nodes_start === null) {
		effect.nodes_start = start;
		effect.nodes_end = end;
	}
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

		if (node === undefined) {
			node = create_fragment_from_html(has_start ? content : '<!>' + content);
			if (!is_fragment) node = /** @type {Node} */ (get_first_child(node));
		}

		var clone = /** @type {TemplateNode} */ (
			use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
		);

		if (is_fragment) {
			var start = /** @type {TemplateNode} */ (get_first_child(clone));
			var end = /** @type {TemplateNode} */ (clone.lastChild);

			assign_nodes(start, end);
		} else {
			assign_nodes(clone, clone);
		}

		return clone;
	};
}

/**
 * @typedef {{e: string, is?: string, p: Record<string, string>, c: Array<TemplateStructure>} | null | string | [string]} TemplateStructure
 */

/**
 * @param {Array<TemplateStructure>} structure
 * @param {'svg' | 'math'} [ns]
 * @param {Array<string | undefined>} [namespace_stack]
 */
function structure_to_fragment(structure, ns, namespace_stack = [], foreign_object_count = 0) {
	var fragment = document.createDocumentFragment();
	for (var i = 0; i < structure.length; i += 1) {
		var item = structure[i];
		if (item == null || Array.isArray(item)) {
			const data = item ? item[0] : '';
			fragment.insertBefore(document.createComment(data), null);
		} else if (typeof item === 'string') {
			fragment.appendChild(document.createTextNode(item));
			continue;
		} else {
			let namespace =
				foreign_object_count > 0
					? undefined
					: namespace_stack.at(-1) ??
						(ns
							? ns === 'svg'
								? NAMESPACE_SVG
								: ns === 'math'
									? NAMESPACE_MATHML
									: undefined
							: item.e === 'svg'
								? NAMESPACE_SVG
								: item.e === 'math'
									? NAMESPACE_MATHML
									: undefined);
			if (namespace !== namespace_stack.at(-1)) {
				namespace_stack.push(namespace);
			}
			var args = [item.e];
			if (item.is) {
				// @ts-ignore
				args.push({ is: item.is });
			}
			if (namespace) {
				args.unshift(namespace);
			}
			var element = /** @type {HTMLElement} */ (
				// @ts-ignore
				(namespace ? document.createElementNS : document.createElement).call(document, ...args)
			);

			for (var key in item.p) {
				if (key.startsWith('xlink:')) {
					element.setAttributeNS('http://www.w3.org/1999/xlink', key, item.p[key] ?? '');
					continue;
				}
				element.setAttribute(key, item.p[key] ?? '');
			}
			if (item.c) {
				(element.tagName === 'TEMPLATE'
					? /** @type {HTMLTemplateElement} */ (element).content
					: element
				).append(
					...structure_to_fragment(
						item.c,
						ns,
						namespace_stack,
						element.tagName === 'foreignObject' ? foreign_object_count + 1 : foreign_object_count
					).childNodes
				);
			}
			namespace_stack.pop();
			fragment.insertBefore(element, null);
		}
	}
	return fragment;
}

/**
 * @param {Array<TemplateStructure>} structure
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function template_fn(structure, flags) {
	var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
	var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;

	/** @type {Node} */
	var node;

	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}

		if (node === undefined) {
			node = structure_to_fragment(structure);
			if (!is_fragment) node = /** @type {Node} */ (get_first_child(node));
		}

		var clone = /** @type {TemplateNode} */ (
			use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
		);

		if (is_fragment) {
			var start = /** @type {TemplateNode} */ (get_first_child(clone));
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
	var fn = template(content, flags);
	return () => run_scripts(/** @type {Element | DocumentFragment} */ (fn()));
}

/**
 * @param {Array<TemplateStructure>} structure
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */ /*#__NO_SIDE_EFFECTS__*/
export function template_with_script_fn(structure, flags) {
	var templated_fn = template_fn(structure, flags);
	return () => run_scripts(/** @type {Element | DocumentFragment} */ (templated_fn()));
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
			var root = /** @type {Element} */ (get_first_child(fragment));

			if (is_fragment) {
				node = document.createDocumentFragment();
				while (get_first_child(root)) {
					node.appendChild(/** @type {Node} */ (get_first_child(root)));
				}
			} else {
				node = /** @type {Element} */ (get_first_child(root));
			}
		}

		var clone = /** @type {TemplateNode} */ (node.cloneNode(true));

		if (is_fragment) {
			var start = /** @type {TemplateNode} */ (get_first_child(clone));
			var end = /** @type {TemplateNode} */ (clone.lastChild);

			assign_nodes(start, end);
		} else {
			assign_nodes(clone, clone);
		}

		return clone;
	};
}

/**
 * @param {Array<TemplateStructure>} structure
 * @param {number} flags
 * @param {'svg' | 'math'} ns
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function ns_template_fn(structure, flags, ns = 'svg') {
	var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;

	/** @type {Element | DocumentFragment} */
	var node;

	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}

		if (!node) {
			var fragment = structure_to_fragment(structure, ns);

			if (is_fragment) {
				node = document.createDocumentFragment();
				while (get_first_child(fragment)) {
					node.appendChild(/** @type {Node} */ (get_first_child(fragment)));
				}
			} else {
				node = /** @type {Element} */ (get_first_child(fragment));
			}
		}

		var clone = /** @type {TemplateNode} */ (node.cloneNode(true));

		if (is_fragment) {
			var start = /** @type {TemplateNode} */ (get_first_child(clone));
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
	var fn = ns_template(content, flags);
	return () => run_scripts(/** @type {Element | DocumentFragment} */ (fn()));
}

/**
 * @param {Array<TemplateStructure>} structure
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function svg_template_with_script_fn(structure, flags) {
	var templated_fn = ns_template_fn(structure, flags);
	return () => run_scripts(/** @type {Element | DocumentFragment} */ (templated_fn()));
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
 * @param {Array<TemplateStructure>} structure
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function mathml_template_fn(structure, flags) {
	return ns_template_fn(structure, flags, 'math');
}

/**
 * Creating a document fragment from HTML that contains script tags will not execute
 * the scripts. We need to replace the script tags with new ones so that they are executed.
 * @param {Element | DocumentFragment} node
 * @returns {Node | Node[]}
 */
function run_scripts(node) {
	// scripts were SSR'd, in which case they will run
	if (hydrating) return node;

	const is_fragment = node.nodeType === 11;
	const scripts =
		/** @type {HTMLElement} */ (node).tagName === 'SCRIPT'
			? [/** @type {HTMLScriptElement} */ (node)]
			: node.querySelectorAll('script');
	const effect = /** @type {Effect} */ (active_effect);

	for (const script of scripts) {
		const clone = document.createElement('script');
		for (var attribute of script.attributes) {
			clone.setAttribute(attribute.name, attribute.value);
		}

		clone.textContent = script.textContent;

		// The script has changed - if it's at the edges, the effect now points at dead nodes
		if (is_fragment ? node.firstChild === script : node === script) {
			effect.nodes_start = clone;
		}
		if (is_fragment ? node.lastChild === script : node === script) {
			effect.nodes_end = clone;
		}

		script.replaceWith(clone);
	}
	return node;
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @param {any} value
 */
export function text(value = '') {
	if (!hydrating) {
		var t = create_text(value + '');
		assign_nodes(t, t);
		return t;
	}

	var node = hydrate_node;

	if (node.nodeType !== 3) {
		// if an {expression} is empty during SSR, we need to insert an empty text node
		node.before((node = create_text()));
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
	var anchor = create_text();
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
		/** @type {Effect} */ (active_effect).nodes_end = hydrate_node;
		hydrate_next();
		return;
	}

	if (anchor === null) {
		// edge case — void `<svelte:element>` with content
		return;
	}

	anchor.before(/** @type {Node} */ (dom));
}

/**
 * Create (or hydrate) an unique UID for the component instance.
 */
export function props_id() {
	if (
		hydrating &&
		hydrate_node &&
		hydrate_node.nodeType === 8 &&
		hydrate_node.textContent?.startsWith(`#`)
	) {
		const id = hydrate_node.textContent.substring(1);
		hydrate_next();
		return id;
	}

	// @ts-expect-error This way we ensure the id is unique even across Svelte runtimes
	(window.__svelte ??= {}).uid ??= 1;

	// @ts-expect-error
	return `c${window.__svelte.uid++}`;
}
