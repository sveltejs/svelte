/** @import { AssignmentExpression, BinaryOperator, Expression, Identifier, Pattern } from 'estree' */
/** @import { SvelteNode } from '#compiler' */
/** @import { ServerTransformState } from '../../../types' */
import { extract_paths } from '../../../../../../utils/ast.js';
import * as b from '../../../../../../utils/builders.js';

/**
 * @param {Identifier} node
 * @param {ServerTransformState} state
 * @returns {Expression}
 */
export function serialize_get_binding(node, state) {
	const binding = state.scope.get(node.name);

	if (binding === null || node === binding.node) {
		// No associated binding or the declaration itself which shouldn't be transformed
		return node;
	}

	if (binding.kind === 'store_sub') {
		const store_id = b.id(node.name.slice(1));
		return b.call(
			'$.store_get',
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
			b.literal(node.name),
			serialize_get_binding(store_id, state)
		);
	}

	if (Object.hasOwn(state.getters, node.name)) {
		const getter = state.getters[node.name];
		return typeof getter === 'function' ? getter(node) : getter;
	}

	return node;
}

/**
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, ServerTransformState>} context
 * @param {() => any} fallback
 * @returns {Expression}
 */
export function serialize_set_binding(node, context, fallback) {
	const { state, visit } = context;

	if (
		node.left.type === 'ArrayPattern' ||
		node.left.type === 'ObjectPattern' ||
		node.left.type === 'RestElement'
	) {
		// Turn assignment into an IIFE, so that `$.set` calls etc don't produce invalid code
		const tmp_id = context.state.scope.generate('tmp');

		/** @type {AssignmentExpression[]} */
		const original_assignments = [];

		/** @type {Expression[]} */
		const assignments = [];

		const paths = extract_paths(node.left);

		for (const path of paths) {
			const value = path.expression?.(b.id(tmp_id));
			const assignment = b.assignment('=', path.node, value);
			original_assignments.push(assignment);
			assignments.push(serialize_set_binding(assignment, context, () => assignment));
		}

		if (assignments.every((assignment, i) => assignment === original_assignments[i])) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return fallback();
		}

		return b.call(
			b.thunk(
				b.block([
					b.const(tmp_id, /** @type {Expression} */ (visit(node.right))),
					b.stmt(b.sequence(assignments)),
					b.return(b.id(tmp_id))
				])
			)
		);
	}

	if (node.left.type !== 'Identifier' && node.left.type !== 'MemberExpression') {
		throw new Error(`Unexpected assignment type ${node.left.type}`);
	}

	let left = node.left;

	while (left.type === 'MemberExpression') {
		// @ts-expect-error
		left = left.object;
	}

	if (left.type !== 'Identifier') {
		return fallback();
	}

	const is_store = is_store_name(left.name);
	const left_name = is_store ? left.name.slice(1) : left.name;
	const binding = state.scope.get(left_name);

	if (!binding) return fallback();

	if (binding.mutation !== null) {
		return binding.mutation(node, context);
	}

	if (
		binding.kind !== 'state' &&
		binding.kind !== 'frozen_state' &&
		binding.kind !== 'prop' &&
		binding.kind !== 'bindable_prop' &&
		binding.kind !== 'each' &&
		binding.kind !== 'legacy_reactive' &&
		!is_store
	) {
		// TODO error if it's a computed (or rest prop)? or does that already happen elsewhere?
		return fallback();
	}

	const value = get_assignment_value(node, context);
	if (left === node.left) {
		if (is_store) {
			return b.call('$.store_set', b.id(left_name), /** @type {Expression} */ (visit(node.right)));
		}
		return fallback();
	} else if (is_store) {
		return b.call(
			'$.mutate_store',
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
			b.literal(left.name),
			b.id(left_name),
			b.assignment(node.operator, /** @type {Pattern} */ (visit(node.left)), value)
		);
	}
	return fallback();
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
