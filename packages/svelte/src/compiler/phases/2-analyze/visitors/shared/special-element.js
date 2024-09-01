/** @import { Ast } from '#compiler' */
import * as e from '../../../../errors.js';

/**
 * @param {Ast.SvelteBody | Ast.SvelteDocument | Ast.SvelteOptionsRaw | Ast.SvelteWindow} node
 */
export function disallow_children(node) {
	const { nodes } = node.fragment;

	if (nodes.length > 0) {
		const first = nodes[0];
		const last = nodes[nodes.length - 1];

		e.svelte_meta_invalid_content({ start: first.start, end: last.end }, node.name);
	}
}
