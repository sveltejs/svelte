/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { component_name } from '../../../../state.js';
import { build_component } from './shared/component.js';
import * as b from '#compiler/builders';

/**
 * @param {AST.SvelteSelf} node
 * @param {ComponentContext} context
 */
export function SvelteSelf(node, context) {
	const component = build_component(node, b.id(component_name), context);
	context.state.init.push(component);
}
