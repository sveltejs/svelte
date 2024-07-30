/** @import { SvelteHead } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {SvelteHead} node
 * @param {Context} context
 */
export function SvelteHead(node, context) {
	for (const attribute of node.attributes) {
		e.svelte_head_illegal_attribute(attribute);
	}

	context.next();
}
