import { hydrate_nodes, hydrate_block_anchor, hydrating } from './hydration.js';
import { child, clone_node, empty } from './operations.js';
import {
	create_fragment_from_html,
	create_fragment_with_script_from_html,
	insert
} from './reconciler.js';
import { current_effect } from '../runtime.js';
import { is_array } from '../utils.js';

/**
 * @param {string} html
 * @param {boolean} return_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function template(html, return_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = create_fragment_from_html(html);
			cached_content = return_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {string} html
 * @param {boolean} return_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function template_with_script(html, return_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = create_fragment_with_script_from_html(html);
			cached_content = return_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {string} svg
 * @param {boolean} return_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function svg_template(svg, return_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = /** @type {Node} */ (child(create_fragment_from_html(`<svg>${svg}</svg>`)));
			cached_content = return_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {string} svg
 * @param {boolean} return_fragment
 * @returns {() => Node}
 */
/*#__NO_SIDE_EFFECTS__*/
export function svg_template_with_script(svg, return_fragment) {
	/** @type {undefined | Node} */
	let cached_content;
	return () => {
		if (cached_content === undefined) {
			const content = /** @type {Node} */ (child(create_fragment_from_html(`<svg>${svg}</svg>`)));
			cached_content = return_fragment ? content : /** @type {Node} */ (child(content));
		}
		return cached_content;
	};
}

/**
 * @param {boolean} is_fragment
 * @param {boolean} use_clone_node
 * @param {null | Text | Comment | Element} anchor
 * @param {() => Node} [template_element_fn]
 * @returns {Element | DocumentFragment | Node[]}
 */
function open_template(is_fragment, use_clone_node, anchor, template_element_fn) {
	if (hydrating) {
		if (anchor !== null) {
			hydrate_block_anchor(anchor);
		}
		// In ssr+hydration optimization mode, we might remove the template_element,
		// so we need to is_fragment flag to properly handle hydrated content accordingly.
		const nodes = hydrate_nodes;
		if (nodes !== null) {
			return is_fragment ? nodes : /** @type {Element} */ (nodes[0]);
		}
	}
	return use_clone_node
		? clone_node(/** @type {() => Element} */ (template_element_fn)(), true)
		: document.importNode(/** @type {() => Element} */ (template_element_fn)(), true);
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {() => Node} template_element_fn
 * @param {boolean} [use_clone_node]
 * @returns {Element | DocumentFragment | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function open(anchor, template_element_fn, use_clone_node = true) {
	return open_template(false, use_clone_node, anchor, template_element_fn);
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {() => Node} template_element_fn
 * @param {boolean} [use_clone_node]
 * @returns {Element | DocumentFragment | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
export function open_frag(anchor, template_element_fn, use_clone_node = true) {
	return open_template(true, use_clone_node, anchor, template_element_fn);
}

const space_template = template(' ', false);
const comment_template = template('<!>', true);

/**
 * @param {Text | Comment | Element | null} anchor
 */
/*#__NO_SIDE_EFFECTS__*/
export function space_frag(anchor) {
	/** @type {Node | null} */
	var node = /** @type {any} */ (open(anchor, space_template));
	// if an {expression} is empty during SSR, there might be no
	// text node to hydrate (or an anchor comment is falsely detected instead)
	//  — we must therefore create one
	if (hydrating && node?.nodeType !== 3) {
		node = empty();
		// @ts-ignore in this case the anchor should always be a comment,
		// if not something more fundamental is wrong and throwing here is better to bail out early
		anchor.before(node);
	}
	return node;
}

/**
 * @param {Text | Comment | Element} anchor
 */
/*#__NO_SIDE_EFFECTS__*/
export function space(anchor) {
	// if an {expression} is empty during SSR, there might be no
	// text node to hydrate (or an anchor comment is falsely detected instead)
	//  — we must therefore create one
	if (hydrating && anchor.nodeType !== 3) {
		const node = empty();
		anchor.before(node);
		return node;
	}
	return anchor;
}

/**
 * @param {null | Text | Comment | Element} anchor
 */
/*#__NO_SIDE_EFFECTS__*/
export function comment(anchor) {
	return open_frag(anchor, comment_template);
}

/**
 * Assign the created (or in hydration mode, traversed) dom elements to the current block
 * and insert the elements into the dom (in client mode).
 * @param {Element | Text} dom
 * @param {boolean} is_fragment
 * @param {null | Text | Comment | Element} anchor
 * @returns {import('#client').Dom}
 */
function close_template(dom, is_fragment, anchor) {
	/** @type {import('#client').Dom} */
	var current = is_fragment
		? is_array(dom)
			? dom
			: /** @type {import('#client').TemplateNode[]} */ (Array.from(dom.childNodes))
		: dom;

	if (!hydrating && anchor !== null) {
		insert(current, anchor);
	}

	/** @type {import('#client').Effect} */ (current_effect).dom = current;

	return current;
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {Element | Text} dom
 */
export function close(anchor, dom) {
	return close_template(dom, false, anchor);
}

/**
 * @param {null | Text | Comment | Element} anchor
 * @param {Element | Text} dom
 */
export function close_frag(anchor, dom) {
	return close_template(dom, true, anchor);
}
