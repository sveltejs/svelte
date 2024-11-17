/** @import { BlockStatement, Expression, Pattern, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { is_hydratable } from '../../../../../internal/server/hydration.js';
import * as b from '../../../../utils/builders.js';
import { empty_comment } from './shared/utils.js';

/**
 * @param {AST.AwaitBlock} node
 * @param {ComponentContext} context
 */
export function AwaitBlock(node, context) {
	const hydratable = is_hydratable();
	const templates = /** @type {Array<Expression | Statement>} */ ([
		b.stmt(
			b.call(
				'$.await',
				/** @type {Expression} */ (context.visit(node.expression)),
				b.thunk(
					node.pending ? /** @type {BlockStatement} */ (context.visit(node.pending)) : b.block([])
				),
				b.arrow(
					node.value ? [/** @type {Pattern} */ (context.visit(node.value))] : [],
					node.then ? /** @type {BlockStatement} */ (context.visit(node.then)) : b.block([])
				),
				b.arrow(
					node.error ? [/** @type {Pattern} */ (context.visit(node.error))] : [],
					node.catch ? /** @type {BlockStatement} */ (context.visit(node.catch)) : b.block([])
				)
			)
		)
	]);

	if (hydratable) {
		templates.unshift(empty_comment);
		templates.push(empty_comment);
	}

	context.state.template.push(...templates);
}
