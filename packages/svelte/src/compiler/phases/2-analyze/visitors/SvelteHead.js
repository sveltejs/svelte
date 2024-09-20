/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.SvelteHead} node
 * @param {Context} context
 */
export function SvelteHead(node, context) {
	for (const attribute of node.attributes) {
		e.svelte_head_illegal_attribute(attribute);
	}

	mark_subtree_dynamic(context.path);

	context.next();
}
