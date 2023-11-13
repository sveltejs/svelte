import { error } from '../../errors.js';
import { get_rune } from '../scope';

/**
 * @param {import('estree').ArrowFunctionExpression | import('estree').FunctionExpression | import('estree').FunctionDeclaration} node
 * @param {import('./types').Context} context
 */
export const function_visitor = (node, context) => {
	// TODO retire this in favour of a more general solution based on bindings
	node.metadata = {
		// module context -> already hoisted
		hoistable: context.state.ast_type === 'module' ? 'impossible' : false,
		hoistable_params: [],
		scope: context.state.scope
	};

	context.next({
		...context.state,
		function_depth: context.state.function_depth + 1
	});
};

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

/**
 *
 * @param {import('estree').Node} node
 * @param {import('../scope.js').Scope} scope
 * @param {string} name
 */
export function validate_export(node, scope, name) {
	const binding = scope.get(name);
	if (binding && (binding.kind === 'derived' || binding.kind === 'state')) {
		error(node, 'invalid-rune-export', `$${binding.kind}`);
	}
}

/**
 * @param {import('estree').CallExpression} node
 * @param {import('../scope').Scope} scope
 * @param {import('#compiler').SvelteNode[]} path
 * @returns
 */
export function validate_call_expression(node, scope, path) {
	const rune = get_rune(node, scope);
	if (rune === null) return;

	if (rune === '$props' && path.at(-1)?.type !== 'VariableDeclarator') {
		error(node, 'invalid-props-location');
	} else if (
		(rune === '$state' || rune === '$derived') &&
		path.at(-1)?.type !== 'VariableDeclarator' &&
		path.at(-1)?.type !== 'PropertyDefinition'
	) {
		error(node, rune === '$derived' ? 'invalid-derived-location' : 'invalid-state-location');
	} else if (rune === '$effect') {
		if (path.at(-1)?.type !== 'ExpressionStatement') {
			error(node, 'invalid-effect-location');
		} else if (node.arguments.length !== 1) {
			error(node, 'invalid-rune-args-length', '$effect', [1]);
		}
	}
}
