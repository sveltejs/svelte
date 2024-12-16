/** @import { AssignmentExpression, AssignmentOperator, Expression, Pattern } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { Context, ServerTransformState } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { build_assignment_value } from '../../../../utils/ast.js';
import { visit_assignment_expression } from '../../shared/assignments.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	return visit_assignment_expression(node, context, build_assignment) ?? context.next();
}

/**
 * Only returns an expression if this is not a `$store` assignment, as others can be kept as-is
 * @param {AssignmentOperator} operator
 * @param {Pattern} left
 * @param {Expression} right
 * @param {import('zimmerframe').Context<AST.SvelteNode, ServerTransformState>} context
 * @returns {Expression | null}
 */
function build_assignment(operator, left, right, context) {
	let object = left;

	while (object.type === 'MemberExpression') {
		// @ts-expect-error
		object = object.object;
	}

	if (object.type !== 'Identifier' || !is_store_name(object.name)) {
		return null;
	}

	const name = object.name.slice(1);

	if (!context.state.scope.get(name)) {
		return null;
	}

	if (object === left) {
		let value = /** @type {Expression} */ (
			context.visit(build_assignment_value(operator, left, right))
		);

		return b.call('$.store_set', b.id(name), value);
	}

	return b.call(
		'$.store_mutate',
		b.assignment('??=', b.id('$$store_subs'), b.object([])),
		b.literal(object.name),
		b.id(name),
		b.assignment(
			operator,
			/** @type {Pattern} */ (context.visit(left)),
			/** @type {Expression} */ (context.visit(right))
		)
	);
}

/**
 * @param {string} name
 */
function is_store_name(name) {
	return name[0] === '$' && /[A-Za-z_]/.test(name[1]);
}
