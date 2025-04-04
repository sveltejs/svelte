/** @import { CallExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';
import { transform_inspect_rune } from '../../utils.js';
import * as e from '../../../../errors.js';

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
		/* eslint-disable no-fallthrough */
		case '$state.invalidate':
			if (node.arguments[0].type === 'Identifier') {
				return b.call('$.invalidate', node.arguments[0]);
			} else if (node.arguments[0].type === 'MemberExpression') {
				const { property } = node.arguments[0];
				let field;
				switch (property.type) {
					case 'Identifier':
						field = context.state.public_state.get(property.name);
						break;
					case 'PrivateIdentifier':
						field = context.state.private_state.get(property.name);
						break;
				}
				if (!field || (field.kind !== 'state' && field.kind !== 'raw_state')) {
					e.state_invalidate_nonreactive_argument(node);
				}
				return b.call('$.invalidate', b.member(b.this, field.id));
			}

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
