/** @import { AssignmentExpression, AssignmentOperator, Expression, Pattern } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { build_assignment_value } from '../../../../utils/ast.js';
import { is_ignored } from '../../../../state.js';
import { build_proxy_reassignment, should_proxy } from '../utils.js';
import { visit_assignment_expression } from '../../shared/assignments.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	return visit_assignment_expression(node, context, build_assignment);
}

/**
 * @param {AssignmentOperator} operator
 * @param {Pattern} left
 * @param {Expression} right
 * @param {Context} context
 * @returns {Expression | null}
 */
function build_assignment(operator, left, right, context) {
	// Handle class private/public state assignment cases
	if (
		context.state.analysis.runes &&
		left.type === 'MemberExpression' &&
		left.object.type === 'ThisExpression'
	) {
		if (left.property.type === 'PrivateIdentifier') {
			const private_state = context.state.private_state.get(left.property.name);

			if (private_state !== undefined) {
				let transformed = false;
				let value = /** @type {Expression} */ (
					context.visit(build_assignment_value(operator, left, right))
				);

				if (should_proxy(value, context.state.scope)) {
					transformed = true;
					value =
						private_state.kind === 'raw_state'
							? value
							: build_proxy_reassignment(value, private_state.id);
				}

				if (!context.state.in_constructor) {
					return b.call('$.set', left, value);
				} else if (transformed) {
					return b.assignment(operator, /** @type {Pattern} */ (context.visit(left)), value);
				}
			}
		} else if (left.property.type === 'Identifier' && context.state.in_constructor) {
			const public_state = context.state.public_state.get(left.property.name);

			if (public_state !== undefined && should_proxy(right, context.state.scope)) {
				const value = /** @type {Expression} */ (context.visit(right));

				return b.assignment(
					operator,
					/** @type {Pattern} */ (context.visit(left)),
					public_state.kind === 'raw_state'
						? value
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
		return null;
	}

	const binding = context.state.scope.get(object.name);
	if (!binding) return null;

	const transform = Object.hasOwn(context.state.transform, object.name)
		? context.state.transform[object.name]
		: null;

	// reassignment
	if (object === left && transform?.assign) {
		let value = /** @type {Expression} */ (
			context.visit(build_assignment_value(operator, left, right))
		);

		// special case — if an element binding, we know it's a primitive
		const path = context.path.map((node) => node.type);
		const is_primitive = path.at(-1) === 'BindDirective' && path.at(-2) === 'RegularElement';

		if (
			!is_primitive &&
			binding.kind !== 'prop' &&
			binding.kind !== 'bindable_prop' &&
			context.state.analysis.runes &&
			should_proxy(value, context.state.scope)
		) {
			value = binding.kind === 'raw_state' ? value : build_proxy_reassignment(value, object.name);
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
