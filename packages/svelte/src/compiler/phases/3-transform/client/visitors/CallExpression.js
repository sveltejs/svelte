/** @import { CallExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';
import { transform_inspect_rune } from '../../utils.js';
import { trace } from '../utils.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	switch (get_rune(node, context.state.scope)) {
		case '$host':
			return b.id('$$props.$$host');

		case '$effect.tracking':
			return b.call('$.effect_tracking');

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

		case '$trace':
			return b.empty;
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
		)
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

	const parent = context.path.at(-1);

	if (dev && parent?.type !== 'AwaitExpression') {
		return trace(
			node,
			{
				...node,
				callee: /** @type {Expression} */ (context.visit(node.callee)),
				arguments: node.arguments.map((arg) => /** @type {Expression} */ (context.visit(arg)))
			},
			context.state
		);
	}

	context.next();
}
