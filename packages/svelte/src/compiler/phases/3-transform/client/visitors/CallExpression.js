/** @import { CallExpression, Expression, Identifier, MemberExpression, Node } from 'estree' */
/** @import { Context } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { transform_inspect_rune } from '../../utils.js';
import * as e from '../../../../errors.js';
import { should_proxy } from '../utils.js';
import { get_name } from '../../../nodes.js';

/**
 * @param {CallExpression} node
 * @param {Context} context
 */
export function CallExpression(node, context) {
	/**
	 * Some nodes that get replaced should keep their locations (for better source maps and such)
	 * @template {Node} N
	 * @param {N} node
	 * @param {N} replacement
	 * @returns {N}
	 */
	function attach_locations(node, replacement) {
		return {
			...replacement,
			start: node.start,
			end: node.end,
			loc: node.loc
		};
	}
	const rune = get_rune(node, context.state.scope);

	switch (rune) {
		case '$host':
			return b.id('$$props.$$host');

		case '$effect.tracking':
			return b.call('$.effect_tracking');

		// transform state field assignments in constructors
		case '$state':
		case '$state.raw': {
			let arg = node.arguments[0];

			/** @type {Expression | undefined} */
			let value = undefined;

			if (arg) {
				value = /** @type {Expression} */ (context.visit(node.arguments[0]));

				if (
					rune === '$state' &&
					should_proxy(/** @type {Expression} */ (arg), context.state.scope)
				) {
					value = b.call('$.proxy', value);
				}
			}

			return b.call('$.state', value);
		}

		case '$derived':
		case '$derived.by': {
			let fn = /** @type {Expression} */ (context.visit(node.arguments[0]));

			return b.call('$.derived', rune === '$derived' ? b.thunk(fn) : fn);
		}

		case '$state.snapshot':
			return b.call(
				'$.snapshot',
				/** @type {Expression} */ (context.visit(node.arguments[0])),
				is_ignored(node, 'state_snapshot_uncloneable') && b.true
			);
		/* eslint-disable no-fallthrough */
		case '$state.invalidate':
			if (node.arguments[0].type === 'Identifier') {
				return b.call(
					attach_locations(/** @type {Expression} */ (node.callee), b.id('$.invalidate')),
					node.arguments[0]
				);
			} else if (node.arguments[0].type === 'MemberExpression') {
				const { object, property } = node.arguments[0];
				if (object.type === 'ThisExpression') {
					const name = /** @type {string} */ (get_name(property));
					const field = context.state.state_fields.get(name);
					if (!field || (field.type !== '$state' && field.type !== '$state.raw')) {
						e.state_invalidate_nonreactive_argument(node);
					}
					return b.call(
						attach_locations(/** @type {Expression} */ (node.callee), b.id('$.invalidate')),
						attach_locations(node.arguments[0], b.member(object, field.key))
					);
				}
				/** @type {Expression[]} */
				const source_args = /** @type {Expression[]} */ ([
					context.visit(object),
					node.arguments[0].computed
						? context.visit(property)
						: b.literal(/** @type {Identifier} */ (property).name)
				]);
				const arg = b.call('$.lookup_source', ...source_args);
				return b.call(
					attach_locations(/** @type {Expression} */ (node.callee), b.id('$.invalidate')),
					attach_locations(
						/** @type {Expression} */ (node.arguments[0]),
						/** @type {Expression} */ (arg)
					)
				);
			}

		case '$effect.root':
			return b.call(
				'$.effect_root',
				.../** @type {Expression[]} */ (node.arguments.map((arg) => context.visit(arg)))
			);

		case '$effect.pending':
			return b.call('$.pending');

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
		node.arguments.some(
			(arg) => arg.type === 'SpreadElement' || context.state.scope.evaluate(arg).has_unknown
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

	context.next();
}
