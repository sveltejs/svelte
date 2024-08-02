/** @import { AssignmentExpression, CallExpression, Expression, Pattern, PrivateIdentifier, Super, TaggedTemplateExpression, UpdateExpression, VariableDeclarator } from 'estree' */
/** @import { Fragment } from '#compiler' */
/** @import { AnalysisState, Context } from '../../types' */
/** @import { Scope } from '../../../scope' */
/** @import { NodeLike } from '../../../../errors.js' */
import * as e from '../../../../errors.js';
import { extract_identifiers } from '../../../../utils/ast.js';
import * as w from '../../../../warnings.js';

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

/**
 * Validates that the opening of a control flow block is `{` immediately followed by the expected character.
 * In legacy mode whitespace is allowed inbetween. TODO remove once legacy mode is gone and move this into parser instead.
 * @param {{start: number; end: number}} node
 * @param {AnalysisState} state
 * @param {string} expected
 */
export function validate_opening_tag(node, state, expected) {
	if (state.analysis.source[node.start + 1] !== expected) {
		// avoid a sea of red and only mark the first few characters
		e.block_unexpected_character({ start: node.start, end: node.start + 5 }, expected);
	}
}

/**
 * @param {Fragment | null | undefined} node
 * @param {Context} context
 */
export function validate_block_not_empty(node, context) {
	if (!node) return;
	// Assumption: If the block has zero elements, someone's in the middle of typing it out,
	// so don't warn in that case because it would be distracting.
	if (node.nodes.length === 1 && node.nodes[0].type === 'Text' && !node.nodes[0].raw.trim()) {
		w.block_empty(node.nodes[0]);
	}
}

/**
 * @param {VariableDeclarator} node
 * @param {AnalysisState} state
 */
export function ensure_no_module_import_conflict(node, state) {
	const ids = extract_identifiers(node.id);
	for (const id of ids) {
		if (
			state.ast_type === 'instance' &&
			state.scope === state.analysis.instance.scope &&
			state.analysis.module.scope.get(id.name)?.declaration_kind === 'import'
		) {
			// TODO fix the message here
			e.declaration_duplicate_module_import(node.id);
		}
	}
}

/**
 * A 'safe' identifier means that the `foo` in `foo.bar` or `foo()` will not
 * call functions that require component context to exist
 * @param {Expression | Super} expression
 * @param {Scope} scope
 */
export function is_safe_identifier(expression, scope) {
	let node = expression;
	while (node.type === 'MemberExpression') node = node.object;

	if (node.type !== 'Identifier') return false;

	const binding = scope.get(node.name);
	if (!binding) return true;

	if (binding.kind === 'store_sub') {
		return is_safe_identifier({ name: node.name.slice(1), type: 'Identifier' }, scope);
	}

	return (
		binding.declaration_kind !== 'import' &&
		binding.kind !== 'prop' &&
		binding.kind !== 'bindable_prop' &&
		binding.kind !== 'rest_prop'
	);
}

/**
 * @param {Expression | Super} callee
 * @param {Context} context
 * @returns {boolean}
 */
export function is_known_safe_call(callee, context) {
	// String / Number / BigInt / Boolean casting calls
	if (callee.type === 'Identifier') {
		const name = callee.name;
		const binding = context.state.scope.get(name);
		if (
			binding === null &&
			(name === 'BigInt' || name === 'String' || name === 'Number' || name === 'Boolean')
		) {
			return true;
		}
	}

	// TODO add more cases

	return false;
}
