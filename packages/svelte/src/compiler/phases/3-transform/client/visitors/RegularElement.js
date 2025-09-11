/** @import { ArrayExpression, Expression, ExpressionStatement, Identifier, MemberExpression, ObjectExpression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext } from '../types' */
/** @import { Scope } from '../../../scope' */
import {
	cannot_be_set_statically,
	is_boolean_attribute,
	is_dom_property,
	is_load_error_element
} from '../../../../../utils.js';
import { is_ignored } from '../../../../state.js';
import { is_event_attribute, is_text_attribute } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { create_attribute, is_custom_element_node } from '../../../nodes.js';
import { clean_nodes, determine_namespace_for_children } from '../../utils.js';
import { build_getter } from '../utils.js';
import {
	get_attribute_name,
	build_attribute_value,
	build_attribute_effect,
	build_set_class,
	build_set_style
} from './shared/element.js';
import { process_children } from './shared/fragment.js';
import { build_render_statement, build_template_chunk, Memoizer } from './shared/utils.js';
import { visit_event_attribute } from './shared/events.js';

/**
 * @param {AST.RegularElement} node
 * @param {ComponentContext} context
 */
export function RegularElement(node, context) {
	context.state.template.push_element(node.name, node.start);

	if (node.name === 'noscript') {
		context.state.template.pop_element();
		return;
	}

	const is_custom_element = is_custom_element_node(node);

	// cloneNode is faster, but it does not instantiate the underlying class of the
	// custom element until the template is connected to the dom, which would
	// cause problems when setting properties on the custom element.
	// Therefore we need to use importNode instead, which doesn't have this caveat.
	// Additionally, Webkit browsers need importNode for video elements for autoplay
	// to work correctly.
	context.state.template.needs_import_node ||= node.name === 'video' || is_custom_element;

	context.state.template.contains_script_tag ||= node.name === 'script';

	/** @type {Array<AST.Attribute | AST.SpreadAttribute>} */
	const attributes = [];

	/** @type {AST.ClassDirective[]} */
	const class_directives = [];

	/** @type {AST.StyleDirective[]} */
	const style_directives = [];

	/** @type {Array<AST.AnimateDirective | AST.BindDirective | AST.OnDirective | AST.TransitionDirective | AST.UseDirective | AST.AttachTag>} */
	const other_directives = [];

	/** @type {ExpressionStatement[]} */
	const lets = [];

	/** @type {Map<string, AST.Attribute>} */
	const lookup = new Map();

	/** @type {Map<string, AST.BindDirective>} */
	const bindings = new Map();

	let has_spread = node.metadata.has_spread;
	let has_use = false;
	let should_remove_defaults = false;

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
						context.state.template.set_prop('is', value.value);
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

			case 'AttachTag':
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
			if (has_spread) {
				// remove_input_defaults will be called inside set_attributes
				should_remove_defaults = true;
			} else {
				context.state.init.push(b.stmt(b.call('$.remove_input_defaults', context.state.node)));
			}
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

	/** If true, needs `__value` for inputs */
	const needs_special_value_handling =
		node.name === 'option' ||
		node.name === 'select' ||
		bindings.has('group') ||
		bindings.has('checked');

	if (has_spread) {
		build_attribute_effect(
			attributes,
			class_directives,
			style_directives,
			context,
			node,
			node_id,
			should_remove_defaults
		);
	} else {
		for (const attribute of /** @type {AST.Attribute[]} */ (attributes)) {
			if (is_event_attribute(attribute)) {
				visit_event_attribute(attribute, context);
				continue;
			}

			if (needs_special_value_handling && attribute.name === 'value') {
				continue;
			}

			const name = get_attribute_name(node, attribute);

			if (
				!is_custom_element &&
				!cannot_be_set_statically(attribute.name) &&
				(attribute.value === true || is_text_attribute(attribute)) &&
				(name !== 'class' || class_directives.length === 0) &&
				(name !== 'style' || style_directives.length === 0)
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
					context.state.template.set_prop(
						attribute.name,
						is_boolean_attribute(name) && value === true ? undefined : value === true ? '' : value
					);
				}
			} else if (name === 'autofocus') {
				let { value } = build_attribute_value(attribute.value, context);
				context.state.init.push(b.stmt(b.call('$.autofocus', node_id, value)));
			} else if (name === 'class') {
				const is_html = context.state.metadata.namespace === 'html' && node.name !== 'svg';
				build_set_class(node, node_id, attribute, class_directives, context, is_html);
			} else if (name === 'style') {
				build_set_style(node_id, attribute, style_directives, context);
			} else if (is_custom_element) {
				build_custom_element_attribute_update_assignment(node_id, attribute, context);
			} else {
				const { value, has_state } = build_attribute_value(
					attribute.value,
					context,
					(value, metadata) =>
						metadata.has_call || metadata.has_await
							? context.state.memoizer.add(value, metadata.has_await)
							: value
				);

				const update = build_element_attribute_update(node, node_id, name, value, attributes);

				(has_state ? context.state.update : context.state.init).push(b.stmt(update));
			}
		}
	}

	if (
		is_load_error_element(node.name) &&
		(has_spread || has_use || lookup.has('onload') || lookup.has('onerror'))
	) {
		context.state.after_update.push(b.stmt(b.call('$.replay_events', node_id)));
	}

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
		trimmed.every(
			(node) =>
				node.type === 'Text' ||
				(!node.metadata.expression.has_state && !node.metadata.expression.has_await)
		) &&
		trimmed.some((node) => node.type === 'ExpressionTag');

	if (use_text_content) {
		const { value } = build_template_chunk(trimmed, context, child_state);
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

	if (!has_spread && needs_special_value_handling) {
		if (node.metadata.synthetic_value_node) {
			const synthetic_node = node.metadata.synthetic_value_node;
			const synthetic_attribute = create_attribute(
				'value',
				synthetic_node.start,
				synthetic_node.end,
				[synthetic_node]
			);
			// this node is an `option` that didn't have a `value` attribute, but had
			// a single-expression child, so we treat the value of that expression as
			// the value of the option
			build_element_special_value_attribute(node.name, node_id, synthetic_attribute, context, true);
		} else {
			for (const attribute of /** @type {AST.Attribute[]} */ (attributes)) {
				if (attribute.name === 'value') {
					build_element_special_value_attribute(node.name, node_id, attribute, context);
					break;
				}
			}
		}
	}

	context.state.template.pop_element();
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
 * @param {Memoizer} memoizer
 * @return {ObjectExpression | Identifier}
 */
export function build_class_directives_object(
	class_directives,
	context,
	memoizer = context.state.memoizer
) {
	let properties = [];
	let has_call_or_state = false;
	let has_await = false;

	for (const d of class_directives) {
		const expression = /** @type Expression */ (context.visit(d.expression));
		properties.push(b.init(d.name, expression));
		has_call_or_state ||= d.metadata.expression.has_call || d.metadata.expression.has_state;
		has_await ||= d.metadata.expression.has_await;
	}

	const directives = b.object(properties);

	return has_call_or_state || has_await ? memoizer.add(directives, has_await) : directives;
}

/**
 * @param {AST.StyleDirective[]} style_directives
 * @param {ComponentContext} context
 * @param {Memoizer} memoizer
 * @return {ObjectExpression | ArrayExpression | Identifier}}
 */
export function build_style_directives_object(
	style_directives,
	context,
	memoizer = context.state.memoizer
) {
	const normal = b.object([]);
	const important = b.object([]);

	let has_call_or_state = false;
	let has_await = false;

	for (const d of style_directives) {
		const expression =
			d.value === true
				? build_getter(b.id(d.name), context.state)
				: build_attribute_value(d.value, context).value;

		const object = d.modifiers.includes('important') ? important : normal;
		object.properties.push(b.init(d.name, expression));

		has_call_or_state ||= d.metadata.expression.has_call || d.metadata.expression.has_state;
		has_await ||= d.metadata.expression.has_await;
	}

	const directives = important.properties.length ? b.array([normal, important]) : normal;

	return has_call_or_state || has_await ? memoizer.add(directives, has_await) : directives;
}

/**
 * Serializes an assignment to an element property by adding relevant statements to either only
 * the init or the init and update arrays, depending on whether or not the value is dynamic.
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
 * @param {string} name
 * @param {Expression} value
 * @param {Array<AST.Attribute | AST.SpreadAttribute>} attributes
 */
function build_element_attribute_update(element, node_id, name, value, attributes) {
	if (name === 'muted') {
		// Special case for Firefox who needs it set as a property in order to work
		return b.assignment('=', b.member(node_id, b.id('muted')), value);
	}

	if (name === 'value') {
		return b.call('$.set_value', node_id, value);
	}

	if (name === 'checked') {
		return b.call('$.set_checked', node_id, value);
	}

	if (name === 'selected') {
		return b.call('$.set_selected', node_id, value);
	}

	if (
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
		return b.call('$.set_default_value', node_id, value);
	}

	if (
		// See defaultValue comment
		name === 'defaultChecked' &&
		attributes.some(
			(attr) => attr.type === 'Attribute' && attr.name === 'checked' && attr.value === true
		)
	) {
		return b.call('$.set_default_checked', node_id, value);
	}

	if (is_dom_property(name)) {
		return b.assignment('=', b.member(node_id, name), value);
	}

	return b.call(
		name.startsWith('xlink') ? '$.set_xlink_attribute' : '$.set_attribute',
		node_id,
		b.literal(name),
		value,
		is_ignored(element, 'hydration_attribute_changed') && b.true
	);
}

/**
 * Like `build_element_attribute_update` but without any special attribute treatment.
 * @param {Identifier}	node_id
 * @param {AST.Attribute} attribute
 * @param {ComponentContext} context
 */
function build_custom_element_attribute_update_assignment(node_id, attribute, context) {
	const { value, has_state } = build_attribute_value(attribute.value, context);

	// don't lowercase name, as we set the element's property, which might be case sensitive
	const call = b.call('$.set_custom_element_data', node_id, b.literal(attribute.name), value);

	// this is different from other updates — it doesn't get grouped,
	// because set_custom_element_data may not be idempotent
	const update = has_state ? b.call('$.template_effect', b.thunk(call)) : call;

	context.state.init.push(b.stmt(update));
}

/**
 * Serializes an assignment to the value property of a `<select>`, `<option>` or `<input>` element
 * that needs the hidden `__value` property.
 * Returns true if attribute is deemed reactive, false otherwise.
 * @param {string} element
 * @param {Identifier} node_id
 * @param {AST.Attribute} attribute
 * @param {ComponentContext} context
 * @param {boolean} [synthetic] - true if this should not sync to the DOM
 */
function build_element_special_value_attribute(
	element,
	node_id,
	attribute,
	context,
	synthetic = false
) {
	const state = context.state;
	const is_select_with_value =
		// attribute.metadata.dynamic would give false negatives because even if the value does not change,
		// the inner options could still change, so we need to always treat it as reactive
		element === 'select' && attribute.value !== true && !is_text_attribute(attribute);

	const { value, has_state } = build_attribute_value(attribute.value, context, (value, metadata) =>
		metadata.has_call || metadata.has_await ? state.memoizer.add(value, metadata.has_await) : value
	);

	const evaluated = context.state.scope.evaluate(value);
	const assignment = b.assignment('=', b.member(node_id, '__value'), value);

	const set_value_assignment = b.assignment(
		'=',
		b.member(node_id, 'value'),
		evaluated.is_defined ? assignment : b.logical('??', assignment, b.literal(''))
	);

	const update = b.stmt(
		is_select_with_value
			? b.sequence([
					set_value_assignment,
					// This ensures a one-way street to the DOM in case it's <select {value}>
					// and not <select bind:value>. We need it in addition to $.init_select
					// because the select value is not reflected as an attribute, so the
					// mutation observer wouldn't notice.
					b.call('$.select_option', node_id, value)
				])
			: synthetic
				? assignment
				: set_value_assignment
	);

	if (has_state) {
		const id = b.id(state.scope.generate(`${node_id.name}_value`));

		// `<option>` is a special case: The value property reflects to the DOM. If the value is set to undefined,
		// that means the value should be set to the empty string. To be able to do that when the value is
		// initially undefined, we need to set a value that is guaranteed to be different.
		const init = element === 'option' ? b.object([]) : undefined;

		state.init.push(b.var(id, init));
		state.update.push(b.if(b.binary('!==', id, b.assignment('=', id, value)), b.block([update])));
	} else {
		state.init.push(update);
	}

	if (is_select_with_value) {
		state.init.push(b.stmt(b.call('$.init_select', node_id)));
	}
}
