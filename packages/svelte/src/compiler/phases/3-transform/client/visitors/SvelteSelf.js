/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { component_name } from '../../../../state.js';
import { build_component } from './shared/component.js';

/**
 * @param {AST.SvelteSelf} node
 * @param {ComponentContext} context
 */
export function SvelteSelf(node, context) {
	const component = build_component(node, component_name, node.name_loc, context);
	context.state.init.push(component);
}
