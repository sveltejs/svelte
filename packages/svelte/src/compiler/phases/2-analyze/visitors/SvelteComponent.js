/** @import { SvelteComponent } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_component } from './shared/component.js';

/**
 * @param {SvelteComponent} node
 * @param {Context} context
 */
export function SvelteComponent(node, context) {
	validate_component(node, context);
}
