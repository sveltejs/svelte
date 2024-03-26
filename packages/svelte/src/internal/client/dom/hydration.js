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

/** @param {import('#client').TemplateNode[]} nodes */
export function set_hydrate_nodes(nodes) {
	hydrate_nodes = nodes;
}

/**
 * This function is only called when `hydrating` is true. If passed a `<![>` opening
 * hydration marker, it finds the corresponding closing marker and sets `hydrate_nodes`
 * to everything between the markers, before returning the closing marker.
 * @param {Node} node
 * @returns {Node}
 */
export function hydrate_anchor(node) {
	if (node.nodeType !== 8) {
		return node;
	}

	var current = /** @type {Node | null} */ (node);

	// TODO this could have false positives, if a user comment consisted of `[`. need to tighten that up
	if (/** @type {Comment} */ (current)?.data !== '[') {
		return node;
	}

	/** @type {Node[]} */
	var nodes = [];
	var depth = 0;

	while ((current = /** @type {Node} */ (current).nextSibling) !== null) {
		if (current.nodeType === 8) {
			var data = /** @type {Comment} */ (current).data;

			if (data === '[') {
				depth += 1;
			} else if (data === ']') {
				if (depth === 0) {
					hydrate_nodes = /** @type {import('#client').TemplateNode[]} */ (nodes);
					return current;
				}

				depth -= 1;
			}
		}

		nodes.push(current);
	}

	throw new Error('Expected a closing hydration marker');
}
