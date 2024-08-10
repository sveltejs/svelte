/** @import { AssignmentExpression, BinaryOperator, Expression, Identifier, MemberExpression, Pattern } from 'estree' */
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
			assignments.push(build_setter(assignment, context, () => assignment));
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

	return build_setter(node, context, context.next);
}

/**
 * @template {ClientTransformState} State
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, State>} context
 * @param {() => any} fallback
 * @returns {Expression}
 */
export function build_setter(node, context, fallback) {
	const { state, visit } = context;

	const assignee = /** @type {Identifier | MemberExpression} */ (node.left);

	// Handle class private/public state assignment cases
	if (
		context.state.analysis.runes &&
		assignee.type === 'MemberExpression' &&
		assignee.object.type === 'ThisExpression'
	) {
		if (assignee.property.type === 'PrivateIdentifier') {
			const private_state = context.state.private_state.get(assignee.property.name);

			if (private_state !== undefined) {
				let value = get_assignment_value(node, context);
				let transformed = false;

				if (should_proxy_or_freeze(value, context.state.scope)) {
					transformed = true;
					value =
						private_state.kind === 'frozen_state'
							? b.call('$.freeze', value)
							: build_proxy_reassignment(value, private_state.id);
				}

				if (state.in_constructor) {
					if (transformed) {
						return b.assignment(
							node.operator,
							/** @type {Pattern} */ (context.visit(node.left)),
							value
						);
					}
				} else {
					return b.call('$.set', assignee, value);
				}
			}
		} else if (assignee.property.type === 'Identifier' && state.in_constructor) {
			const public_state = context.state.public_state.get(assignee.property.name);
			const value = get_assignment_value(node, context);

			if (public_state !== undefined && should_proxy_or_freeze(value, context.state.scope)) {
				return b.assignment(
					node.operator,
					/** @type {Pattern} */ (context.visit(node.left)),
					public_state.kind === 'frozen_state'
						? b.call('$.freeze', value)
						: build_proxy_reassignment(value, public_state.id)
				);
			}
		}
	}

	const left = object(assignee);

	const binding = left && state.scope.get(left.name);
	if (!binding) return fallback();

	const transform = Object.hasOwn(context.state.transform, left.name)
		? context.state.transform[left.name]
		: null;

	// reassignment
	if (left === node.left && transform?.assign) {
		let value = /** @type {Expression} */ (visit(node.right));

		if (node.operator !== '=') {
			value = b.binary(
				/** @type {BinaryOperator} */ (node.operator.slice(0, -1)),
				/** @type {Expression} */ (visit(left)),
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
				value = build_proxy_reassignment(value, left.name);
			}
		}

		return transform.assign(left, value);
	}

	/**
	 * @param {any} serialized
	 * @returns
	 */
	const maybe_skip_ownership_validation = (serialized) => {
		if (is_ignored(node, 'ownership_invalid_mutation')) {
			return b.call('$.skip_ownership_validation', b.thunk(serialized));
		}

		return serialized;
	};

	// mutation
	if (transform?.mutate) {
		const mutation = b.assignment(
			node.operator,
			/** @type {Pattern} */ (context.visit(node.left)),
			/** @type {Expression} */ (context.visit(node.right))
		);

		return maybe_skip_ownership_validation(transform.mutate(left, mutation));
	}

	if (
		binding.kind !== 'state' &&
		binding.kind !== 'frozen_state' &&
		binding.kind !== 'prop' &&
		binding.kind !== 'bindable_prop' &&
		binding.kind !== 'each' &&
		binding.kind !== 'legacy_reactive' &&
		binding.kind !== 'store_sub' &&
		binding.kind !== 'derived'
	) {
		// TODO error if it's a computed (or rest prop)? or does that already happen elsewhere?
		return fallback();
	}

	return maybe_skip_ownership_validation(
		b.assignment(
			node.operator,
			/** @type {Pattern} */ (visit(node.left)),
			/** @type {Expression} */ (visit(node.right))
		)
	);
}

/**
 * @template {ClientTransformState} State
 * @param {AssignmentExpression} node
 * @param {import('zimmerframe').Context<SvelteNode, State>} context
 * @returns
 */
function get_assignment_value(node, { state, visit }) {
	if (node.left.type === 'Identifier') {
		const operator = node.operator;
		return operator === '='
			? /** @type {Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					build_getter(node.left, state),
					/** @type {Expression} */ (visit(node.right))
				);
	}

	if (
		node.left.type === 'MemberExpression' &&
		node.left.object.type === 'ThisExpression' &&
		node.left.property.type === 'PrivateIdentifier' &&
		state.private_state.has(node.left.property.name)
	) {
		const operator = node.operator;
		return operator === '='
			? /** @type {Expression} */ (visit(node.right))
			: // turn something like x += 1 into x = x + 1
				b.binary(
					/** @type {BinaryOperator} */ (operator.slice(0, -1)),
					/** @type {Expression} */ (visit(node.left)),
					/** @type {Expression} */ (visit(node.right))
				);
	}

	return /** @type {Expression} */ (visit(node.right));
}
