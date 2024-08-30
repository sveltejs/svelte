/** @import { SvelteBody } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { disallow_children } from './shared/special-element.js';

/**
 * @param {SvelteBody} node
 * @param {Context} context
 */
export function SvelteBody(node, context) {
	disallow_children(node);
	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') {
			e.svelte_body_illegal_attribute(attribute);
		}
	}
	context.next();
}
