/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { dev } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const save = context.state.analysis.context_preserving_awaits.has(node);

	if (dev || save) {
		return b.call(
			b.await(
				b.call(
					'$.save',
					node.argument && /** @type {Expression} */ (context.visit(node.argument)),
					!save && b.false
				)
			)
		);
	}

	return context.next();
}
