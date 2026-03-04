/** @import { AssignmentExpression, Expression, Literal, Node, Pattern, Super, UpdateExpression, VariableDeclarator } from 'estree' */
/** @import { AST, Binding } from '#compiler' */
/** @import { AnalysisState, Context } from '../../types' */
/** @import { Scope } from '../../../scope' */
/** @import { NodeLike } from '../../../../errors.js' */
import * as e from '../../../../errors.js';
import { extract_identifiers, get_parent } from '../../../../utils/ast.js';
import * as w from '../../../../warnings.js';
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { get_name } from '../../../nodes.js';

/**
 * @param {AssignmentExpression | UpdateExpression | AST.BindDirective} node
 * @param {Pattern | Expression} argument
 * @param {Context} context
 */
export function validate_assignment(node, argument, context) {
	validate_no_const_assignment(node, argument, context.state.scope, node.type === 'BindDirective');

	if (argument.type === 'Identifier') {
		const binding = context.state.scope.get(argument.name);

		if (context.state.analysis.runes) {
			if (
				context.state.analysis.props_id != null &&
				binding?.node === context.state.analysis.props_id
			) {
				e.constant_assignment(node, '$props.id()');
			}

			if (binding?.kind === 'each') {
				e.each_item_invalid_assignment(node);
			}
		}

		if (binding?.kind === 'snippet') {
			e.snippet_parameter_assignment(node);
		}
	}

	if (argument.type === 'MemberExpression' && argument.object.type === 'ThisExpression') {
		const name =
			argument.computed && argument.property.type !== 'Literal'
				? null
				: get_name(argument.property);

		const field = name !== null && context.state.state_fields?.get(name);

		// check we're not assigning to a state field before its declaration in the constructor
		if (field && field.node.type === 'AssignmentExpression' && node !== field.node) {
			let i = context.path.length;
			while (i--) {
				const parent = context.path[i];

				if (
					parent.type === 'FunctionDeclaration' ||
					parent.type === 'FunctionExpression' ||
					parent.type === 'ArrowFunctionExpression'
				) {
					const grandparent = get_parent(context.path, i - 1);

					if (
						grandparent.type === 'MethodDefinition' &&
						grandparent.kind === 'constructor' &&
						/** @type {number} */ (node.start) < /** @type {number} */ (field.node.start)
					) {
						e.state_field_invalid_assignment(node);
					}

					break;
				}
			}
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
		if (
			binding?.declaration_kind === 'import' ||
			(binding?.declaration_kind === 'const' && binding.kind !== 'each')
		) {
			// e.invalid_const_assignment(
			// 	node,
			// 	is_binding,
			// 	// This takes advantage of the fact that we don't assign initial for let directives and then/catch variables.
			// 	// If we start doing that, we need another property on the binding to differentiate, or give up on the more precise error message.
			// 	binding.kind !== 'state' &&
			// 		binding.kind !== 'raw_state' &&
			// 		(binding.kind !== 'normal' || !binding.initial)
			// );

			// TODO have a more specific error message for assignments to things like `{:then foo}`
			const thing = binding.declaration_kind === 'import' ? 'import' : 'constant';

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
 * @param {AST.Fragment | null | undefined} node
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
 * @param {Expression | Literal | Super} node
 * @param {Context} context
 * @returns {boolean}
 */
export function is_pure(node, context) {
	if (node.type === 'Literal') {
		return true;
	}

	if (node.type === 'CallExpression') {
		if (!is_pure(node.callee, context)) {
			return false;
		}
		for (let arg of node.arguments) {
			if (!is_pure(arg.type === 'SpreadElement' ? arg.argument : arg, context)) {
				return false;
			}
		}
		return true;
	}

	if (node.type !== 'Identifier' && node.type !== 'MemberExpression') {
		return false;
	}

	if (get_rune(b.call(node), context.state.scope) === '$effect.tracking') {
		return false;
	}

	/** @type {Expression | Super | null} */
	let left = node;
	while (left.type === 'MemberExpression') {
		left = left.object;
	}

	if (!left) return false;

	if (left.type === 'Identifier') {
		const binding = context.state.scope.get(left.name);
		if (binding === null) return true; // globals are assumed to be safe
	} else if (is_pure(left, context)) {
		return true;
	}

	// TODO add more cases (safe Svelte imports, etc)
	return false;
}

/**
 * Checks if the name is valid, which it is when it's not starting with (or is) a dollar sign or if it's a function parameter.
 * The second argument is the depth of the scope, which is there for backwards compatibility reasons: In Svelte 4, you
 * were allowed to define `$`-prefixed variables anywhere below the top level of components. Once legacy mode is gone, this
 * argument can be removed / the call sites adjusted accordingly.
 * @param {Binding | null} binding
 * @param {number | undefined} [function_depth]
 */
export function validate_identifier_name(binding, function_depth) {
	if (!binding) return;

	const declaration_kind = binding.declaration_kind;

	if (
		declaration_kind !== 'synthetic' &&
		declaration_kind !== 'param' &&
		declaration_kind !== 'rest_param' &&
		(!function_depth || function_depth <= 1)
	) {
		const node = binding.node;

		if (node.name === '$') {
			e.dollar_binding_invalid(node);
		} else if (
			node.name.startsWith('$') &&
			// import type { $Type } from "" - these are normally already filtered out,
			// but for the migration they aren't, and throwing here is preventing the migration to complete
			// TODO -> once migration script is gone we can remove this check
			!(
				binding.initial?.type === 'ImportDeclaration' &&
				/** @type {any} */ (binding.initial).importKind === 'type'
			)
		) {
			e.dollar_prefix_invalid(node);
		}
	}
}

/**
 * Checks that the exported name is not a derived or reassigned state variable.
 * @param {Node} node
 * @param {Scope} scope
 * @param {string} name
 */
export function validate_export(node, scope, name) {
	const binding = scope.get(name);
	if (!binding) return;

	if (binding.kind === 'derived') {
		e.derived_invalid_export(node);
	}

	if ((binding.kind === 'state' || binding.kind === 'raw_state') && binding.reassigned) {
		e.state_invalid_export(node);
	}
}
