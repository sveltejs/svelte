/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {AST.KeyBlock} node
 * @param {ComponentContext} context
 */
export function KeyBlock(node, context) {
	context.state.template.push('<!>');

	const key = /** @type {Expression} */ (context.visit(node.expression));
	const body = /** @type {Expression} */ (context.visit(node.fragment));

	context.state.init.push(
		b.stmt(b.call('$.key', context.state.node, b.thunk(key), b.arrow([b.id('$$anchor')], body)))
	);
}
