import { error } from '../../errors.js';

/**
 * @param {import('../../errors.js').NodeLike} node
 * @param {import('estree').Pattern | import('estree').Expression} argument
 * @param {import('../scope').Scope} scope
 * @param {boolean} is_binding
 */
export function validate_no_const_assignment(node, argument, scope, is_binding) {
	if (argument.type === 'Identifier') {
		const binding = scope.get(argument.name);
		if (binding?.declaration_kind === 'const' && binding.kind !== 'each') {
			error(
				node,
				'invalid-const-assignment',
				is_binding,
				// This takes advantage of the fact that we don't assign initial for let directives and then/catch variables.
				// If we start doing that, we need another property on the binding to differentiate, or give up on the more precise error message.
				binding.kind !== 'state' && (binding.kind !== 'normal' || !binding.initial)
			);
		}
	}
}

/**
 * @param {import('estree').AssignmentExpression | import('estree').UpdateExpression} node
 * @param {import('estree').Pattern | import('estree').Expression} argument
 * @param {import('./types.js').AnalysisState} state
 */
export function validate_assignment(node, argument, state) {
	validate_no_const_assignment(node, argument, state.scope, false);

	let left = /** @type {import('estree').Expression | import('estree').Super} */ (argument);

	/** @type {import('estree').Expression | import('estree').PrivateIdentifier | null} */
	let property = null;

	while (left.type === 'MemberExpression') {
		property = left.property;
		left = left.object;
	}

	if (left.type === 'Identifier') {
		const binding = state.scope.get(left.name);
		if (binding?.kind === 'derived') {
			error(node, 'invalid-derived-assignment');
		}
	}

	if (left.type === 'ThisExpression' && property?.type === 'PrivateIdentifier') {
		if (state.private_derived_state.includes(property.name)) {
			error(node, 'invalid-derived-assignment');
		}
	}
}
