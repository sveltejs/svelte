/** @import { CallExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { transform_inspect_rune } from '../../utils.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	const rune = get_rune(node, context.state.scope);

	switch (rune) {
		case '$host':
			return b.id('$$props.$$host');

		case '$effect.tracking':
			return b.call('$.effect_tracking');

		// TODO can we reuse this logic for normal declarations, i.e. fall through to this?
		case '$state':
		case '$state.raw': {
			let should_proxy = rune === '$state' && true; // TODO

			let value = node.arguments[0] && /** @type {Expression} */ (context.visit(node.arguments[0]));

			if (value && should_proxy) {
				value = b.call('$.proxy', value);
			}

			return b.call('$.state', value);
		}

		case '$derived':
		case '$derived.by': {
			let fn = /** @type {Expression} */ (context.visit(node.arguments[0]));
			if (rune === '$derived') fn = b.thunk(fn);

			return b.call('$.derived', fn);
		}

		case '$state.snapshot':
			return b.call(
				'$.snapshot',
				/** @type {Expression} */ (context.visit(node.arguments[0])),
				is_ignored(node, 'state_snapshot_uncloneable') && b.true
			);

		case '$effect.root':
			return b.call(
				'$.effect_root',
				.../** @type {Expression[]} */ (node.arguments.map((arg) => context.visit(arg)))
			);

		case '$inspect':
		case '$inspect().with':
			return transform_inspect_rune(node, context);
	}

	if (
		dev &&
		node.callee.type === 'MemberExpression' &&
		node.callee.object.type === 'Identifier' &&
		node.callee.object.name === 'console' &&
		context.state.scope.get('console') === null &&
		node.callee.property.type === 'Identifier' &&
		['debug', 'dir', 'error', 'group', 'groupCollapsed', 'info', 'log', 'trace', 'warn'].includes(
			node.callee.property.name
		) &&
		node.arguments.some((arg) => arg.type !== 'Literal') // TODO more cases?
	) {
		return b.call(
			node.callee,
			b.spread(
				b.call(
					'$.log_if_contains_state',
					b.literal(node.callee.property.name),
					.../** @type {Expression[]} */ (node.arguments.map((arg) => context.visit(arg)))
				)
			)
		);
	}

	context.next();
}
