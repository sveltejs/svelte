/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const argument = /** @type {Expression} */ (context.visit(node.argument));

	if (context.state.analysis.pickled_awaits.has(node)) {
		return b.call(b.await(b.call('$.save', argument)));
	}

	return argument === node.argument ? node : { ...node, argument };
}
