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
				if (delegated_event.type === 'hoistable') {
					delegated_event.function.metadata.hoistable = true;
				}

				node.metadata.delegated = delegated_event;
			}
		}
	}
}

/**
 * Checks if given event attribute can be delegated/hoisted and returns the corresponding info if so
 * @param {string} event_name
 * @param {Expression | null} handler
 * @param {Context} context
 * @returns {null | DelegatedEvent}
 */
function get_delegated_event(event_name, handler, context) {
	// Handle delegated event handlers. Bail-out if not a delegated event.
	if (!handler || !is_delegated(event_name)) {
		return null;
	}

	// If we are not working with a RegularElement, then bail-out.
	const element = context.path.at(-1);
	if (element?.type !== 'RegularElement') {
		return null;
	}

	/** @type {DelegatedEvent} */
	const non_hoistable = { type: 'non-hoistable' };
	/** @type {FunctionExpression | FunctionDeclaration | ArrowFunctionExpression | null} */
	let target_function = null;
	let binding = null;

	if (element.metadata.has_spread) {
		// event attribute becomes part of the dynamic spread array
		return non_hoistable;
	}

	if (handler.type === 'ArrowFunctionExpression' || handler.type === 'FunctionExpression') {
		target_function = handler;
	} else if (handler.type === 'Identifier') {
		binding = context.state.scope.get(handler.name);

		if (context.state.analysis.module.scope.references.has(handler.name)) {
			// If a binding with the same name is referenced in the module scope (even if not declared there), bail-out
			return non_hoistable;
		}

		if (binding != null) {
			for (const { path } of binding.references) {
				const parent = path.at(-1);
				if (parent == null) return non_hoistable;

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
						return non_hoistable;
					}
				} else if (parent.type !== 'FunctionDeclaration' && parent.type !== 'VariableDeclarator') {
					return non_hoistable;
				}
			}
		}

		// If the binding is exported, bail-out
		if (context.state.analysis.exports.find((node) => node.name === handler.name)) {
			return non_hoistable;
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

	// If we can't find a function, bail-out
	if (target_function == null) return non_hoistable;
	// If the function is marked as non-hoistable, bail-out
	if (target_function.metadata.hoistable === 'impossible') return non_hoistable;
	// If the function has more than one arg, then bail-out
	if (target_function.params.length > 1) return non_hoistable;

	const visited_references = new Set();
	const scope = target_function.metadata.scope;
	for (const [reference] of scope.references) {
		// Bail-out if the arguments keyword is used
		if (reference === 'arguments') return non_hoistable;
		// Bail-out if references a store subscription
		if (scope.get(`$${reference}`)?.kind === 'store_sub') return non_hoistable;

		const binding = scope.get(reference);
		const local_binding = context.state.scope.get(reference);

		// If we are referencing a binding that is shadowed in another scope then bail out.
		if (local_binding !== null && binding !== null && local_binding.node !== binding.node) {
			return non_hoistable;
		}

		// If we have multiple references to the same store using $ prefix, bail out.
		if (
			binding !== null &&
			binding.kind === 'store_sub' &&
			visited_references.has(reference.slice(1))
		) {
			return non_hoistable;
		}

		// If we reference the index within an each block, then bail-out.
		if (binding !== null && binding.initial?.type === 'EachBlock') return non_hoistable;

		if (
			binding !== null &&
			// Bail-out if the the binding is a rest param
			(binding.declaration_kind === 'rest_param' ||
				// Bail-out if we reference anything from the EachBlock (for now) that mutates in non-runes mode,
				(((!context.state.analysis.runes && binding.kind === 'each') ||
					// or any normal not reactive bindings that are mutated.
					binding.kind === 'normal' ||
					// or any reactive imports (those are rewritten) (can only happen in legacy mode)
					binding.kind === 'legacy_reactive_import') &&
					binding.mutated))
		) {
			return non_hoistable;
		}
		visited_references.add(reference);
	}

	return { type: 'hoistable', function: target_function };
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
