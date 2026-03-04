/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { build_component } from './shared/component.js';
import * as b from '#compiler/builders';

/**
 * @param {AST.SvelteComponent} node
 * @param {ComponentContext} context
 */
export function SvelteComponent(node, context) {
	const component = build_component(node, '$$component', null, context);
	context.state.init.push(component);
}
