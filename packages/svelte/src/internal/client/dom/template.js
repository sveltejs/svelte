import { hydrate_nodes, hydrating } from './hydration.js';
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
 * @param {() => Node} [template_element_fn]
 * @returns {Element | DocumentFragment | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
function open_template(is_fragment, use_clone_node, template_element_fn) {
	if (hydrating) {
		return is_fragment ? hydrate_nodes : /** @type {Element} */ (hydrate_nodes[0]);
	}

	return use_clone_node
		? clone_node(/** @type {() => Element} */ (template_element_fn)(), true)
		: document.importNode(/** @type {() => Element} */ (template_element_fn)(), true);
}

/**
 * @param {() => Node} template_element_fn
 * @param {boolean} [use_clone_node]
 * @returns {Element}
 */
export function open(template_element_fn, use_clone_node = true) {
	return /** @type {Element} */ (open_template(false, use_clone_node, template_element_fn));
}

/**
 * @param {() => Node} template_element_fn
 * @param {boolean} [use_clone_node]
 * @returns {Element | DocumentFragment | Node[]}
 */
export function open_frag(template_element_fn, use_clone_node = true) {
	return open_template(true, use_clone_node, template_element_fn);
}

const comment_template = template('<!>', true);

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
export function comment() {
	return open_frag(comment_template);
}

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
