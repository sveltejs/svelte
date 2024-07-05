/** @import { TemplateNode } from '#client' */

/**
 * Use this variable to guard everything related to hydration code so it can be treeshaken out
 * if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
 */
export let hydrating = false;

/** @param {boolean} value */
export function set_hydrating(value) {
	hydrating = value;
}

/** @type {TemplateNode} */
export let hydrate_node;

/** @param {TemplateNode} node */
export function set_hydrate_node(node) {
	return (hydrate_node = node);
}

export function hydrate_next() {
	hydrate_node = /** @type {TemplateNode} */ (hydrate_node.nextSibling);
	return hydrate_node;
}
