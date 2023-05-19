/**
 * @template T
 * @overload
 * @param {T[][]} nodes
 * @param {T[]} [target]
 * @returns {T[]}
 */

/**
 * @template T
 * @overload
 * @param {T[]} nodes
 * @param {T[]} [target]
 * @returns {T[]}
 */

/**
 * @param {any[]} nodes
 * @param {any[]} [target]
 * @returns {any[]}
 */
export function flatten(nodes, target = []) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (Array.isArray(node)) {
			flatten(node, target);
		} else {
			target.push(node);
		}
	}

	return target;
}
