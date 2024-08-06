/** @import { Expression, Identifier } from 'estree' */
/** @import { Context } from '../types' */
import is_reference from 'is-reference';
import { should_proxy_or_freeze } from '../../3-transform/client/utils.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { is_rune } from '../../../../utils.js';

/**
 * @param {Identifier} node
 * @param {Context} context
 */
export function Identifier(node, context) {
	let i = context.path.length;
	let parent = /** @type {Expression} */ (context.path[--i]);

	if (!is_reference(node, parent)) {
		return;
	}

	// If we are using arguments outside of a function, then throw an error
	if (
		node.name === 'arguments' &&
		!context.path.some((n) => n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression')
	) {
		e.invalid_arguments_usage(node);
	}

	// `$$slots` exists even in runes mode
	if (node.name === '$$slots') {
		context.state.analysis.uses_slots = true;
	}

	if (context.state.analysis.runes) {
		if (
			is_rune(node.name) &&
			context.state.scope.get(node.name) === null &&
			context.state.scope.get(node.name.slice(1)) === null
		) {
			/** @type {Expression} */
			let current = node;
			let name = node.name;

			while (parent.type === 'MemberExpression') {
				if (parent.computed) e.rune_invalid_computed_property(parent);
				name += `.${/** @type {Identifier} */ (parent.property).name}`;

				current = parent;
				parent = /** @type {Expression} */ (context.path[--i]);

				if (!is_rune(name)) {
					if (name === '$effect.active') {
						e.rune_renamed(parent, '$effect.active', '$effect.tracking');
					}

					e.rune_invalid_name(parent, name);
				}
			}

			if (parent.type !== 'CallExpression') {
				e.rune_missing_parentheses(current);
			}
		}
	}

	let binding = context.state.scope.get(node.name);

	if (!context.state.analysis.runes) {
		if (node.name === '$$props') {
			context.state.analysis.uses_props = true;
		}

		if (node.name === '$$restProps') {
			context.state.analysis.uses_rest_props = true;
		}

		if (
			binding?.kind === 'normal' &&
			((binding.scope === context.state.instance_scope &&
				binding.declaration_kind !== 'function') ||
				binding.declaration_kind === 'import')
		) {
			if (
				binding.declaration_kind !== 'import' &&
				binding.mutated &&
				// TODO could be more fine-grained - not every mention in the template implies a state binding
				(context.state.reactive_statement || context.state.ast_type === 'template')
			) {
				binding.kind = 'state';
			} else if (
				context.state.reactive_statement &&
				parent.type === 'AssignmentExpression' &&
				parent.left === binding.node
			) {
				binding.kind = 'derived';
			}
		} else if (binding?.kind === 'each' && binding.mutated) {
			// Ensure that the array is marked as reactive even when only its entries are mutated
			let i = context.path.length;
			while (i--) {
				const ancestor = context.path[i];
				if (
					ancestor.type === 'EachBlock' &&
					context.state.analysis.template.scopes.get(ancestor)?.declarations.get(node.name) ===
						binding
				) {
					for (const binding of ancestor.metadata.references) {
						if (binding.kind === 'normal') {
							binding.kind = 'state';
						}
					}
					break;
				}
			}
		}
	}

	if (binding && binding.kind !== 'normal') {
		if (context.state.expression) {
			context.state.expression.dependencies.add(binding);
			context.state.expression.has_state = true;
		}

		if (
			context.state.analysis.runes &&
			node !== binding.node &&
			context.state.function_depth === binding.scope.function_depth &&
			// If we have $state that can be proxied or frozen and isn't re-assigned, then that means
			// it's likely not using a primitive value and thus this warning isn't that helpful.
			((binding.kind === 'state' &&
				(binding.reassigned ||
					(binding.initial?.type === 'CallExpression' &&
						binding.initial.arguments.length === 1 &&
						binding.initial.arguments[0].type !== 'SpreadElement' &&
						!should_proxy_or_freeze(binding.initial.arguments[0], context.state.scope)))) ||
				binding.kind === 'frozen_state' ||
				binding.kind === 'derived') &&
			// We're only concerned with reads here
			(parent.type !== 'AssignmentExpression' || parent.left !== node) &&
			parent.type !== 'UpdateExpression'
		) {
			w.state_referenced_locally(node);
		}
	}
}
