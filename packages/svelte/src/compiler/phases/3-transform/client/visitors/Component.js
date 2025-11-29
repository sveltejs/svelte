/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { build_component } from './shared/component.js';

/**
 * @param {AST.Component} node
 * @param {ComponentContext} context
 */
export function Component(node, context) {
	const component = build_component(node, node.id, context);
	context.state.init.push(component);
}
