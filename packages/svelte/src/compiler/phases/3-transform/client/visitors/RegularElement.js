/** @import { Expression, ExpressionStatement, Identifier, MemberExpression, ObjectExpression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { SourceLocation } from '#shared' */
/** @import { ComponentClientTransformState, ComponentContext } from '../types' */
/** @import { Scope } from '../../../scope' */
import {
	is_boolean_attribute,
	is_dom_property,
	is_load_error_element,
	is_void
} from '../../../../../utils.js';
import { escape_html } from '../../../../../escaping.js';
import { dev, is_ignored, locator } from '../../../../state.js';
import {
	get_attribute_expression,
	is_event_attribute,
	is_text_attribute
} from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { is_custom_element_node } from '../../../nodes.js';
import { clean_nodes, determine_namespace_for_children } from '../../utils.js';
import { build_getter } from '../utils.js';
import {
	get_attribute_name,
	build_attribute_value,
	build_class_directives,
	build_style_directives
} from './shared/element.js';
import { process_children } from './shared/fragment.js';
import {
	build_render_statement,
	build_template_literal,
	build_update,
	build_update_assignment
} from './shared/utils.js';
import { visit_event_attribute } from './shared/events.js';

/**
 * @param {AST.RegularElement} node
 * @param {ComponentContext} context
 */
export function RegularElement(node, context) {
	/** @type {SourceLocation} */
	let location = [-1, -1];

	if (dev) {
		const loc = locator(node.start);
		if (loc) {
			location[0] = loc.line;
			location[1] = loc.column;
			context.state.locations.push(location);
		}
	}

	if (node.name === 'noscript') {
		context.state.template.push('<noscript></noscript>');
		return;
	}

	if (node.name === 'script') {
		context.state.metadata.context.template_contains_script_tag = true;
	}

	const metadata = context.state.metadata;
	const child_metadata = {
		...context.state.metadata,
		namespace: determine_namespace_for_children(node, context.state.metadata.namespace)
	};

	context.state.template.push(`<${node.name}`);

	/** @type {Array<AST.Attribute | AST.SpreadAttribute>} */
	const attributes = [];

	/** @type {AST.ClassDirective[]} */
	const class_directives = [];

	/** @type {AST.StyleDirective[]} */
	const style_directives = [];

	/** @type {ExpressionStatement[]} */
	const lets = [];

	const is_custom_element = is_custom_element_node(node);
	let needs_input_reset = false;
	let needs_content_reset = false;

	/** @type {AST.BindDirective | null} */
	let value_binding = null;

	/** If true, needs `__value` for inputs */
	let needs_special_value_handling = node.name === 'option' || node.name === 'select';
	let is_content_editable = false;
	let has_content_editable_binding = false;
	let img_might_be_lazy = false;
	let might_need_event_replaying = false;
	let has_direction_attribute = false;
	let has_style_attribute = false;

	if (is_custom_element) {
		// cloneNode is faster, but it does not instantiate the underlying class of the
		// custom element until the template is connected to the dom, which would
		// cause problems when setting properties on the custom element.
		// Therefore we need to use importNode instead, which doesn't have this caveat.
		metadata.context.template_needs_import_node = true;
	}

	// visit let directives first, to set state
	for (const attribute of node.attributes) {
		if (attribute.type === 'LetDirective') {
			lets.push(/** @type {ExpressionStatement} */ (context.visit(attribute)));
		}
	}

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			attributes.push(attribute);
			if (node.name === 'img' && attribute.name === 'loading') {
				img_might_be_lazy = true;
			}
			if (attribute.name === 'dir') {
				has_direction_attribute = true;
			}
			if (attribute.name === 'style') {
				has_style_attribute = true;
			}
			if (
				(attribute.name === 'value' || attribute.name === 'checked') &&
				!is_text_attribute(attribute)
			) {
				needs_input_reset = true;
				needs_content_reset = true;
			} else if (
				attribute.name === 'contenteditable' &&
				(attribute.value === true ||
					(is_text_attribute(attribute) && attribute.value[0].data === 'true'))
			) {
				is_content_editable = true;
			}
		} else if (attribute.type === 'SpreadAttribute') {
			attributes.push(attribute);
			needs_input_reset = true;
			needs_content_reset = true;
			if (is_load_error_element(node.name)) {
				might_need_event_replaying = true;
			}
		} else if (attribute.type === 'ClassDirective') {
			class_directives.push(attribute);
		} else if (attribute.type === 'StyleDirective') {
			style_directives.push(attribute);
		} else if (attribute.type === 'OnDirective') {
			const handler = /** @type {Expression} */ (context.visit(attribute));
			const has_action_directive = node.attributes.find((a) => a.type === 'UseDirective');

			context.state.after_update.push(
				b.stmt(has_action_directive ? b.call('$.effect', b.thunk(handler)) : handler)
			);
		} else if (attribute.type !== 'LetDirective') {
			if (attribute.type === 'BindDirective') {
				if (attribute.name === 'group' || attribute.name === 'checked') {
					needs_special_value_handling = true;
					needs_input_reset = true;
				} else if (attribute.name === 'value') {
					value_binding = attribute;
					needs_content_reset = true;
					needs_input_reset = true;
				} else if (
					attribute.name === 'innerHTML' ||
					attribute.name === 'innerText' ||
					attribute.name === 'textContent'
				) {
					has_content_editable_binding = true;
				}
			} else if (attribute.type === 'UseDirective' && is_load_error_element(node.name)) {
				might_need_event_replaying = true;
			}
			context.visit(attribute);
		}
	}

	if (is_content_editable && has_content_editable_binding) {
		child_metadata.bound_contenteditable = true;
	}

	if (needs_input_reset && node.name === 'input') {
		context.state.init.push(b.stmt(b.call('$.remove_input_defaults', context.state.node)));
	}

	if (needs_content_reset && node.name === 'textarea') {
		context.state.init.push(b.stmt(b.call('$.remove_textarea_child', context.state.node)));
	}

	if (value_binding !== null && node.name === 'select') {
		setup_select_synchronization(value_binding, context);
	}

	const node_id = context.state.node;

	// Let bindings first, they can be used on attributes
	context.state.init.push(...lets);

	// Then do attributes
	let is_attributes_reactive = false;
	if (node.metadata.has_spread) {
		if (node.name === 'img') {
			img_might_be_lazy = true;
		}
		build_element_spread_attributes(
			attributes,
			context,
			node,
			node_id,
			// If value binding exists, that one takes care of calling $.init_select
			value_binding === null && node.name === 'select'
		);
		is_attributes_reactive = true;
	} else {
		for (const attribute of /** @type {AST.Attribute[]} */ (attributes)) {
			if (is_event_attribute(attribute)) {
				if (
					(attribute.name === 'onload' || attribute.name === 'onerror') &&
					is_load_error_element(node.name)
				) {
					might_need_event_replaying = true;
				}
				visit_event_attribute(attribute, context);
				continue;
			}

			if (needs_special_value_handling && attribute.name === 'value') {
				build_element_special_value_attribute(node.name, node_id, attribute, context);
				continue;
			}

			if (
				!is_custom_element &&
				attribute.name !== 'autofocus' &&
				(attribute.value === true || is_text_attribute(attribute))
			) {
				const name = get_attribute_name(node, attribute, context);
				const value = is_text_attribute(attribute) ? attribute.value[0].data : true;

				if (name !== 'class' || value) {
					context.state.template.push(
						` ${attribute.name}${
							is_boolean_attribute(name) && value === true
								? ''
								: `="${value === true ? '' : escape_html(value, true)}"`
						}`
					);
				}
				continue;
			}

			const is = is_custom_element
				? build_custom_element_attribute_update_assignment(node_id, attribute, context)
				: build_element_attribute_update_assignment(node, node_id, attribute, context);
			if (is) is_attributes_reactive = true;
		}
	}

	// Apply the src and loading attributes for <img> elements after the element is appended to the document
	if (img_might_be_lazy) {
		context.state.after_update.push(b.stmt(b.call('$.handle_lazy_img', node_id)));
	}

	// class/style directives must be applied last since they could override class/style attributes
	build_class_directives(class_directives, node_id, context, is_attributes_reactive);
	build_style_directives(
		style_directives,
		node_id,
		context,
		is_attributes_reactive,
		has_style_attribute || node.metadata.has_spread
	);

	if (might_need_event_replaying) {
		context.state.after_update.push(b.stmt(b.call('$.replay_events', node_id)));
	}

	context.state.template.push('>');

	/** @type {SourceLocation[]} */
	const child_locations = [];

	/** @type {ComponentClientTransformState} */
	const state = {
		...context.state,
		metadata: child_metadata,
		locations: child_locations,
		scope: /** @type {Scope} */ (context.state.scopes.get(node.fragment)),
		preserve_whitespace:
			context.state.preserve_whitespace || node.name === 'pre' || node.name === 'textarea'
	};

	const { hoisted, trimmed } = clean_nodes(
		node,
		node.fragment.nodes,
		context.path,
		child_metadata.namespace,
		state,
		node.name === 'script' || state.preserve_whitespace,
		state.options.preserveComments
	);

	/** Whether or not we need to wrap the children in `{...}` to avoid declaration conflicts */
	const has_declaration = node.fragment.nodes.some((node) => node.type === 'SnippetBlock');

	/** @type {typeof state} */
	const child_state = { ...state, init: [], update: [], after_update: [] };

	for (const node of hoisted) {
		context.visit(node, child_state);
	}

	// special case — if an element that only contains text, we don't need
	// to descend into it if the text is non-reactive
	const text_content =
		trimmed.every((node) => node.type === 'Text' || node.type === 'ExpressionTag') &&
		trimmed.some((node) => node.type === 'ExpressionTag') &&
		build_template_literal(trimmed, context.visit, child_state);

	if (text_content && !text_content.has_state) {
		child_state.init.push(
			b.stmt(b.assignment('=', b.member(context.state.node, 'textContent'), text_content.value))
		);
	} else {
		/** @type {Expression} */
		let arg = context.state.node;

		// If `hydrate_node` is set inside the element, we need to reset it
		// after the element has been hydrated
		let needs_reset = trimmed.some((node) => node.type !== 'Text');

		// The same applies if it's a `<template>` element, since we need to
		// set the value of `hydrate_node` to `node.content`
		if (node.name === 'template') {
			needs_reset = true;
			child_state.init.push(b.stmt(b.call('$.hydrate_template', arg)));
			arg = b.member(arg, 'content');
		}

		process_children(trimmed, () => b.call('$.child', arg), true, {
			...context,
			state: child_state
		});

		if (needs_reset) {
			child_state.init.push(b.stmt(b.call('$.reset', context.state.node)));
		}
	}

	if (has_declaration) {
		context.state.init.push(
			b.block([
				...child_state.init,
				child_state.update.length > 0 ? build_render_statement(child_state.update) : b.empty,
				...child_state.after_update
			])
		);
	} else if (node.fragment.metadata.dynamic) {
		context.state.init.push(...child_state.init);
		context.state.update.push(...child_state.update);
		context.state.after_update.push(...child_state.after_update);
	}

	if (has_direction_attribute) {
		// This fixes an issue with Chromium where updates to text content within an element
		// does not update the direction when set to auto. If we just re-assign the dir, this fixes it.
		const dir = b.member(node_id, 'dir');
		context.state.update.push(b.stmt(b.assignment('=', dir, dir)));
	}

	if (child_locations.length > 0) {
		// @ts-expect-error
		location.push(child_locations);
	}

	if (!is_void(node.name)) {
		context.state.template.push(`</${node.name}>`);
	}
}

/**
 * Special case: if we have a value binding on a select element, we need to set up synchronization
 * between the value binding and inner signals, for indirect updates
 * @param {AST.BindDirective} value_binding
 * @param {ComponentContext} context
 */
function setup_select_synchronization(value_binding, context) {
	if (context.state.analysis.runes) return;

	let bound = value_binding.expression;
	while (bound.type === 'MemberExpression') {
		bound = /** @type {Identifier | MemberExpression} */ (bound.object);
	}

	/** @type {string[]} */
	const names = [];

	for (const [name, refs] of context.state.scope.references) {
		if (
			refs.length > 0 &&
			// prevent infinite loop
			name !== bound.name
		) {
			names.push(name);
		}
	}

	const invalidator = b.call(
		'$.invalidate_inner_signals',
		b.thunk(
			b.block(
				names.map((name) => {
					const serialized = build_getter(b.id(name), context.state);
					return b.stmt(serialized);
				})
			)
		)
	);

	context.state.init.push(
		b.stmt(
			b.call(
				'$.template_effect',
				b.thunk(
					b.block([
						b.stmt(/** @type {Expression} */ (context.visit(value_binding.expression))),
						b.stmt(invalidator)
					])
				)
			)
		)
	);
}

/**
 * @param {Array<AST.Attribute | AST.SpreadAttribute>} attributes
 * @param {ComponentContext} context
 * @param {AST.RegularElement} element
 * @param {Identifier} element_id
 * @param {boolean} needs_select_handling
 */
function build_element_spread_attributes(
	attributes,
	context,
	element,
	element_id,
	needs_select_handling
) {
	let needs_isolation = false;

	/** @type {ObjectExpression['properties']} */
	const values = [];

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const name = get_attribute_name(element, attribute, context);
			// TODO: handle has_call
			const { value } = build_attribute_value(attribute.value, context);

			if (
				name === 'is' &&
				value.type === 'Literal' &&
				context.state.metadata.namespace === 'html'
			) {
				context.state.template.push(` is="${escape_html(value.value, true)}"`);
				continue;
			}

			if (
				is_event_attribute(attribute) &&
				(get_attribute_expression(attribute).type === 'ArrowFunctionExpression' ||
					get_attribute_expression(attribute).type === 'FunctionExpression')
			) {
				// Give the event handler a stable ID so it isn't removed and readded on every update
				const id = context.state.scope.generate('event_handler');
				context.state.init.push(b.var(id, value));
				values.push(b.init(attribute.name, b.id(id)));
			} else {
				values.push(b.init(name, value));
			}
		} else {
			values.push(b.spread(/** @type {Expression} */ (context.visit(attribute))));
		}

		needs_isolation ||=
			attribute.type === 'SpreadAttribute' && attribute.metadata.expression.has_call;
	}

	const preserve_attribute_case =
		element.metadata.svg || element.metadata.mathml || is_custom_element_node(element);
	const id = b.id(context.state.scope.generate('attributes'));

	const update = b.stmt(
		b.assignment(
			'=',
			id,
			b.call(
				'$.set_attributes',
				element_id,
				id,
				b.object(values),
				context.state.analysis.css.hash !== '' && b.literal(context.state.analysis.css.hash),
				preserve_attribute_case && b.true,
				is_ignored(element, 'hydration_attribute_changed') && b.true
			)
		)
	);

	context.state.init.push(b.let(id));

	// objects could contain reactive getters -> play it safe and always assume spread attributes are reactive
	if (needs_isolation) {
		context.state.init.push(build_update(update));
	} else {
		context.state.update.push(update);
	}

	if (needs_select_handling) {
		context.state.init.push(
			b.stmt(b.call('$.init_select', element_id, b.thunk(b.member(id, 'value'))))
		);
		context.state.update.push(
			b.if(
				b.binary('in', b.literal('value'), id),
				b.block([
					// This ensures a one-way street to the DOM in case it's <select {value}>
					// and not <select bind:value>. We need it in addition to $.init_select
					// because the select value is not reflected as an attribute, so the
					// mutation observer wouldn't notice.
					b.stmt(b.call('$.select_option', element_id, b.member(id, 'value')))
				])
			)
		);
	}
}

/**
 * Serializes an assignment to an element property by adding relevant statements to either only
 * the init or the the init and update arrays, depending on whether or not the value is dynamic.
 * Resulting code for static looks something like this:
 * ```js
 * element.property = value;
 * // or
 * $.set_attribute(element, property, value);
 * });
 * ```
 * Resulting code for dynamic looks something like this:
 * ```js
 * let value;
 * $.template_effect(() => {
 * 	if (value !== (value = 'new value')) {
 * 		element.property = value;
 * 		// or
 * 		$.set_attribute(element, property, value);
 * 	}
 * });
 * ```
 * Returns true if attribute is deemed reactive, false otherwise.
 * @param {AST.RegularElement} element
 * @param {Identifier} node_id
 * @param {AST.Attribute} attribute
 * @param {ComponentContext} context
 * @returns {boolean}
 */
function build_element_attribute_update_assignment(element, node_id, attribute, context) {
	const state = context.state;
	const name = get_attribute_name(element, attribute, context);
	const is_svg = context.state.metadata.namespace === 'svg' || element.name === 'svg';
	const is_mathml = context.state.metadata.namespace === 'mathml';
	let { has_call, value } = build_attribute_value(attribute.value, context);

	if (name === 'autofocus') {
		state.init.push(b.stmt(b.call('$.autofocus', node_id, value)));
		return false;
	}

	/** @type {Statement} */
	let update;

	if (name === 'class') {
		update = b.stmt(
			b.call(
				is_svg ? '$.set_svg_class' : is_mathml ? '$.set_mathml_class' : '$.set_class',
				node_id,
				value
			)
		);
	} else if (name === 'value') {
		update = b.stmt(b.call('$.set_value', node_id, value));
	} else if (name === 'checked') {
		update = b.stmt(b.call('$.set_checked', node_id, value));
	} else if (is_dom_property(name)) {
		update = b.stmt(b.assignment('=', b.member(node_id, name), value));
	} else {
		const callee = name.startsWith('xlink') ? '$.set_xlink_attribute' : '$.set_attribute';
		update = b.stmt(
			b.call(
				callee,
				node_id,
				b.literal(name),
				value,
				is_ignored(element, 'hydration_attribute_changed') && b.true
			)
		);
	}

	if (attribute.metadata.expression.has_state) {
		if (has_call) {
			state.init.push(build_update(update));
		} else {
			state.update.push(update);
		}
		return true;
	} else {
		state.init.push(update);
		return false;
	}
}

/**
 * Like `build_element_attribute_update_assignment` but without any special attribute treatment.
 * @param {Identifier}	node_id
 * @param {AST.Attribute} attribute
 * @param {ComponentContext} context
 * @returns {boolean}
 */
function build_custom_element_attribute_update_assignment(node_id, attribute, context) {
	const state = context.state;
	const name = attribute.name; // don't lowercase, as we set the element's property, which might be case sensitive
	let { has_call, value } = build_attribute_value(attribute.value, context);

	const update = b.stmt(b.call('$.set_custom_element_data', node_id, b.literal(name), value));

	if (attribute.metadata.expression.has_state) {
		if (has_call) {
			state.init.push(build_update(update));
		} else {
			state.update.push(update);
		}
		return true;
	} else {
		state.init.push(update);
		return false;
	}
}

/**
 * Serializes an assignment to the value property of a `<select>`, `<option>` or `<input>` element
 * that needs the hidden `__value` property.
 * Returns true if attribute is deemed reactive, false otherwise.
 * @param {string} element
 * @param {Identifier} node_id
 * @param {AST.Attribute} attribute
 * @param {ComponentContext} context
 * @returns {boolean}
 */
function build_element_special_value_attribute(element, node_id, attribute, context) {
	const state = context.state;
	const { value } = build_attribute_value(attribute.value, context);

	const inner_assignment = b.assignment(
		'=',
		b.member(node_id, 'value'),
		b.conditional(
			b.binary('==', b.literal(null), b.assignment('=', b.member(node_id, '__value'), value)),
			b.literal(''), // render null/undefined values as empty string to support placeholder options
			value
		)
	);

	const is_select_with_value =
		// attribute.metadata.dynamic would give false negatives because even if the value does not change,
		// the inner options could still change, so we need to always treat it as reactive
		element === 'select' && attribute.value !== true && !is_text_attribute(attribute);

	const update = b.stmt(
		is_select_with_value
			? b.sequence([
					inner_assignment,
					// This ensures a one-way street to the DOM in case it's <select {value}>
					// and not <select bind:value>. We need it in addition to $.init_select
					// because the select value is not reflected as an attribute, so the
					// mutation observer wouldn't notice.
					b.call('$.select_option', node_id, value)
				])
			: inner_assignment
	);

	if (is_select_with_value) {
		state.init.push(b.stmt(b.call('$.init_select', node_id, b.thunk(value))));
	}

	if (attribute.metadata.expression.has_state) {
		const id = state.scope.generate(`${node_id.name}_value`);
		build_update_assignment(
			state,
			id,
			// `<option>` is a special case: The value property reflects to the DOM. If the value is set to undefined,
			// that means the value should be set to the empty string. To be able to do that when the value is
			// initially undefined, we need to set a value that is guaranteed to be different.
			element === 'option' ? b.object([]) : undefined,
			value,
			update
		);
		return true;
	} else {
		state.init.push(update);
		return false;
	}
}
