/** @import { CallExpression, Expression, MemberExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import { dev, is_ignored } from '../../../../state.js';
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { get_inspect_args } from '../../utils.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const rune = get_rune(node, context.state.scope);

	if (
		rune === '$host' ||
		rune === '$effect' ||
		rune === '$effect.pre' ||
		rune === '$inspect.trace'
	) {
		// we will only encounter `$effect` etc if they are top-level statements in the <script>
		// following an `await`, otherwise they are removed by the ExpressionStatement visitor
		return b.void0;
	}

	if (rune === '$effect.tracking') {
		return b.false;
	}

	if (rune === '$effect.root') {
		// ignore $effect.root() calls, just return a noop which mimics the cleanup function
		return b.arrow([], b.block([]));
	}

	if (rune === '$effect.pending') {
		return b.literal(0);
	}

	if (rune === '$state' || rune === '$state.raw') {
		return node.arguments[0] ? context.visit(node.arguments[0]) : b.void0;
	}

	if (rune === '$derived' || rune === '$derived.by') {
		const fn = /** @type {Expression} */ (context.visit(node.arguments[0]));
		return b.call('$.derived', rune === '$derived' ? b.thunk(fn) : fn);
	}

	if (rune === '$state.eager') {
		return node.arguments[0];
	}

	if (rune === '$state.snapshot') {
		return b.call(
			'$.snapshot',
			/** @type {Expression} */ (context.visit(node.arguments[0])),
			is_ignored(node, 'state_snapshot_uncloneable') && b.true
		);
	}

	if (rune === '$inspect' || rune === '$inspect().with') {
		if (!dev) return b.empty;

		const { args, inspector } = get_inspect_args(rune, node, context.visit);

		return rune === '$inspect'
			? b.call(inspector, b.literal('$inspect('), ...args, b.literal(')'))
			: b.call(inspector, b.literal('init'), ...args);
	}

	context.next();
}
