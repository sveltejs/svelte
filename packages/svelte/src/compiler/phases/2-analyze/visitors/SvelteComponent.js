/** @import { SvelteComponent } from '#compiler' */
/** @import { Context } from '../types' */
import { visit_component } from './shared/component.js';

/**
 * @param {SvelteComponent} node
 * @param {Context} context
 */
export function SvelteComponent(node, context) {
	visit_component(node, context);
}
