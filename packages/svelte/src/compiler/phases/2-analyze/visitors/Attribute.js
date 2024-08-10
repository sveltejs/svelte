/** @import { ArrowFunctionExpression, Expression, FunctionDeclaration, FunctionExpression } from 'estree' */
/** @import { Attribute, DelegatedEvent, RegularElement } from '#compiler' */
/** @import { Context } from '../types' */
import { is_capture_event, is_delegated } from '../../../../utils.js';
import {
	get_attribute_chunks,
	get_attribute_expression,
	is_event_attribute
} from '../../../utils/ast.js';

/**
 * @param {Attribute} node
 * @param {Context} context
 */
export function Attribute(node, context) {
	context.next();

	if (node.value !== true) {
		for (const chunk of get_attribute_chunks(node.value)) {
			if (chunk.type !== 'ExpressionTag') continue;

			if (
				chunk.expression.type === 'FunctionExpression' ||
				chunk.expression.type === 'ArrowFunctionExpression'
			) {
				continue;
			}

			node.metadata.expression.has_state ||= chunk.metadata.expression.has_state;
			node.metadata.expression.has_call ||= chunk.metadata.expression.has_call;
		}

		if (is_event_attribute(node)) {
			const parent = context.path.at(-1);
			if (parent?.type === 'RegularElement' || parent?.type === 'SvelteElement') {
				context.state.analysis.uses_event_attributes = true;
			}

			const expression = get_attribute_expression(node);
			const delegated_event = get_delegated_event(node.name.slice(2), expression, context);

			if (delegated_event !== null) {
				if (delegated_event.hoisted) {
					delegated_event.function.metadata.hoisted = true;
				}

				node.metadata.delegated = delegated_event;
			}
		}
	}
}

/** @type {DelegatedEvent} */
const unhoisted = { hoisted: false };

/**
 * Checks if given event attribute can be delegated/hoisted and returns the corresponding info if so
 * @param {string} event_name
 * @param {Expression | null} handler
 * @param {Context} context
 * @returns {null | DelegatedEvent}
 */
function get_delegated_event(event_name, handler, context) {
	// Handle delegated event handlers. Bail out if not a delegated event.
	if (!handler || !is_delegated(event_name)) {
		return null;
	}

	// If we are not working with a RegularElement, then bail out.
	const element = context.path.at(-1);
	if (element?.type !== 'RegularElement') {
		return null;
	}

	/** @type {FunctionExpression | FunctionDeclaration | ArrowFunctionExpression | null} */
	let target_function = null;
	let binding = null;

	if (element.metadata.has_spread) {
		// event attribute becomes part of the dynamic spread array
		return unhoisted;
	}

	if (handler.type === 'ArrowFunctionExpression' || handler.type === 'FunctionExpression') {
		target_function = handler;
	} else if (handler.type === 'Identifier') {
		binding = context.state.scope.get(handler.name);

		if (context.state.analysis.module.scope.references.has(handler.name)) {
			// If a binding with the same name is referenced in the module scope (even if not declared there), bail out
			return unhoisted;
		}

		if (binding != null) {
			for (const { path } of binding.references) {
				const parent = path.at(-1);
				if (parent === undefined) return unhoisted;

				const grandparent = path.at(-2);

				/** @type {RegularElement | null} */
				let element = null;
				/** @type {string | null} */
				let event_name = null;
				if (parent.type === 'OnDirective') {
					element = /** @type {RegularElement} */ (grandparent);
					event_name = parent.name;
				} else if (
					parent.type === 'ExpressionTag' &&
					grandparent?.type === 'Attribute' &&
					is_event_attribute(grandparent)
				) {
					element = /** @type {RegularElement} */ (path.at(-3));
					const attribute = /** @type {Attribute} */ (grandparent);
					event_name = get_attribute_event_name(attribute.name);
				}

				if (element && event_name) {
					if (
						element.type !== 'RegularElement' ||
						element.metadata.has_spread ||
						!is_delegated(event_name)
					) {
						return unhoisted;
					}
				} else if (parent.type !== 'FunctionDeclaration' && parent.type !== 'VariableDeclarator') {
					return unhoisted;
				}
			}
		}

		// If the binding is exported, bail out
		if (context.state.analysis.exports.find((node) => node.name === handler.name)) {
			return unhoisted;
		}

		if (binding !== null && binding.initial !== null && !binding.mutated && !binding.is_called) {
			const binding_type = binding.initial.type;

			if (
				binding_type === 'ArrowFunctionExpression' ||
				binding_type === 'FunctionDeclaration' ||
				binding_type === 'FunctionExpression'
			) {
				target_function = binding.initial;
			}
		}
	}

	// If we can't find a function, or the function has multiple parameters, bail out
	if (target_function == null || target_function.params.length > 1) {
		return unhoisted;
	}

	const visited_references = new Set();
	const scope = target_function.metadata.scope;
	for (const [reference] of scope.references) {
		// Bail out if the arguments keyword is used or $host is referenced
		if (reference === 'arguments' || reference === '$host') return unhoisted;
		// Bail out if references a store subscription
		if (scope.get(`$${reference}`)?.kind === 'store_sub') return unhoisted;

		const binding = scope.get(reference);
		const local_binding = context.state.scope.get(reference);

		// If we are referencing a binding that is shadowed in another scope then bail out.
		if (local_binding !== null && binding !== null && local_binding.node !== binding.node) {
			return unhoisted;
		}

		// If we have multiple references to the same store using $ prefix, bail out.
		if (
			binding !== null &&
			binding.kind === 'store_sub' &&
			visited_references.has(reference.slice(1))
		) {
			return unhoisted;
		}

		// If we reference the index within an each block, then bail out.
		if (binding !== null && binding.initial?.type === 'EachBlock') return unhoisted;

		if (
			binding !== null &&
			// Bail out if the the binding is a rest param
			(binding.declaration_kind === 'rest_param' ||
				// Bail out if we reference anything from the EachBlock (for now) that mutates in non-runes mode,
				(((!context.state.analysis.runes && binding.kind === 'each') ||
					// or any normal not reactive bindings that are mutated.
					binding.kind === 'normal') &&
					binding.mutated))
		) {
			return unhoisted;
		}
		visited_references.add(reference);
	}

	return { hoisted: true, function: target_function };
}

/**
 * @param {string} event_name
 */
function get_attribute_event_name(event_name) {
	event_name = event_name.slice(2);
	if (is_capture_event(event_name)) {
		event_name = event_name.slice(0, -7);
	}
	return event_name;
}
