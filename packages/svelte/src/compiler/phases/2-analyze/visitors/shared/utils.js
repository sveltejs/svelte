/** @import { AssignmentExpression, Expression, Pattern, PrivateIdentifier, Super, UpdateExpression } from 'estree' */
/** @import { AnalysisState } from '../../types' */
/** @import { Scope } from '../../../scope' */
/** @import { NodeLike } from '../../../../errors.js' */
import * as e from '../../../../errors.js';

/**
 * @param {AssignmentExpression | UpdateExpression} node
 * @param {Pattern | Expression} argument
 * @param {AnalysisState} state
 */
export function validate_assignment(node, argument, state) {
	validate_no_const_assignment(node, argument, state.scope, false);

	if (argument.type === 'Identifier') {
		const binding = state.scope.get(argument.name);

		if (state.analysis.runes) {
			if (binding?.kind === 'derived') {
				e.constant_assignment(node, 'derived state');
			}

			if (binding?.kind === 'each') {
				e.each_item_invalid_assignment(node);
			}
		}

		if (binding?.kind === 'snippet') {
			e.snippet_parameter_assignment(node);
		}
	}

	let object = /** @type {Expression | Super} */ (argument);

	/** @type {Expression | PrivateIdentifier | null} */
	let property = null;

	while (object.type === 'MemberExpression') {
		property = object.property;
		object = object.object;
	}

	if (object.type === 'ThisExpression' && property?.type === 'PrivateIdentifier') {
		if (state.private_derived_state.includes(property.name)) {
			e.constant_assignment(node, 'derived state');
		}
	}
}

/**
 * @param {NodeLike} node
 * @param {Pattern | Expression} argument
 * @param {Scope} scope
 * @param {boolean} is_binding
 */
export function validate_no_const_assignment(node, argument, scope, is_binding) {
	if (argument.type === 'ArrayPattern') {
		for (const element of argument.elements) {
			if (element) {
				validate_no_const_assignment(node, element, scope, is_binding);
			}
		}
	} else if (argument.type === 'ObjectPattern') {
		for (const element of argument.properties) {
			if (element.type === 'Property') {
				validate_no_const_assignment(node, element.value, scope, is_binding);
			}
		}
	} else if (argument.type === 'Identifier') {
		const binding = scope.get(argument.name);
		if (binding?.declaration_kind === 'const' && binding.kind !== 'each') {
			// e.invalid_const_assignment(
			// 	node,
			// 	is_binding,
			// 	// This takes advantage of the fact that we don't assign initial for let directives and then/catch variables.
			// 	// If we start doing that, we need another property on the binding to differentiate, or give up on the more precise error message.
			// 	binding.kind !== 'state' &&
			// 		binding.kind !== 'frozen_state' &&
			// 		(binding.kind !== 'normal' || !binding.initial)
			// );

			// TODO have a more specific error message for assignments to things like `{:then foo}`
			const thing = 'constant';

			if (is_binding) {
				e.constant_binding(node, thing);
			} else {
				e.constant_assignment(node, thing);
			}
		}
	}
}
