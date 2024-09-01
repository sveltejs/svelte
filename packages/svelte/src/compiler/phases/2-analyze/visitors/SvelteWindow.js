/** @import { SvelteWindow } from '#compiler' */
/** @import { Context } from '../types' */
import { disallow_children } from './shared/special-element.js';

/**
 * @param {SvelteWindow} node
 * @param {Context} context
 */
export function SvelteWindow(node, context) {
	disallow_children(node);
	context.next();
}
