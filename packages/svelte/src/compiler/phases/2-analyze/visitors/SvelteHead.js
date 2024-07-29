/** @import { SvelteHead } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {SvelteHead} node
 * @param {Context} context
 */
export function SvelteHead(node, context) {
	const attribute = node.attributes[0];
	if (attribute) {
		e.svelte_head_illegal_attribute(attribute);
	}

	context.next();
}
