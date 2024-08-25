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
	const expression = /** @type {Expression} */ (
		visit_assignment_expression(node, context, build_assignment) ?? context.next()
	);

	return is_ignored(node, 'ownership_invalid_mutation')
		? b.call('$.skip_ownership_validation', b.thunk(expression))
		: expression;
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
							: build_proxy_reassignment(value, b.member(b.this, private_state.id));
				}

				if (!context.state.in_constructor) {
					return b.call('$.set', left, value);
				} else if (transformed) {
					return b.assignment(operator, /** @type {Pattern} */ (context.visit(left)), value);
				}
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
			value = binding.kind === 'raw_state' ? value : build_proxy_reassignment(value, object);
		}

		return transform.assign(object, value);
	}

	// mutation
	if (transform?.mutate) {
		return transform.mutate(
			object,
			b.assignment(
				operator,
				/** @type {Pattern} */ (context.visit(left)),
				/** @type {Expression} */ (context.visit(right))
			)
		);
	}

	return null;
}
