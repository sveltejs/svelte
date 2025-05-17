/** @import { CallExpression, Expression } from 'estree' */
/** @import { Context } from '../types.js' */
import { is_ignored } from '../../../../state.js';
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { transform_inspect_rune } from '../../utils.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const rune = get_rune(node, context.state.scope);

	if (rune === '$host') {
		return b.void0;
	}

	if (rune === '$effect.tracking') {
		return b.false;
	}

	if (rune === '$effect.root') {
		// ignore $effect.root() calls, just return a noop which mimics the cleanup function
		return b.arrow([], b.block([]));
	}

	if (rune === '$state' || rune === '$state.raw') {
		return node.arguments[0] ? context.visit(node.arguments[0]) : b.void0;
	}

	if (rune === '$derived' || rune === '$derived.by') {
		const fn = /** @type {Expression} */ (context.visit(node.arguments[0]));
		return b.call('$.once', rune === '$derived' ? b.thunk(fn) : fn);
	}

	if (rune === '$state.snapshot') {
		return b.call(
			'$.snapshot',
			/** @type {Expression} */ (context.visit(node.arguments[0])),
			is_ignored(node, 'state_snapshot_uncloneable') && b.true
		);
	}

	if (rune === '$inspect' || rune === '$inspect().with') {
		return transform_inspect_rune(node, context);
	}

	context.next();
}
