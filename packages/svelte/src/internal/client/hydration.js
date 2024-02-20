// Handle hydration

import { empty } from './operations.js';
import { schedule_task } from './runtime.js';

/**
 * Use this variable to guard everything related to hydration code so it can be treeshaken out
 * if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
 */
export let hydrating = false;

/**
 * Array of nodes to traverse for hydration. This will be null if we're not hydrating, but for
 * the sake of simplicity we're not going to use `null` checks everywhere and instead rely on
 * the `hydrating` flag to tell whether or not we're in hydration mode at which point this is set.
 * @type {import('./types.js').TemplateNode[]}
 */
export let current_hydration_fragment = /** @type {any} */ (null);

/**
 * @param {null | import('./types.js').TemplateNode[]} fragment
 * @returns {void}
 */
export function set_current_hydration_fragment(fragment) {
	hydrating = fragment !== null;
	current_hydration_fragment = /** @type {import('./types.js').TemplateNode[]} */ (fragment);
}

/**
 * Returns all nodes between the first `<!--ssr:...-->` comment tag pair encountered.
 * @param {Node | null} node
 * @param {boolean} [insert_text] Whether to insert an empty text node if the fragment is empty
 * @returns {import('./types.js').TemplateNode[] | null}
 */
export function get_hydration_fragment(node, insert_text = false) {
	/** @type {import('./types.js').TemplateNode[]} */
	const fragment = [];

	/** @type {null | Node} */
	let current_node = node;

	/** @type {null | string} */
	let target_depth = null;
	while (current_node !== null) {
		const node_type = current_node.nodeType;
		const next_sibling = current_node.nextSibling;
		if (node_type === 8) {
			const data = /** @type {Comment} */ (current_node).data;
			if (data.startsWith('ssr:')) {
				const depth = data.slice(4);
				if (target_depth === null) {
					target_depth = depth;
				} else if (depth === target_depth) {
					if (insert_text && fragment.length === 0) {
						const text = empty();
						fragment.push(text);
						/** @type {Node} */ (current_node.parentNode).insertBefore(text, current_node);
					}
					return fragment;
				} else {
					fragment.push(/** @type {Text | Comment | Element} */ (current_node));
				}
				current_node = next_sibling;
				continue;
			}
		}
		if (target_depth !== null) {
			fragment.push(/** @type {Text | Comment | Element} */ (current_node));
		}
		current_node = next_sibling;
	}
	return null;
}

/**
 * @param {Text | Comment | Element} anchor_node
 * @param {boolean} [is_controlled]
 * @returns {void}
 */
export function hydrate_block_anchor(anchor_node, is_controlled) {
	if (hydrating) {
		/** @type {Node} */
		let target_node = anchor_node;

		if (is_controlled) {
			target_node = /** @type {Node} */ (target_node.firstChild);
		}
		if (target_node.nodeType === 8) {
			// @ts-ignore
			let fragment = target_node.$$fragment;
			if (fragment === undefined) {
				fragment = get_hydration_fragment(target_node);
			} else {
				schedule_task(() => {
					// @ts-expect-error clean up memory
					target_node.$$fragment = undefined;
				});
			}
			set_current_hydration_fragment(fragment);
		} else {
			const first_child = /** @type {Element | null} */ (target_node.firstChild);
			set_current_hydration_fragment(first_child === null ? [] : [first_child]);
		}
	}
}
