/** @import { SvelteComponent } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { serialize_component } from './shared/component.js';

/**
 * @param {SvelteComponent} node
 * @param {ComponentContext} context
 */
export function SvelteComponent(node, context) {
	const component = serialize_component(node, '$$component', context);
	context.state.init.push(component);
}
