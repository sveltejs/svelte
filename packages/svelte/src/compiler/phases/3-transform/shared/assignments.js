/** @import { AssignmentExpression, AssignmentOperator, Expression, Identifier, Node, Pattern } from 'estree' */
/** @import { Context as ClientContext } from '../client/types.js' */
/** @import { Context as ServerContext } from '../server/types.js' */
import { build_pattern, is_expression_async } from '../../../utils/ast.js';
import * as b from '#compiler/builders';

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

		const [pattern, replacements] = build_pattern(node.left, context.state.scope);

		const assignments = [
			b.let(pattern, rhs),
			...[...replacements].map(([original, replacement]) => {
				let assignment = build_assignment(node.operator, original, replacement, context);
				if (assignment !== null) changed = true;
				return b.stmt(
					assignment ??
						b.assignment(
							node.operator,
							/** @type {Identifier} */ (context.visit(original)),
							/** @type {Expression} */ (context.visit(replacement))
						)
				);
			})
		];

		if (!changed) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return null;
		}

		const is_standalone = /** @type {Node} */ (context.path.at(-1)).type.endsWith('Statement');
		const block = b.block(assignments);

		if (!is_standalone) {
			// this is part of an expression, we need the sequence to end with the value
			block.body.push(b.return(rhs));
		}

		if (is_standalone && !should_cache) {
			return block;
		}

		const iife = b.arrow(should_cache ? [rhs] : [], block);

		const iife_is_async =
			is_expression_async(value) ||
			assignments.some(
				(assignment) =>
					(assignment.type === 'ExpressionStatement' &&
						is_expression_async(assignment.expression)) ||
					(assignment.type === 'VariableDeclaration' &&
						assignment.declarations.some(
							(declaration) =>
								is_expression_async(declaration.id) ||
								(declaration.init && is_expression_async(declaration.init))
						))
			);

		return iife_is_async
			? b.await(b.call(b.async(iife), should_cache ? value : undefined))
			: b.call(iife, should_cache ? value : undefined);
	}

	if (node.left.type !== 'Identifier' && node.left.type !== 'MemberExpression') {
		throw new Error(`Unexpected assignment type ${node.left.type}`);
	}

	return build_assignment(node.operator, node.left, node.right, context);
}
