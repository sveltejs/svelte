/** @import { TemplateNode } from '#client' */
import { HYDRATION_START } from '../../../constants.js';

/**
 * Use this variable to guard everything related to hydration code so it can be treeshaken out
 * if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
 */
export let hydrating = false;

/** @param {boolean} value */
export function set_hydrating(value) {
	hydrating = value;
}

/** @type {Comment} */
export let hydrate_open;

/** @type {TemplateNode} */
export let hydrate_node;

/** @param {Comment} node */
export function set_hydrate_open(node) {
	hydrate_open = node;
	hydrate_node = node.nextSibling;
}

/** @param {TemplateNode} node */
export function set_hydrate_node(node) {
	hydrate_node = node;
}

/**
 * Array of nodes to traverse for hydration. This will be null if we're not hydrating, but for
 * the sake of simplicity we're not going to use `null` checks everywhere and instead rely on
 * the `hydrating` flag to tell whether or not we're in hydration mode at which point this is set.
 * @type {import('#client').TemplateNode[]}
 */
export let hydrate_nodes = /** @type {any} */ (null);

/** @type {import('#client').TemplateNode} */
export let hydrate_start;

/** @param {import('#client').TemplateNode[]} nodes */
export function set_hydrate_nodes(nodes) {
	hydrate_nodes = nodes;
	hydrate_start = nodes && nodes[0];
}

/**
 * When assigning nodes to an effect during hydration, we typically want the hydration boundary comment node
 * immediately before `hydrate_start`. In some cases, this comment doesn't exist because we optimized it away.
 * TODO it might be worth storing this value separately rather than retrieving it with `previousSibling`
 */
export function get_start() {
	return hydrate_open;

	return /** @type {import('#client').TemplateNode} */ (
		hydrate_start.previousSibling ?? hydrate_start
	);
}

/**
 *
 * @param {TemplateNode} node
 */
export function hydrate_anchor(node) {
	if (node.nodeType === 8 && /** @type {Comment} */ (node).data === HYDRATION_START) {
		set_hydrate_open(/** @type {Comment} */ (node));
	}

	return node;
}
