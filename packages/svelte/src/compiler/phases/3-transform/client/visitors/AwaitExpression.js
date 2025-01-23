/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const suspend = context.state.analysis.suspenders.has(node);

	if (!suspend) {
		return context.next();
	}

	return b.call(
		b.member(
			b.await(
				b.call(
					'$.suspend',
					node.argument && b.thunk(/** @type {Expression} */ (context.visit(node.argument)))
				)
			),
			'exit'
		)
	);
}
