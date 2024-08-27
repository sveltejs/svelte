/** @import { SvelteBody } from '#compiler' */
/** @import { Context } from '../types' */
import { disallow_children } from './shared/special-element.js';

/**
 * @param {SvelteBody} node
 * @param {Context} context
 */
export function SvelteBody(node, context) {
	disallow_children(node);
	context.next();
}
