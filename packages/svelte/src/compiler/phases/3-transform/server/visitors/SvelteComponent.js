/** @import { Expression } from 'estree' */
/** @import { Ast } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { build_inline_component } from './shared/component.js';

/**
 * @param {Ast.SvelteComponent} node
 * @param {ComponentContext} context
 */
export function SvelteComponent(node, context) {
	build_inline_component(node, /** @type {Expression} */ (context.visit(node.expression)), context);
}
