/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.KeyBlock} node
 * @param {ComponentContext} context
 */
export function KeyBlock(node, context) {
	context.state.template.push('<!>');

	const key = /** @type {Expression} */ (context.visit(node.expression));
	const body = /** @type {Expression} */ (context.visit(node.fragment));

	if (node.metadata.expression.has_await) {
		context.state.init.push(
			b.stmt(
				b.call(
					'$.async',
					context.state.node,
					b.array([b.thunk(key, true)]),
					b.arrow(
						[context.state.node, b.id('$$key')],
						b.block([
							b.stmt(
								b.call(
									'$.key',
									context.state.node,
									b.thunk(b.call('$.get', b.id('$$key'))),
									b.arrow([b.id('$$anchor')], body)
								)
							)
						])
					)
				)
			)
		);
	} else {
		context.state.init.push(
			b.stmt(b.call('$.key', context.state.node, b.thunk(key), b.arrow([b.id('$$anchor')], body)))
		);
	}
}
