/** @import { AssignmentExpression, AssignmentOperator, BinaryOperator, Expression, Node, Pattern } from 'estree' */
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
			const value = path.expression?.(rhs);
			const assignment = b.assignment('=', path.node, value);

			return serialize_assignment('=', path.node, value, context, () => {
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

	return serialize_assignment(node.operator, node.left, node.right, context, context.next);
}

/**
 * @param {AssignmentOperator} operator
 * @param {Pattern} left
 * @param {Expression} right
 * @param {import('zimmerframe').Context<SvelteNode, ServerTransformState>} context
 * @param {() => any} fallback
 * @returns {Expression}
 */
function serialize_assignment(operator, left, right, context, fallback) {
	let object = left;

	while (object.type === 'MemberExpression') {
		// @ts-expect-error
		object = object.object;
	}

	if (object.type !== 'Identifier' || !is_store_name(object.name)) {
		return fallback();
	}

	const name = object.name.slice(1);

	if (!context.state.scope.get(name)) {
		return fallback();
	}

	if (object === left) {
		const value =
			operator === '='
				? /** @type {Expression} */ (context.visit(right))
				: // turn something like x += 1 into x = x + 1
					b.binary(
						/** @type {BinaryOperator} */ (operator.slice(0, -1)),
						serialize_get_binding(left, context.state),
						/** @type {Expression} */ (context.visit(right))
					);

		return b.call('$.store_set', b.id(name), value);
	}

	return b.call(
		'$.mutate_store',
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
