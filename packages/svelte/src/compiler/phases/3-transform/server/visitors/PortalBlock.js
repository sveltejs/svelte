/** @import { BlockStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';

/**
 * @param {AST.PortalBlock} node
 * @param {ComponentContext} context
 */
export function PortalBlock(node, context) {
	const value = /** @type {import('estree').Expression} */ (context.visit(node.expression));
	const body = /** @type {BlockStatement} */ (context.visit(node.fragment, context.state));

	context.state.template.push(
		b.stmt(b.call('$.portal', b.id('$$renderer'), value, b.arrow([b.id('$$renderer')], body)))
	);
}
