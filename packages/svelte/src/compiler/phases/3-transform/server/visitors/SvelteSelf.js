/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { build_inline_component } from './shared/component.js';

/**
 * @param {AST.SvelteSelf} node
 * @param {ComponentContext} context
 */
export function SvelteSelf(node, context) {
	build_inline_component(node, b.id(context.state.analysis.name), context);
}
