/** @import { Ast } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { build_component } from './shared/component.js';

/**
 * @param {Ast.SvelteComponent} node
 * @param {ComponentContext} context
 */
export function SvelteComponent(node, context) {
	const component = build_component(node, '$$component', context);
	context.state.init.push(component);
}
