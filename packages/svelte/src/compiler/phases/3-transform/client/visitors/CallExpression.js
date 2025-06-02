/** @import { CallExpression, ClassDeclaration, ClassExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import { dev, is_ignored } from '../../../../state.js';
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { transform_inspect_rune } from '../../utils.js';
import { should_proxy } from '../utils.js';
import { get_name } from '../../../nodes.js';

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
			let source_tag;
			const parent = context.path.at(-1);
			if (
				dev &&
				parent?.type === 'AssignmentExpression' &&
				parent?.left?.type === 'MemberExpression' &&
				context.state.in_constructor
			) {
				/** @type {ClassDeclaration | ClassExpression} */
				const constructor = /** @type {ClassDeclaration | ClassExpression} */ (
					context.path.findLast((parent) => parent.type.match(/^Class(Declaration|Expression)$/))
				);
				const property = get_name(parent.left.property);
				source_tag = `${constructor?.id?.name ?? '[class]'}.${property}`;
			}
			const call = b.call('$.state', value);
			return dev ? b.call('$.tag', call, b.literal(/** @type {string} */ (source_tag))) : call;
		}

		case '$derived':
		case '$derived.by': {
			let fn = /** @type {Expression} */ (context.visit(node.arguments[0]));
			if (rune === '$derived') fn = b.thunk(fn);
			let source_tag;
			const parent = context.path.at(-1);
			if (
				dev &&
				parent?.type === 'AssignmentExpression' &&
				parent?.left?.type === 'MemberExpression' &&
				context.state.in_constructor
			) {
				/** @type {ClassDeclaration | ClassExpression} */
				const constructor = /** @type {ClassDeclaration | ClassExpression} */ (
					context.path.findLast((parent) => parent.type.match(/^Class(Declaration|Expression)$/))
				);
				const property = get_name(parent.left.property);
				source_tag = `${constructor?.id?.name ?? '[class]'}.${property}`;
			}
			const call = b.call('$.derived', fn);
			return dev ? b.call('$.tag', call, b.literal(/** @type {string} */ (source_tag))) : call;
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
