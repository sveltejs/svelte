/** @import { AST, SvelteNode } from '#compiler' */

/**
 * @param {SvelteNode[]} path
 */
export function mark_subtree_dynamic(path) {
	let i = path.length;
	while (i--) {
		const node = path[i];
		if (node.type === 'Fragment') {
			if (node.metadata.dynamic) return;
			node.metadata.dynamic = true;
		}
	}
}
