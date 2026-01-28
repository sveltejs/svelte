/** @import { AssignmentExpression, AssignmentOperator, Expression, Node, Pattern, Statement } from 'estree' */
/** @import { Context as ClientContext } from '../client/types.js' */
/** @import { Context as ServerContext } from '../server/types.js' */
import { extract_paths, is_expression_async } from '../../../utils/ast.js';
import * as b from '#compiler/builders';
import { get_value } from '../client/visitors/shared/declarations.js';

/**
 * @template {ClientContext | ServerContext} Context
 * @param {AssignmentExpression} node
 * @param {Context} context
 * @param {(operator: AssignmentOperator, left: Pattern, right: Expression, context: Context) => Expression | null} build_assignment
 * @returns
 */
export function visit_assignment_expression(node, context, build_assignment) {
	if (
		node.left.type === 'ArrayPattern' ||
		node.left.type === 'ObjectPattern' ||
		node.left.type === 'RestElement'
	) {
		const value = /** @type {Expression} */ (context.visit(node.right));
		const should_cache = value.type !== 'Identifier';
		const rhs = should_cache ? b.id('$$value') : value;

		let changed = false;

		const { inserts, paths } = extract_paths(node.left, rhs);

		for (const { id } of inserts) {
			id.name = context.state.scope.generate('$$array');
		}

		const assignments = paths.map((path) => {
			const value = path.expression;

			let assignment = build_assignment('=', path.node, value, context);
			if (assignment !== null) changed = true;

			return (
				assignment ??
				b.assignment(
					'=',
					/** @type {Pattern} */ (context.visit(path.node)),
					/** @type {Expression} */ (context.visit(value))
				)
			);
		});

		if (!changed) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return null;
		}

		const is_standalone = /** @type {Node} */ (context.path.at(-1)).type.endsWith('Statement');

		if (inserts.length > 0 || should_cache) {
			/** @type {Statement[]} */
			const statements = [
				...inserts.map(({ id, value }) => b.var(id, value)),
				...assignments.map(b.stmt)
			];

			if (!is_standalone) {
				// this is part of an expression, we need the sequence to end with the value
				statements.push(b.return(rhs));
			}

			const async =
				is_expression_async(value) ||
				assignments.some((assignment) => is_expression_async(assignment));

			const iife = b.arrow([rhs], b.block(statements), async);
			const call = b.call(iife, value);

			return async ? b.await(call) : call;
		}

		const sequence = b.sequence(assignments);

		if (!is_standalone) {
			// this is part of an expression, we need the sequence to end with the value
			sequence.expressions.push(rhs);
		}

		return sequence;
	}

	if (node.left.type !== 'Identifier' && node.left.type !== 'MemberExpression') {
		throw new Error(`Unexpected assignment type ${node.left.type}`);
	}

	return build_assignment(node.operator, node.left, node.right, context);
}
