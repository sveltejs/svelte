/** @import { Expression, ExpressionStatement, Identifier, MemberExpression, ObjectExpression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { SourceLocation } from '#shared' */
/** @import { ComponentClientTransformState, ComponentContext } from '../types' */
/** @import { Scope } from '../../../scope' */
import {
	cannot_be_set_statically,
	is_boolean_attribute,
	is_dom_property,
	is_load_error_element,
	is_void
} from '../../../../../utils.js';
import { escape_html } from '../../../../../escaping.js';
import { dev, is_ignored, locator } from '../../../../state.js';
import { is_event_attribute, is_text_attribute } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { is_custom_element_node } from '../../../nodes.js';
import { clean_nodes, determine_namespace_for_children } from '../../utils.js';
import { build_getter } from '../utils.js';
import {
	get_attribute_name,
	build_attribute_value,
	build_style_directives,
	build_set_attributes,
	build_set_class
} from './shared/element.js';
import { process_children } from './shared/fragment.js';
import {
	build_render_statement,
	build_template_chunk,
	build_update_assignment,
	get_expression_id,
	memoize_expression
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

	const is_custom_element = is_custom_element_node(node);

	if (node.name === 'video' || is_custom_element) {
		// cloneNode is faster, but it does not instantiate the underlying class of the
		// custom element until the template is connected to the dom, which would
		// cause problems when setting properties on the custom element.
		// Therefore we need to use importNode instead, which doesn't have this caveat.
		// Additionally, Webkit browsers need importNode for video elements for autoplay
		// to work correctly.
		context.state.metadata.context.template_needs_import_node = true;
	}

	if (node.name === 'script') {
		context.state.metadata.context.template_contains_script_tag = true;
	}

	context.state.template.push(`<${node.name}`);

	/** @type {Array<AST.Attribute | AST.SpreadAttribute>} */
	const attributes = [];

	/** @type {AST.ClassDirective[]} */
	const class_directives = [];

	/** @type {AST.StyleDirective[]} */
	const style_directives = [];

	/** @type {Array<AST.AnimateDirective | AST.BindDirective | AST.OnDirective | AST.TransitionDirective | AST.UseDirective>} */
	const other_directives = [];

	/** @type {ExpressionStatement[]} */
	const lets = [];

	/** @type {Map<string, AST.Attribute>} */
	const lookup = new Map();

	/** @type {Map<string, AST.BindDirective>} */
	const bindings = new Map();

	let has_spread = node.metadata.has_spread;
	let has_use = false;

	for (const attribute of node.attributes) {
		switch (attribute.type) {
			case 'AnimateDirective':
				other_directives.push(attribute);
				break;

			case 'Attribute':
				// `is` attributes need to be part of the template, otherwise they break
				if (attribute.name === 'is' && context.state.metadata.namespace === 'html') {
					const { value } = build_attribute_value(attribute.value, context);

					if (value.type === 'Literal' && typeof value.value === 'string') {
						context.state.template.push(` is="${escape_html(value.value, true)}"`);
						continue;
					}
				}

				attributes.push(attribute);
				lookup.set(attribute.name, attribute);
				break;

			case 'BindDirective':
				bindings.set(attribute.name, attribute);
				other_directives.push(attribute);
				break;

			case 'ClassDirective':
				class_directives.push(attribute);
				break;

			case 'LetDirective':
				// visit let directives before everything else, to set state
				lets.push(/** @type {ExpressionStatement} */ (context.visit(attribute)));
				break;

			case 'OnDirective':
				other_directives.push(attribute);
				break;

			case 'SpreadAttribute':
				attributes.push(attribute);
				break;

			case 'StyleDirective':
				style_directives.push(attribute);
				break;

			case 'TransitionDirective':
				other_directives.push(attribute);
				break;

			case 'UseDirective':
				has_use = true;
				other_directives.push(attribute);
				break;
		}
	}

	/** @type {typeof state} */
	const element_state = { ...context.state, init: [], after_update: [] };

	for (const attribute of other_directives) {
		if (attribute.type === 'OnDirective') {
			const handler = /** @type {Expression} */ (context.visit(attribute));

			if (has_use) {
				element_state.init.push(b.stmt(b.call('$.effect', b.thunk(handler))));
			} else {
				element_state.after_update.push(b.stmt(handler));
			}
		} else {
			context.visit(attribute, element_state);
		}
	}

	if (node.name === 'input') {
		const has_value_attribute = attributes.some(
			(attribute) =>
				attribute.type === 'Attribute' &&
				(attribute.name === 'value' || attribute.name === 'checked') &&
				!is_text_attribute(attribute)
		);
		const has_default_value_attribute = attributes.some(
			(attribute) =>
				attribute.type === 'Attribute' &&
				(attribute.name === 'defaultValue' || attribute.name === 'defaultChecked')
		);
		if (
			!has_default_value_attribute &&
			(has_spread ||
				bindings.has('value') ||
				bindings.has('checked') ||
				bindings.has('group') ||
				(!bindings.has('group') && has_value_attribute))
		) {
			context.state.init.push(b.stmt(b.call('$.remove_input_defaults', context.state.node)));
		}
	}

	if (node.name === 'textarea') {
		const attribute = lookup.get('value') ?? lookup.get('checked');
		const needs_content_reset = attribute && !is_text_attribute(attribute);

		if (has_spread || bindings.has('value') || needs_content_reset) {
			context.state.init.push(b.stmt(b.call('$.remove_textarea_child', context.state.node)));
		}
	}

	if (node.name === 'select' && bindings.has('value')) {
		setup_select_synchronization(/** @type {AST.BindDirective} */ (bindings.get('value')), context);
	}

	// Let bindings first, they can be used on attributes
	context.state.init.push(...lets);

	const node_id = context.state.node;

	// Then do attributes
	let is_attributes_reactive = has_spread;

	if (has_spread) {
		const attributes_id = b.id(context.state.scope.generate('attributes'));

		build_set_attributes(
			attributes,
			class_directives,
			context,
			node,
			node_id,
			attributes_id,
			(node.metadata.svg || node.metadata.mathml || is_custom_element_node(node)) && b.true,
			is_custom_element_node(node) && b.true
		);

		// If value binding exists, that one takes care of calling $.init_select
		if (node.name === 'select' && !bindings.has('value')) {
			context.state.init.push(
				b.stmt(b.call('$.init_select', node_id, b.thunk(b.member(attributes_id, 'value'))))
			);

			context.state.update.push(
				b.if(
					b.binary('in', b.literal('value'), attributes_id),
					b.block([
						// This ensures a one-way street to the DOM in case it's <select {value}>
						// and not <select bind:value>. We need it in addition to $.init_select
						// because the select value is not reflected as an attribute, so the
						// mutation observer wouldn't notice.
						b.stmt(b.call('$.select_option', node_id, b.member(attributes_id, 'value')))
					])
				)
			);
		}
	} else {
		/** If true, needs `__value` for inputs */
		const needs_special_value_handling =
			node.name === 'option' ||
			node.name === 'select' ||
			bindings.has('group') ||
			bindings.has('checked');

		for (const attribute of /** @type {AST.Attribute[]} */ (attributes)) {
			if (is_event_attribute(attribute)) {
				visit_event_attribute(attribute, context);
				continue;
			}

			if (needs_special_value_handling && attribute.name === 'value') {
				build_element_special_value_attribute(node.name, node_id, attribute, context);
				continue;
			}

			const name = get_attribute_name(node, attribute);
			if (
				!is_custom_element &&
				!cannot_be_set_statically(attribute.name) &&
				(attribute.value === true || is_text_attribute(attribute)) &&
				(name !== 'class' || class_directives.length === 0)
			) {
				let value = is_text_attribute(attribute) ? attribute.value[0].data : true;

				if (name === 'class' && node.metadata.scoped && context.state.analysis.css.hash) {
					if (value === true || value === '') {
						value = context.state.analysis.css.hash;
					} else {
						value += ' ' + context.state.analysis.css.hash;
					}
				}

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

			const is =
				is_custom_element && name !== 'class'
					? build_custom_element_attribute_update_assignment(node_id, attribute, context)
					: build_element_attribute_update_assignment(
							node,
							node_id,
							attribute,
							attributes,
							class_directives,
							context
						);
			if (is) is_attributes_reactive = true;
		}
	}

	// style directives must be applied last since they could override class/style attributes
	build_style_directives(style_directives, node_id, context, is_attributes_reactive);

	if (
		is_load_error_element(node.name) &&
		(has_spread || has_use || lookup.has('onload') || lookup.has('onerror'))
	) {
		context.state.after_update.push(b.stmt(b.call('$.replay_events', node_id)));
	}

	context.state.template.push('>');

	const metadata = {
		...context.state.metadata,
		namespace: determine_namespace_for_children(node, context.state.metadata.namespace)
	};

	if (bindings.has('innerHTML') || bindings.has('innerText') || bindings.has('textContent')) {
		const contenteditable = lookup.get('contenteditable');

		if (
			contenteditable &&
			(contenteditable.value === true ||
				(is_text_attribute(contenteditable) && contenteditable.value[0].data === 'true'))
		) {
			metadata.bound_contenteditable = true;
		}
	}

	/** @type {ComponentClientTransformState} */
	const state = {
		...context.state,
		metadata,
		locations: [],
		scope: /** @type {Scope} */ (context.state.scopes.get(node.fragment)),
		preserve_whitespace:
			context.state.preserve_whitespace || node.name === 'pre' || node.name === 'textarea'
	};

	const { hoisted, trimmed } = clean_nodes(
		node,
		node.fragment.nodes,
		context.path,
		state.metadata.namespace,
		state,
		node.name === 'script' || state.preserve_whitespace,
		state.options.preserveComments
	);

	/** @type {typeof state} */
	const child_state = { ...state, init: [], update: [], after_update: [] };

	for (const node of hoisted) {
		context.visit(node, child_state);
	}

	// special case — if an element that only contains text, we don't need
	// to descend into it if the text is non-reactive
	// in the rare case that we have static text that can't be inlined
	// (e.g. `<span>{location}</span>`), set `textContent` programmatically
	const use_text_content =
		trimmed.every((node) => node.type === 'Text' || node.type === 'ExpressionTag') &&
		trimmed.every((node) => node.type === 'Text' || !node.metadata.expression.has_state) &&
		trimmed.some((node) => node.type === 'ExpressionTag');

	if (use_text_content) {
		const { value } = build_template_chunk(trimmed, context.visit, child_state);
		const empty_string = value.type === 'Literal' && value.value === '';

		if (!empty_string) {
			child_state.init.push(
				b.stmt(b.assignment('=', b.member(context.state.node, 'textContent'), value))
			);
		}
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

		process_children(trimmed, (is_text) => b.call('$.child', arg, is_text && b.true), true, {
			...context,
			state: child_state
		});

		if (needs_reset) {
			child_state.init.push(b.stmt(b.call('$.reset', context.state.node)));
		}
	}

	if (node.fragment.nodes.some((node) => node.type === 'SnippetBlock')) {
		// Wrap children in `{...}` to avoid declaration conflicts
		context.state.init.push(
			b.block([
				...child_state.init,
				...element_state.init,
				child_state.update.length > 0 ? build_render_statement(child_state) : b.empty,
				...child_state.after_update,
				...element_state.after_update
			])
		);
	} else if (node.fragment.metadata.dynamic) {
		context.state.init.push(...child_state.init, ...element_state.init);
		context.state.update.push(...child_state.update);
		context.state.after_update.push(...child_state.after_update, ...element_state.after_update);
	} else {
		context.state.init.push(...element_state.init);
		context.state.after_update.push(...element_state.after_update);
	}

	if (lookup.has('dir')) {
		// This fixes an issue with Chromium where updates to text content within an element
		// does not update the direction when set to auto. If we just re-assign the dir, this fixes it.
		const dir = b.member(node_id, 'dir');
		context.state.update.push(b.stmt(b.assignment('=', dir, dir)));
	}

	if (state.locations.length > 0) {
		// @ts-expect-error
		location.push(state.locations);
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

	if (bound.type === 'SequenceExpression') {
		return;
	}

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
					b.block([b.stmt(/** @type {Expression} */ (context.visit(bound))), b.stmt(invalidator)])
				)
			)
		)
	);
}

/**
 * @param {AST.ClassDirective[]} class_directives
 * @param {ComponentContext} context
 * @return {ObjectExpression}
 */
export function build_class_directives_object(class_directives, context) {
	let properties = [];

	for (const d of class_directives) {
		let expression = /** @type Expression */ (context.visit(d.expression));

		if (d.metadata.expression.has_call) {
			expression = get_expression_id(context.state, expression);
		}

		properties.push(b.init(d.name, expression));
	}

	return b.object(properties);
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
 * @param {Array<AST.Attribute | AST.SpreadAttribute>} attributes
 * @param {AST.ClassDirective[]} class_directives
 * @param {ComponentContext} context
 * @returns {boolean}
 */
function build_element_attribute_update_assignment(
	element,
	node_id,
	attribute,
	attributes,
	class_directives,
	context
) {
	const state = context.state;
	const name = get_attribute_name(element, attribute);
	const is_svg = context.state.metadata.namespace === 'svg' || element.name === 'svg';
	const is_mathml = context.state.metadata.namespace === 'mathml';

	const is_autofocus = name === 'autofocus';

	let { value, has_state } = build_attribute_value(attribute.value, context, (value, metadata) =>
		metadata.has_call
			? // if it's autofocus we will not add this to a template effect so we don't want to get the expression id
				// but separately memoize the expression
				is_autofocus
				? memoize_expression(state, value)
				: get_expression_id(state, value)
			: value
	);

	if (is_autofocus) {
		state.init.push(b.stmt(b.call('$.autofocus', node_id, value)));
		return false;
	}

	// Special case for Firefox who needs it set as a property in order to work
	if (name === 'muted') {
		if (!has_state) {
			state.init.push(b.stmt(b.assignment('=', b.member(node_id, b.id('muted')), value)));
			return false;
		}
		state.update.push(b.stmt(b.assignment('=', b.member(node_id, b.id('muted')), value)));
		return false;
	}

	/** @type {Statement} */
	let update;

	if (name === 'class') {
		return build_set_class(
			element,
			node_id,
			attribute,
			value,
			has_state,
			class_directives,
			context,
			!is_svg && !is_mathml
		);
	} else if (name === 'value') {
		update = b.stmt(b.call('$.set_value', node_id, value));
	} else if (name === 'checked') {
		update = b.stmt(b.call('$.set_checked', node_id, value));
	} else if (name === 'selected') {
		update = b.stmt(b.call('$.set_selected', node_id, value));
	} else if (
		// If we would just set the defaultValue property, it would override the value property,
		// because it is set in the template which implicitly means it's also setting the default value,
		// and if one updates the default value while the input is pristine it will also update the
		// current value, which is not what we want, which is why we need to do some extra work.
		name === 'defaultValue' &&
		(attributes.some(
			(attr) => attr.type === 'Attribute' && attr.name === 'value' && is_text_attribute(attr)
		) ||
			(element.name === 'textarea' && element.fragment.nodes.length > 0))
	) {
		update = b.stmt(b.call('$.set_default_value', node_id, value));
	} else if (
		// See defaultValue comment
		name === 'defaultChecked' &&
		attributes.some(
			(attr) => attr.type === 'Attribute' && attr.name === 'checked' && attr.value === true
		)
	) {
		update = b.stmt(b.call('$.set_default_checked', node_id, value));
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

	if (has_state) {
		state.update.push(update);
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
	let { value, has_state } = build_attribute_value(attribute.value, context);

	const update = b.stmt(b.call('$.set_custom_element_data', node_id, b.literal(name), value));

	if (has_state) {
		// this is different from other updates — it doesn't get grouped,
		// because set_custom_element_data may not be idempotent
		state.init.push(b.stmt(b.call('$.template_effect', b.thunk(update.expression))));
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
	const is_select_with_value =
		// attribute.metadata.dynamic would give false negatives because even if the value does not change,
		// the inner options could still change, so we need to always treat it as reactive
		element === 'select' && attribute.value !== true && !is_text_attribute(attribute);

	const { value, has_state } = build_attribute_value(attribute.value, context, (value, metadata) =>
		metadata.has_call
			? // if is a select with value we will also invoke `init_select` which need a reference before the template effect so we memoize separately
				is_select_with_value
				? memoize_expression(context.state, value)
				: get_expression_id(state, value)
			: value
	);

	const inner_assignment = b.assignment(
		'=',
		b.member(node_id, 'value'),
		b.conditional(
			b.binary('==', b.literal(null), b.assignment('=', b.member(node_id, '__value'), value)),
			b.literal(''), // render null/undefined values as empty string to support placeholder options
			value
		)
	);

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

	if (has_state) {
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
