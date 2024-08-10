/** @import { AssignmentExpression, AssignmentOperator, BinaryOperator, Expression, Identifier, MemberExpression, Pattern } from 'estree' */
/** @import { SvelteNode } from '#compiler' */
/** @import { ClientTransformState, Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { extract_paths, is_expression_async, object } from '../../../../utils/ast.js';
import { is_ignored } from '../../../../state.js';
import { build_getter, build_proxy_reassignment, should_proxy_or_freeze } from '../utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	const assignee = node.left;
	if (
		assignee.type === 'ArrayPattern' ||
		assignee.type === 'ObjectPattern' ||
		assignee.type === 'RestElement'
	) {
		// Turn assignment into an IIFE, so that `$.set` calls etc don't produce invalid code
		const tmp_id = context.state.scope.generate('tmp');

		/** @type {AssignmentExpression[]} */
		const original_assignments = [];

		/** @type {Expression[]} */
		const assignments = [];

		const paths = extract_paths(assignee);

		for (const path of paths) {
			const value = path.expression?.(b.id(tmp_id));
			const assignment = b.assignment('=', path.node, value);
			original_assignments.push(assignment);
			assignments.push(build_assignment(assignment, context, () => assignment));
		}

		if (assignments.every((assignment, i) => assignment === original_assignments[i])) {
			// No change to output -> nothing to transform -> we can keep the original assignment
			return;
		}

		const rhs_expression = /** @type {Expression} */ (context.visit(node.right));

		const iife_is_async =
			is_expression_async(rhs_expression) ||
			assignments.some((assignment) => is_expression_async(assignment));

		const iife = b.arrow(
			[],
			b.block([
				b.const(tmp_id, rhs_expression),
				b.stmt(b.sequence(assignments)),
				// return because it could be used in a nested expression where the value is needed.
				// example: { foo: ({ bar } = { bar: 1 })}
				b.return(b.id(tmp_id))
			])
		);

		if (iife_is_async) {
			return b.await(b.call(b.async(iife)));
		} else {
			return b.call(iife);
		}
	}

	if (assignee.type !== 'Identifier' && assignee.type !== 'MemberExpression') {
		throw new Error(`Unexpected assignment type ${assignee.type}`);
	}

	return build_assignment(node, context, context.next);
}

/**
 * @template {ClientTransformState} State
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, State>} context
 * @param {() => any} fallback
 * @returns {Expression}
 */
export function build_assignment(node, context, fallback) {
	const { operator, left, right } = node;

	const assignee = /** @type {Identifier | MemberExpression} */ (left);

	// Handle class private/public state assignment cases
	if (
		context.state.analysis.runes &&
		assignee.type === 'MemberExpression' &&
		assignee.object.type === 'ThisExpression'
	) {
		if (assignee.property.type === 'PrivateIdentifier') {
			const private_state = context.state.private_state.get(assignee.property.name);

			if (private_state !== undefined) {
				let value = get_assignment_value(operator, left, right, context);
				let transformed = false;

				if (should_proxy_or_freeze(value, context.state.scope)) {
					transformed = true;
					value =
						private_state.kind === 'frozen_state'
							? b.call('$.freeze', value)
							: build_proxy_reassignment(value, private_state.id);
				}

				if (context.state.in_constructor) {
					if (transformed) {
						return b.assignment(operator, /** @type {Pattern} */ (context.visit(left)), value);
					}
				} else {
					return b.call('$.set', assignee, value);
				}
			}
		} else if (assignee.property.type === 'Identifier' && context.state.in_constructor) {
			const public_state = context.state.public_state.get(assignee.property.name);
			const value = get_assignment_value(operator, left, right, context);

			if (public_state !== undefined && should_proxy_or_freeze(value, context.state.scope)) {
				return b.assignment(
					operator,
					/** @type {Pattern} */ (context.visit(left)),
					public_state.kind === 'frozen_state'
						? b.call('$.freeze', value)
						: build_proxy_reassignment(value, public_state.id)
				);
			}
		}
	}

	let object = left;

	while (object.type === 'MemberExpression') {
		// @ts-expect-error
		object = object.object;
	}

	if (object.type !== 'Identifier') {
		return fallback();
	}

	const binding = context.state.scope.get(object.name);
	if (!binding) return fallback();

	const transform = Object.hasOwn(context.state.transform, object.name)
		? context.state.transform[object.name]
		: null;

	// reassignment
	if (object === left && transform?.assign) {
		let value = /** @type {Expression} */ (context.visit(right));

		if (operator !== '=') {
			value = b.binary(
				/** @type {BinaryOperator} */ (operator.slice(0, -1)),
				/** @type {Expression} */ (context.visit(object)),
				value
			);
		}

		// special case — if an element binding, we know it's a primitive
		const path = context.path.map((node) => node.type);
		const is_primitive = path.at(-1) === 'BindDirective' && path.at(-2) === 'RegularElement';

		if (
			!is_primitive &&
			binding.kind !== 'prop' &&
			context.state.analysis.runes &&
			should_proxy_or_freeze(value, context.state.scope)
		) {
			if (binding.kind === 'frozen_state') {
				value = b.call('$.freeze', value);
			} else {
				value = build_proxy_reassignment(value, object.name);
			}
		}

		return transform.assign(object, value);
	}

	/** @type {Expression} */
	let mutation = b.assignment(
		operator,
		/** @type {Pattern} */ (context.visit(left)),
		/** @type {Expression} */ (context.visit(right))
	);

	// mutation
	if (transform?.mutate) {
		mutation = transform.mutate(object, mutation);
	}

	return is_ignored(left, 'ownership_invalid_mutation')
		? b.call('$.skip_ownership_validation', b.thunk(mutation))
		: mutation;
}

/**
 * @template {ClientTransformState} State
 * @param {AssignmentOperator} operator
 * @param {Pattern} left
 * @param {Expression} right
 * @param {import('zimmerframe').Context<SvelteNode, State>} context
 * @returns
 */
function get_assignment_value(operator, left, right, { state, visit }) {
	if (left.type === 'Identifier') {
		return operator === '='
			? /** @type {Expression} */ (visit(right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					build_getter(left, state),
					/** @type {Expression} */ (visit(right))
				);
	}

	if (
		left.type === 'MemberExpression' &&
		left.object.type === 'ThisExpression' &&
		left.property.type === 'PrivateIdentifier' &&
		state.private_state.has(left.property.name)
	) {
		return operator === '='
			? /** @type {Expression} */ (visit(right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					/** @type {Expression} */ (visit(left)),
					/** @type {Expression} */ (visit(right))
				);
	}

	return /** @type {Expression} */ (visit(right));
}
