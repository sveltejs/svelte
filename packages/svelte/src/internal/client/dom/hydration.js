import { schedule_task } from './task.js';
import { empty } from './operations.js';

/**
 * Use this variable to guard everything related to hydration code so it can be treeshaken out
 * if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
 */
export let hydrating = false;

/** @param {boolean} value */
export function set_hydrating(value) {
	hydrating = value;
}

/**
 * Array of nodes to traverse for hydration. This will be null if we're not hydrating, but for
 * the sake of simplicity we're not going to use `null` checks everywhere and instead rely on
 * the `hydrating` flag to tell whether or not we're in hydration mode at which point this is set.
 * @type {import('#client').TemplateNode[]}
 */
export let hydrate_nodes = /** @type {any} */ (null);

/**
 * @param {null | import('#client').TemplateNode[]} nodes
 * @returns {void}
 */
export function set_hydrate_nodes(nodes) {
	hydrate_nodes = /** @type {import('#client').TemplateNode[]} */ (nodes);
}

/**
 * @param {Node | null} first
 * @param {boolean} [insert_text] Whether to insert an empty text node if `nodes` is empty
 */
export function update_hydrate_nodes(first, insert_text) {
	const nodes = get_hydrate_nodes(first, insert_text);
	set_hydrate_nodes(nodes);
	return nodes;
}

/**
 * Returns all nodes between the first `<![>...<!]>` comment tag pair encountered.
 * @param {Node | null} node
 * @param {boolean} [insert_text] Whether to insert an empty text node if `nodes` is empty
 * @returns {import('#client').TemplateNode[] | null}
 */
function get_hydrate_nodes(node, insert_text = false) {
	/** @type {import('#client').TemplateNode[]} */
	var nodes = [];

	var current_node = /** @type {null | import('#client').TemplateNode} */ (node);

	var depth = 0;

	var will_start = false;
	var started = false;

	while (current_node !== null) {
		if (current_node.nodeType === 8) {
			var data = /** @type {Comment} */ (current_node).data;

			if (data === '[') {
				depth += 1;
				will_start = true;
			} else if (data === ']') {
				if (!started) {
					// TODO get rid of this — it exists because each blocks are doubly wrapped
					return null;
				}

				if (--depth === 0) {
					if (insert_text && nodes.length === 0) {
						var text = empty();
						nodes.push(text);
						current_node.before(text);
					}

					return nodes;
				}
			}
		}

		if (started) {
			nodes.push(current_node);
		}

		current_node = /** @type {null | import('#client').TemplateNode} */ (current_node.nextSibling);

		started = will_start;
	}

	return null;
}

/**
 * @param {Node} node
 * @returns {void}
 */
export function hydrate_block_anchor(node) {
	if (!hydrating) return;

	// @ts-ignore
	var nodes = node.$$fragment ?? get_hydrate_nodes(node);
	set_hydrate_nodes(nodes);
}

/**
 * Expects to only be called in hydration mode
 * @param {Node} node
 * @returns {Node}
 */
export function capture_fragment_from_node(node) {
	if (
		node.nodeType === 8 &&
		/** @type {Comment} */ (node).data === '[' &&
		hydrate_nodes[hydrate_nodes.length - 1] !== node
	) {
		const nodes = /** @type {Node[]} */ (get_hydrate_nodes(node));
		const last_child = nodes[nodes.length - 1] || node;
		const target = /** @type {Node} */ (last_child.nextSibling);
		// @ts-ignore
		target.$$fragment = nodes;
		schedule_task(() => {
			// @ts-expect-error clean up memory
			target.$$fragment = undefined;
		});
		return target;
	}
	return node;
}
