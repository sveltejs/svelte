/** @import { AssignmentExpression, BinaryOperator, Expression, Node, Pattern } from 'estree' */
/** @import { SvelteNode } from '#compiler' */
/** @import { Context, ServerTransformState } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { extract_paths } from '../../../../utils/ast.js';
import { serialize_get_binding } from './shared/utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	const parent = /** @type {Node} */ (context.path.at(-1));
	const is_standalone = parent.type.endsWith('Statement');

	if (
		node.left.type === 'ArrayPattern' ||
		node.left.type === 'ObjectPattern' ||
		node.left.type === 'RestElement'
	) {
		const value = /** @type {Expression} */ (context.visit(node.right));
		const should_cache = value.type !== 'Identifier';
		const rhs = should_cache ? b.id('$$value') : value;

		let unchanged = 0;

		const assignments = extract_paths(node.left).map((path) => {
			const assignment = b.assignment('=', path.node, path.expression?.(rhs));

			return serialize_assignment(assignment, context, () => {
				unchanged += 1;
				return assignment;
			});
		});

		if (unchanged === assignments.length) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return context.next();
		}

		const sequence = b.sequence(assignments);

		if (!is_standalone) {
			// this is part of an expression, we need the sequence to end with the value
			sequence.expressions.push(rhs);
		}

		if (should_cache) {
			// the right hand side is a complex expression, wrap in an IIFE to cache it
			return b.call(b.arrow([rhs], sequence), value);
		}

		return sequence;
	}

	return serialize_assignment(node, context, context.next);
}

/**
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, ServerTransformState>} context
 * @param {() => any} fallback
 * @returns {Expression}
 */
function serialize_assignment(node, context, fallback) {
	let left = node.left;

	while (left.type === 'MemberExpression') {
		// @ts-expect-error
		left = left.object;
	}

	if (left.type !== 'Identifier' || !is_store_name(left.name)) {
		return fallback();
	}

	const name = left.name.slice(1);

	if (!context.state.scope.get(name)) {
		return fallback();
	}

	if (left === node.left) {
		return b.call('$.store_set', b.id(name), /** @type {Expression} */ (context.visit(node.right)));
	}

	return b.call(
		'$.mutate_store',
		b.assignment('??=', b.id('$$store_subs'), b.object([])),
		b.literal(left.name),
		b.id(name),
		b.assignment(
			node.operator,
			/** @type {Pattern} */ (context.visit(node.left)),
			get_assignment_value(node, context)
		)
	);
}

/**
 * @param {AssignmentExpression} node
 * @param {Pick<import('zimmerframe').Context<SvelteNode, ServerTransformState>, 'visit' | 'state'>} context
 */
function get_assignment_value(node, { state, visit }) {
	if (node.left.type === 'Identifier') {
		const operator = node.operator;
		return operator === '='
			? /** @type {Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					serialize_get_binding(node.left, state),
					/** @type {Expression} */ (visit(node.right))
				);
	}

	return /** @type {Expression} */ (visit(node.right));
}

/**
 * @param {string} name
 */
function is_store_name(name) {
	return name[0] === '$' && /[A-Za-z_]/.test(name[1]);
}
