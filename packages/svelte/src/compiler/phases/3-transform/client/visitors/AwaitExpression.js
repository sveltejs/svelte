/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {ComponentContext} context
 */
export function AwaitExpression(node, context) {
	if (!context.state.analysis.runes) {
		return context.next();
	}

	const block = context.state.analysis.blocking_awaits.has(node);

	return b.call(
		b.member(
			b.await(
				b.call(
					'$.preserve_context',
					node.argument && /** @type {Expression} */ (context.visit(node.argument)),
					block && b.true
				)
			),
			'read'
		)
	);
}
