/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const suspend = context.state.analysis.context_preserving_awaits.has(node);

	if (!suspend) {
		return b.call(
			b.await(
				b.call('$.maybe_save', node.argument && /** @type {Expression} */ (context.visit(node.argument)))
			)
		);
	}

	return b.call(
		b.await(
			b.call('$.save', node.argument && /** @type {Expression} */ (context.visit(node.argument)))
		)
	);
}
