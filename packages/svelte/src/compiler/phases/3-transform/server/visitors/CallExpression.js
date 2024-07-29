/** @import { CallExpression, Expression } from 'estree' */
/** @import { Context } from '../types.js' */
import { get_rune } from '../../../scope.js';
import * as b from '../../../../utils/builders.js';
import { transform_inspect_rune } from '../../utils.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const rune = get_rune(node, context.state.scope);

	if (rune === '$host') {
		return b.id('undefined');
	}

	if (rune === '$effect.tracking') {
		return b.literal(false);
	}

	if (rune === '$effect.root') {
		// ignore $effect.root() calls, just return a noop which mimics the cleanup function
		return b.arrow([], b.block([]));
	}

	if (rune === '$state.snapshot') {
		return b.call('$.snapshot', /** @type {Expression} */ (context.visit(node.arguments[0])));
	}

	if (rune === '$state.is') {
		return b.call(
			'Object.is',
			/** @type {Expression} */ (context.visit(node.arguments[0])),
			/** @type {Expression} */ (context.visit(node.arguments[1]))
		);
	}

	if (rune === '$inspect' || rune === '$inspect().with') {
		return transform_inspect_rune(node, context);
	}

	context.next();
}
