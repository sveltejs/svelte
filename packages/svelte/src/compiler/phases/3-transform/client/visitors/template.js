import {
	extract_identifiers,
	extract_paths,
	is_event_attribute,
	is_text_attribute,
	object
} from '../../../../utils/ast.js';
import { binding_properties } from '../../../bindings.js';
import {
	clean_nodes,
	determine_namespace_for_children,
	escape_html,
	infer_namespace
} from '../../utils.js';
import { DOMProperties, PassiveEvents, VoidElements } from '../../../constants.js';
import { is_custom_element_node, is_element_node } from '../../../nodes.js';
import * as b from '../../../../utils/builders.js';
import { error } from '../../../../errors.js';
import {
	with_loc,
	function_visitor,
	get_assignment_value,
	serialize_get_binding,
	serialize_set_binding
} from '../utils.js';
import {
	AttributeAliases,
	DOMBooleanAttributes,
	EACH_INDEX_REACTIVE,
	EACH_IS_CONTROLLED,
	EACH_IS_STRICT_EQUALS,
	EACH_ITEM_REACTIVE,
	EACH_KEYED
} from '../../../../../constants.js';
import { regex_is_valid_identifier } from '../../../patterns.js';
import { javascript_visitors_runes } from './javascript-runes.js';
import { sanitize_template_string } from '../../../../utils/sanitize_template_string.js';

/**
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement} element
 * @param {import('#compiler').Attribute} attribute
 * @param {{ state: { metadata: { namespace: import('#compiler').Namespace }}}} context
 */
function get_attribute_name(element, attribute, context) {
	let name = attribute.name;
	if (!element.metadata.svg && context.state.metadata.namespace !== 'foreign') {
		name = name.toLowerCase();
		if (name in AttributeAliases) {
			name = AttributeAliases[name];
		}
	}
	return name;
}

/**
 * Serializes each style directive into something like `$.style(element, style_property, value)`
 * and adds it either to init or update, depending on whether or not the value or the attributes are dynamic.
 * @param {import('#compiler').StyleDirective[]} style_directives
 * @param {import('estree').Identifier} element_id
 * @param {import('../types.js').ComponentContext} context
 * @param {boolean} is_attributes_reactive
 */
function serialize_style_directives(style_directives, element_id, context, is_attributes_reactive) {
	const state = context.state;

	for (const directive of style_directives) {
		let value =
			directive.value === true
				? serialize_get_binding({ name: directive.name, type: 'Identifier' }, context.state)
				: serialize_attribute_value(directive.value, context)[1];
		const grouped = b.stmt(
			b.call(
				'$.style',
				element_id,
				b.literal(directive.name),
				value,
				/** @type {import('estree').Expression} */ (
					directive.modifiers.includes('important') ? b.true : undefined
				)
			)
		);
		const singular = b.stmt(
			b.call(
				'$.style_effect',
				element_id,
				b.literal(directive.name),
				b.arrow([], value),
				/** @type {import('estree').Expression} */ (
					directive.modifiers.includes('important') ? b.true : undefined
				)
			)
		);

		const contains_call_expression =
			Array.isArray(directive.value) &&
			directive.value.some(
				(v) => v.type === 'ExpressionTag' && v.metadata.contains_call_expression
			);

		if (!is_attributes_reactive && contains_call_expression) {
			state.update_effects.push(singular);
		} else if (is_attributes_reactive || directive.metadata.dynamic || contains_call_expression) {
			state.update.push({ grouped, singular });
		} else {
			state.init.push(grouped);
		}
	}
}

/**
 * For unfortunate legacy reasons, directive names can look like this `use:a.b-c`
 * This turns that string into a member expression
 * @param {string} name
 */
function parse_directive_name(name) {
	// this allow for accessing members of an object
	const parts = name.split('.');
	let part = /** @type {string} */ (parts.shift());

	/** @type {import('estree').Identifier | import('estree').MemberExpression} */
	let expression = b.id(part);

	while ((part = /** @type {string} */ (parts.shift()))) {
		const computed = !regex_is_valid_identifier.test(part);
		expression = b.member(expression, computed ? b.literal(part) : b.id(part), computed);
	}

	return expression;
}

/**
 * Serializes each class directive into something like `$.class_toogle(element, class_name, value)`
 * and adds it either to init or update, depending on whether or not the value or the attributes are dynamic.
 * @param {import('#compiler').ClassDirective[]} class_directives
 * @param {import('estree').Identifier} element_id
 * @param {import('../types.js').ComponentContext} context
 * @param {boolean} is_attributes_reactive
 */
function serialize_class_directives(class_directives, element_id, context, is_attributes_reactive) {
	const state = context.state;
	for (const directive of class_directives) {
		const value = /** @type {import('estree').Expression} */ (context.visit(directive.expression));
		const grouped = b.stmt(b.call('$.class_toggle', element_id, b.literal(directive.name), value));
		const singular = b.stmt(
			b.call('$.class_toggle_effect', element_id, b.literal(directive.name), b.arrow([], value))
		);
		const contains_call_expression = directive.expression.type === 'CallExpression';

		if (!is_attributes_reactive && contains_call_expression) {
			state.update_effects.push(singular);
		} else if (is_attributes_reactive || directive.metadata.dynamic || contains_call_expression) {
			state.update.push({ grouped, singular });
		} else {
			state.init.push(grouped);
		}
	}
}

/**
 *
 * @param {string | null} spread_id
 * @param {import('#compiler').RegularElement} node
 * @param {import('../types.js').ComponentContext} context
 * @param {import('estree').Identifier} node_id
 */
function add_select_to_spread_update(spread_id, node, context, node_id) {
	if (spread_id !== null && node.name === 'select') {
		context.state.update.push({
			grouped: b.if(
				b.binary('in', b.literal('value'), b.id(spread_id)),
				b.block([
					b.stmt(b.call('$.select_option', node_id, b.member(b.id(spread_id), b.id('value'))))
				])
			)
		});
	}
}

/**
 * @param {import('#compiler').Binding[]} references
 * @param {import('../types.js').ComponentContext} context
 */
function serialize_transitive_dependencies(references, context) {
	/** @type {Set<import('#compiler').Binding>} */
	const dependencies = new Set();

	for (const ref of references) {
		const deps = collect_transitive_dependencies(ref);
		for (const dep of deps) {
			dependencies.add(dep);
		}
	}

	return [...dependencies].map((dep) => serialize_get_binding({ ...dep.node }, context.state));
}

/**
 * @param {import('#compiler').Binding} binding
 * @param {Set<import('#compiler').Binding>} seen
 * @returns {import('#compiler').Binding[]}
 */
function collect_transitive_dependencies(binding, seen = new Set()) {
	if (binding.kind !== 'legacy_reactive') return [];

	for (const dep of binding.legacy_dependencies) {
		if (!seen.has(dep)) {
			seen.add(dep);
			for (const transitive_dep of collect_transitive_dependencies(dep, seen)) {
				seen.add(transitive_dep);
			}
		}
	}

	return [...seen];
}

/**
 * Special case: if we have a value binding on a select element, we need to set up synchronization
 * between the value binding and inner signals, for indirect updates
 * @param {import('#compiler').BindDirective} value_binding
 * @param {import('../types.js').ComponentContext} context
 */
function setup_select_synchronization(value_binding, context) {
	let bound = value_binding.expression;
	while (bound.type === 'MemberExpression') {
		bound = /** @type {import('estree').Identifier | import('estree').MemberExpression} */ (
			bound.object
		);
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

	if (!context.state.analysis.runes) {
		const invalidator = b.call(
			'$.invalidate_inner_signals',
			b.thunk(
				b.block(
					names.map((name) => {
						const serialized = serialize_get_binding(b.id(name), context.state);
						return b.stmt(serialized);
					})
				)
			)
		);

		context.state.init.push(
			b.stmt(
				b.call(
					'$.invalidate_effect',
					b.thunk(
						b.block([
							b.stmt(
								/** @type {import('estree').Expression} */ (context.visit(value_binding.expression))
							),
							b.stmt(invalidator)
						])
					)
				)
			)
		);
	}
}

/**
 * Serializes element attribute assignments that contain spreads to either only
 * the init or the the init and update arrays, depending on whether or not the value is dynamic.
 * Resulting code for static looks something like this:
 * ```js
 * $.spread_attributes(element, null, [...]);
 * ```
 * Resulting code for dynamic looks something like this:
 * ```js
 * let value;
 * $.render_effect(() => {
 * 	value = $.spread_attributes(element, value, [...])
 * });
 * ```
 * Returns the id of the spread_attribute variable if spread isn't isolated, `null` otherwise.
 * @param {Array<import('#compiler').Attribute | import('#compiler').SpreadAttribute>} attributes
 * @param {import('../types.js').ComponentContext} context
 * @param {import('#compiler').RegularElement} element
 * @param {import('estree').Identifier} element_id
 * @returns {string | null}
 */
function serialize_element_spread_attributes(attributes, context, element, element_id) {
	let needs_isolation = false;

	/** @type {import('estree').Expression[]} */
	const values = [];

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const name = get_attribute_name(element, attribute, context);
			// TODO: handle contains_call_expression
			const [, value] = serialize_attribute_value(attribute.value, context);
			values.push(b.object([b.init(name, value)]));
		} else {
			values.push(/** @type {import('estree').Expression} */ (context.visit(attribute)));
		}

		needs_isolation ||=
			attribute.type === 'SpreadAttribute' && attribute.metadata.contains_call_expression;
	}

	const lowercase_attributes =
		element.metadata.svg || is_custom_element_node(element) ? b.false : b.true;

	const isolated = b.stmt(
		b.call(
			'$.spread_attributes_effect',
			element_id,
			b.thunk(b.array(values)),
			lowercase_attributes,
			b.literal(context.state.analysis.css.hash)
		)
	);

	// objects could contain reactive getters -> play it safe and always assume spread attributes are reactive
	if (needs_isolation) {
		context.state.update_effects.push(isolated);
		return null;
	} else {
		const id = context.state.scope.generate('spread_attributes');
		context.state.init.push(b.let(id));
		context.state.update.push({
			singular: isolated,
			grouped: b.stmt(
				b.assignment(
					'=',
					b.id(id),
					b.call(
						'$.spread_attributes',
						element_id,
						b.id(id),
						b.array(values),
						lowercase_attributes,
						b.literal(context.state.analysis.css.hash)
					)
				)
			)
		});
		return id;
	}
}

/**
 * Serializes dynamic element attribute assignments.
 * Returns the `true` if spread is deemed reactive.
 * @param {Array<import('#compiler').Attribute | import('#compiler').SpreadAttribute>} attributes
 * @param {import('../types.js').ComponentContext} context
 * @param {import('estree').Identifier} element_id
 * @returns {boolean}
 */
function serialize_dynamic_element_attributes(attributes, context, element_id) {
	if (attributes.length === 0) {
		if (context.state.analysis.css.hash) {
			context.state.init.push(
				b.stmt(b.call('$.class_name', element_id, b.literal(context.state.analysis.css.hash)))
			);
		}
		return false;
	}

	let needs_isolation = false;
	let is_reactive = false;

	/** @type {import('estree').Expression[]} */
	const values = [];

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const [, value] = serialize_attribute_value(attribute.value, context);
			values.push(b.object([b.init(attribute.name, value)]));
		} else {
			values.push(/** @type {import('estree').Expression} */ (context.visit(attribute)));
		}

		is_reactive ||=
			attribute.metadata.dynamic ||
			// objects could contain reactive getters -> play it safe and always assume spread attributes are reactive
			attribute.type === 'SpreadAttribute';
		needs_isolation ||=
			attribute.type === 'SpreadAttribute' && attribute.metadata.contains_call_expression;
	}

	const isolated = b.stmt(
		b.call(
			'$.spread_dynamic_element_attributes_effect',
			element_id,
			b.thunk(b.array(values)),
			b.literal(context.state.analysis.css.hash)
		)
	);

	if (needs_isolation) {
		context.state.update_effects.push(isolated);
		return false;
	} else if (is_reactive) {
		const id = context.state.scope.generate('spread_attributes');
		context.state.init.push(b.let(id));
		context.state.update.push({
			singular: isolated,
			grouped: b.stmt(
				b.assignment(
					'=',
					b.id(id),
					b.call(
						'$.spread_dynamic_element_attributes',
						element_id,
						b.id(id),
						b.array(values),
						b.literal(context.state.analysis.css.hash)
					)
				)
			)
		});
		return true;
	} else {
		context.state.init.push(
			b.stmt(
				b.call(
					'$.spread_dynamic_element_attributes',
					element_id,
					b.literal(null),
					b.array(values),
					b.literal(context.state.analysis.css.hash)
				)
			)
		);
		return false;
	}
}

/**
 * Serializes an assignment to an element property by adding relevant statements to either only
 * the init or the the init and update arrays, depending on whether or not the value is dynamic.
 * Resulting code for static looks something like this:
 * ```js
 * element.property = value;
 * // or
 * $.attr(element, property, value);
 * });
 * ```
 * Resulting code for dynamic looks something like this:
 * ```js
 * let value;
 * $.render_effect(() => {
 * 	if (value !== (value = 'new value')) {
 * 		element.property = value;
 * 		// or
 * 		$.attr(element, property, value);
 * 	}
 * });
 * ```
 * Returns true if attribute is deemed reactive, false otherwise.
 * @param {import('#compiler').RegularElement} element
 * @param {import('estree').Identifier} node_id
 * @param {import('#compiler').Attribute} attribute
 * @param {import('../types.js').ComponentContext} context
 * @returns {boolean}
 */
function serialize_element_attribute_update_assignment(element, node_id, attribute, context) {
	const state = context.state;
	const name = get_attribute_name(element, attribute, context);
	let [contains_call_expression, value] = serialize_attribute_value(attribute.value, context);

	// The foreign namespace doesn't have any special handling, everything goes through the attr function
	if (context.state.metadata.namespace === 'foreign') {
		const statement = { grouped: b.stmt(b.call('$.attr', node_id, b.literal(name), value)) };
		if (attribute.metadata.dynamic) {
			const id = state.scope.generate(`${node_id.name}_${name}`);
			serialize_update_assignment(state, id, undefined, value, statement, contains_call_expression);
			return true;
		} else {
			state.init.push(statement.grouped);
			return false;
		}
	}

	let grouped_value = value;

	if (name === 'autofocus') {
		state.init.push(b.stmt(b.call('$.auto_focus', node_id, value)));
		return false;
	}

	if (name === 'class') {
		grouped_value = b.call('$.to_class', value);
	}

	/**
	 * @param {import('estree').Expression} grouped
	 * @param {import('estree').Expression} [singular]
	 */
	const assign = (grouped, singular) => {
		if (name === 'class') {
			if (singular) {
				return {
					singular: b.stmt(b.call('$.class_name_effect', node_id, b.thunk(singular))),
					grouped: b.stmt(b.call('$.class_name', node_id, singular)),
					skip_condition: true
				};
			}
			return {
				grouped: b.stmt(b.call('$.class_name', node_id, value)),
				skip_condition: true
			};
		} else if (!DOMProperties.includes(name)) {
			if (singular) {
				return {
					singular: b.stmt(
						b.call(
							name.startsWith('xlink') ? '$.xlink_attr_effect' : '$.attr_effect',
							node_id,
							b.literal(name),
							b.thunk(singular)
						)
					),
					grouped: b.stmt(
						b.call(
							name.startsWith('xlink') ? '$.xlink_attr' : '$.attr',
							node_id,
							b.literal(name),
							grouped
						)
					)
				};
			}
			return {
				grouped: b.stmt(
					b.call(
						name.startsWith('xlink') ? '$.xlink_attr' : '$.attr',
						node_id,
						b.literal(name),
						grouped
					)
				)
			};
		} else {
			return { grouped: b.stmt(b.assignment('=', b.member(node_id, b.id(name)), grouped)) };
		}
	};

	if (attribute.metadata.dynamic) {
		const id = state.scope.generate(`${node_id.name}_${name}`);
		serialize_update_assignment(
			state,
			id,
			name === 'class' ? b.literal('') : undefined,
			grouped_value,
			assign(b.id(id), value),
			contains_call_expression
		);
		return true;
	} else {
		state.init.push(assign(grouped_value).grouped);
		return false;
	}
}

/**
 * Like `serialize_element_attribute_update_assignment` but without any special attribute treatment.
 * @param {import('estree').Identifier}	node_id
 * @param {import('#compiler').Attribute} attribute
 * @param {import('../types.js').ComponentContext} context
 * @returns {boolean}
 */
function serialize_custom_element_attribute_update_assignment(node_id, attribute, context) {
	const state = context.state;
	const name = attribute.name; // don't lowercase, as we set the element's property, which might be case sensitive
	let [contains_call_expression, value] = serialize_attribute_value(attribute.value, context);
	let grouped_value = value;

	/**
	 * @param {import('estree').Expression} grouped
	 * @param {import('estree').Expression} [singular]
	 */
	const assign = (grouped, singular) => {
		if (singular) {
			return {
				singular: b.stmt(
					b.call('$.set_custom_element_data_effect', node_id, b.literal(name), b.thunk(singular))
				),
				grouped: b.stmt(b.call('$.set_custom_element_data', node_id, b.literal(name), grouped))
			};
		}
		return {
			grouped: b.stmt(b.call('$.set_custom_element_data', node_id, b.literal(name), grouped))
		};
	};

	if (attribute.metadata.dynamic) {
		const id = state.scope.generate(`${node_id.name}_${name}`);
		// TODO should this use the if condition? what if someone mutates the value passed to the ce?
		serialize_update_assignment(
			state,
			id,
			undefined,
			grouped_value,
			assign(b.id(id), value),
			contains_call_expression
		);
		return true;
	} else {
		state.init.push(assign(grouped_value).grouped);
		return false;
	}
}

/**
 * Serializes an assignment to the value property of a `<select>`, `<option>` or `<input>` element
 * that needs the hidden `__value` property.
 * Returns true if attribute is deemed reactive, false otherwise.
 * @param {string} element
 * @param {import('estree').Identifier} node_id
 * @param {import('#compiler').Attribute} attribute
 * @param {import('../types.js').ComponentContext} context
 * @returns {boolean}
 */
function serialize_element_special_value_attribute(element, node_id, attribute, context) {
	const state = context.state;
	const [contains_call_expression, value] = serialize_attribute_value(attribute.value, context);

	const inner_assignment = b.assignment(
		'=',
		b.member(node_id, b.id('value')),
		b.conditional(
			b.binary('==', b.literal(null), b.assignment('=', b.member(node_id, b.id('__value')), value)),
			b.literal(''), // render null/undefined values as empty string to support placeholder options
			value
		)
	);
	const is_reactive = attribute.metadata.dynamic;
	const needs_selected_call =
		element === 'option' && (is_reactive || collect_parent_each_blocks(context).length > 0);
	const needs_option_call = element === 'select' && is_reactive;
	const assignment = b.stmt(
		needs_selected_call
			? b.sequence([
					inner_assignment,
					// This ensures things stay in sync with the select binding
					// in case of updates to the option value or new values appearing
					b.call('$.selected', node_id)
				])
			: needs_option_call
				? b.sequence([
						inner_assignment,
						// This ensures a one-way street to the DOM in case it's <select {value}>
						// and not <select bind:value>
						b.call('$.select_option', node_id, value)
					])
				: inner_assignment
	);

	if (is_reactive) {
		const id = state.scope.generate(`${node_id.name}_value`);
		serialize_update_assignment(
			state,
			id,
			undefined,
			value,
			{ grouped: assignment },
			contains_call_expression
		);
		return true;
	} else {
		state.init.push(assignment);
		return false;
	}
}

/**
 * @param {import('../types.js').ComponentClientTransformState} state
 * @param {string} id
 * @param {import('estree').Expression | undefined} init
 * @param {import('estree').Expression} value
 * @param {{
 *   grouped: import('estree').ExpressionStatement;
 *   singular?: import('estree').ExpressionStatement;
 *   skip_condition?: boolean;
 * }} assignment
 * @param {boolean} contains_call_expression
 */
function serialize_update_assignment(state, id, init, value, assignment, contains_call_expression) {
	const grouped = b.if(
		b.binary('!==', b.id(id), b.assignment('=', b.id(id), value)),
		b.block([assignment.grouped])
	);

	if (contains_call_expression && assignment.singular) {
		state.update_effects.push(assignment.singular);
	} else {
		if (assignment.skip_condition) {
			if (assignment.singular) {
				state.update.push({
					singular: assignment.singular,
					grouped: assignment.grouped
				});
			} else {
				state.update.push({
					init: b.var(id, init),
					grouped
				});
			}
		} else {
			if (assignment.singular) {
				state.update.push({
					init: b.var(id, init),
					singular: assignment.singular,
					grouped
				});
			} else {
				state.update.push({
					init: b.var(id, init),
					grouped
				});
			}
		}
	}
}

/**
 * @param {import('../types.js').ComponentContext} context
 */
function collect_parent_each_blocks(context) {
	return /** @type {import('#compiler').EachBlock[]} */ (
		context.path.filter((node) => node.type === 'EachBlock')
	);
}

/**
 * @param {import('#compiler').Component | import('#compiler').SvelteComponent | import('#compiler').SvelteSelf} node
 * @param {string} component_name
 * @param {import('../types.js').ComponentContext} context
 * @returns {import('estree').Statement}
 */
function serialize_inline_component(node, component_name, context) {
	/** @type {Array<import('estree').Property[] | import('estree').Expression>} */
	const props_and_spreads = [];

	/** @type {import('estree').ExpressionStatement[]} */
	const lets = [];

	/** @type {Record<string, import('#compiler').TemplateNode[]>} */
	const children = {};

	/** @type {Record<string, import('estree').Expression[]>} */
	const events = {};

	/** @type {import('estree').Property[]} */
	const custom_css_props = [];

	/** @type {import('estree').Identifier | import('estree').MemberExpression | null} */
	let bind_this = null;

	const binding_initializers = [];

	/**
	 * If this component has a slot property, it is a named slot within another component. In this case
	 * the slot scope applies to the component itself, too, and not just its children.
	 */
	let slot_scope_applies_to_itself = false;

	/**
	 * @param {import('estree').Property} prop
	 */
	function push_prop(prop) {
		const current = props_and_spreads.at(-1);
		const current_is_props = Array.isArray(current);
		const props = current_is_props ? current : [];
		props.push(prop);
		if (!current_is_props) {
			props_and_spreads.push(props);
		}
	}
	for (const attribute of node.attributes) {
		if (attribute.type === 'LetDirective') {
			lets.push(/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute)));
		} else if (attribute.type === 'OnDirective') {
			events[attribute.name] ||= [];
			let handler = serialize_event_handler(attribute, context);
			if (attribute.modifiers.includes('once')) {
				handler = b.call('$.once', handler);
			}
			events[attribute.name].push(handler);
		} else if (attribute.type === 'SpreadAttribute') {
			const expression = /** @type {import('estree').Expression} */ (context.visit(attribute));
			if (attribute.metadata.dynamic) {
				let value = expression;

				if (attribute.metadata.contains_call_expression) {
					const id = b.id(context.state.scope.generate('spread_element'));
					context.state.init.push(b.var(id, b.call('$.derived', b.thunk(value))));
					value = b.call('$.get', id);
				}

				props_and_spreads.push(b.thunk(value));
			} else {
				props_and_spreads.push(expression);
			}
		} else if (attribute.type === 'Attribute') {
			if (attribute.name.startsWith('--')) {
				custom_css_props.push(
					b.init(attribute.name, serialize_attribute_value(attribute.value, context)[1])
				);
				continue;
			}

			if (attribute.name === 'slot') {
				slot_scope_applies_to_itself = true;
			}

			const [, value] = serialize_attribute_value(attribute.value, context);

			if (attribute.metadata.dynamic) {
				let arg = value;

				// When we have a non-simple computation, anything other than an Identifier or Member expression,
				// then there's a good chance it needs to be memoized to avoid over-firing when read within the
				// child component.
				const should_wrap_in_derived =
					Array.isArray(attribute.value) &&
					attribute.value.some((n) => {
						return (
							n.type === 'ExpressionTag' &&
							n.expression.type !== 'Identifier' &&
							n.expression.type !== 'MemberExpression'
						);
					});

				if (should_wrap_in_derived) {
					const id = b.id(context.state.scope.generate(attribute.name));
					context.state.init.push(b.var(id, b.call('$.derived', b.thunk(value))));
					arg = b.call('$.get', id);
				}

				push_prop(b.get(attribute.name, [b.return(arg)]));
			} else {
				push_prop(b.init(attribute.name, value));
			}
		} else if (attribute.type === 'BindDirective') {
			if (attribute.name === 'this') {
				bind_this = attribute.expression;
			} else {
				const expression = /** @type {import('estree').Expression} */ (
					context.visit(attribute.expression)
				);

				if (context.state.options.dev) {
					binding_initializers.push(
						b.stmt(
							b.call(
								b.id('$.pre_effect'),
								b.thunk(b.call(b.id('$.add_owner'), expression, b.id(component_name)))
							)
						)
					);
				}

				push_prop(b.get(attribute.name, [b.return(expression)]));

				const assignment = b.assignment('=', attribute.expression, b.id('$$value'));
				push_prop(
					b.set(attribute.name, [
						b.stmt(serialize_set_binding(assignment, context, () => context.visit(assignment)))
					])
				);
			}
		}
	}

	if (slot_scope_applies_to_itself) {
		context.state.init.push(...lets);
	}

	if (Object.keys(events).length > 0) {
		const events_expression = b.object(
			Object.keys(events).map((name) =>
				b.init(name, events[name].length > 1 ? b.array(events[name]) : events[name][0])
			)
		);
		push_prop(b.init('$$events', events_expression));
	}

	/** @type {import('estree').Statement[]} */
	const snippet_declarations = [];

	// Group children by slot
	for (const child of node.fragment.nodes) {
		if (child.type === 'SnippetBlock') {
			// the SnippetBlock visitor adds a declaration to `init`, but if it's directly
			// inside a component then we want to hoist them into a block so that they
			// can be used as props without creating conflicts
			context.visit(child, {
				...context.state,
				init: snippet_declarations
			});

			push_prop(b.prop('init', child.expression, child.expression));

			continue;
		}

		let slot_name = 'default';

		if (is_element_node(child)) {
			const attribute = /** @type {import('#compiler').Attribute | undefined} */ (
				child.attributes.find(
					(attribute) => attribute.type === 'Attribute' && attribute.name === 'slot'
				)
			);

			if (attribute !== undefined) {
				slot_name = /** @type {import('#compiler').Text[]} */ (attribute.value)[0].data;
			}
		}

		children[slot_name] = children[slot_name] || [];
		children[slot_name].push(child);
	}

	// Serialize each slot
	/** @type {import('estree').Property[]} */
	const serialized_slots = [];
	for (const slot_name of Object.keys(children)) {
		const body = create_block(node, `${node.name}_${slot_name}`, children[slot_name], context);
		if (body.length === 0) continue;

		const slot_fn = b.arrow(
			[b.id('$$anchor'), b.id('$$slotProps')],
			b.block([...(slot_name === 'default' && !slot_scope_applies_to_itself ? lets : []), ...body])
		);

		if (slot_name === 'default') {
			push_prop(
				b.init(
					'children',
					context.state.options.dev ? b.call('$.add_snippet_symbol', slot_fn) : slot_fn
				)
			);
		} else {
			serialized_slots.push(b.init(slot_name, slot_fn));
		}
	}

	if (serialized_slots.length > 0) {
		push_prop(b.init('$$slots', b.object(serialized_slots)));
	}

	const props_expression =
		props_and_spreads.length === 0 ||
		(props_and_spreads.length === 1 && Array.isArray(props_and_spreads[0]))
			? b.object(/** @type {import('estree').Property[]} */ (props_and_spreads[0]) || [])
			: b.call(
					'$.spread_props',
					...props_and_spreads.map((p) => (Array.isArray(p) ? b.object(p) : p))
				);
	/** @param {import('estree').Identifier} node_id */
	let fn = (node_id) =>
		b.call(
			context.state.options.dev
				? b.call('$.validate_component', b.id(component_name))
				: component_name,
			node_id,
			props_expression
		);

	if (bind_this !== null) {
		const prev = fn;
		const assignment = b.assignment('=', bind_this, b.id('$$value'));
		const bind_this_id = /** @type {import('estree').Expression} */ (
			// if expression is not an identifier, we know it can't be a signal
			bind_this.type === 'Identifier'
				? bind_this
				: bind_this.type === 'MemberExpression' && bind_this.object.type === 'Identifier'
					? bind_this.object
					: undefined
		);
		fn = (node_id) =>
			b.call(
				'$.bind_this',
				prev(node_id),
				b.arrow(
					[b.id('$$value')],
					serialize_set_binding(assignment, context, () => context.visit(assignment))
				),
				bind_this_id
			);
	}

	if (Object.keys(custom_css_props).length > 0) {
		const prev = fn;
		fn = (node_id) =>
			b.call(
				'$.cssProps',
				node_id,
				// TODO would be great to do this at runtime instead. Svelte 4 also can't handle cases today
				// where it's not statically determinable whether the component is used in a svg or html context
				context.state.metadata.namespace === 'svg' ? b.false : b.true,
				b.thunk(b.object(custom_css_props)),
				b.arrow([b.id('$$node')], prev(b.id('$$node')))
			);
	}

	const statements = [
		...snippet_declarations,
		...binding_initializers,
		b.stmt(fn(context.state.node))
	];

	return statements.length > 1 ? b.block(statements) : statements[0];
}

/**
 * Creates a new block which looks roughly like this:
 * ```js
 * // hoisted:
 * const block_name = $.template(`...`);
 *
 * // for the main block:
 * const id = $.open(block_name);
 * // init stuff and possibly render effect
 * $.close(id);
 * ```
 * Adds the hoisted parts to `context.state.hoisted` and returns the statements of the main block.
 * @param {import('#compiler').SvelteNode} parent
 * @param {string} name
 * @param {import('#compiler').SvelteNode[]} nodes
 * @param {import('../types.js').ComponentContext} context
 * @returns {import('estree').Statement[]}
 */
function create_block(parent, name, nodes, context) {
	const namespace = infer_namespace(context.state.metadata.namespace, parent, nodes, context.path);

	const { hoisted, trimmed } = clean_nodes(
		parent,
		nodes,
		context.path,
		namespace,
		context.state.preserve_whitespace,
		context.state.options.preserveComments
	);

	if (hoisted.length === 0 && trimmed.length === 0) {
		return [];
	}

	const is_single_element = trimmed.length === 1 && trimmed[0].type === 'RegularElement';
	const is_single_child_not_needing_template =
		trimmed.length === 1 &&
		(trimmed[0].type === 'SvelteFragment' || trimmed[0].type === 'TitleElement');

	const template_name = context.state.scope.root.unique(name);

	/** @type {import('estree').Statement[]} */
	const body = [];

	/** @type {import('estree').Statement | undefined} */
	let close = undefined;

	/** @type {import('../types').ComponentClientTransformState} */
	const state = {
		...context.state,
		init: [],
		update: [],
		update_effects: [],
		after_update: [],
		template: [],
		metadata: {
			context: {
				template_needs_import_node: false,
				template_contains_script_tag: false
			},
			namespace,
			bound_contenteditable: context.state.metadata.bound_contenteditable
		}
	};

	for (const node of hoisted) {
		context.visit(node, state);
	}

	if (is_single_element) {
		const element = /** @type {import('#compiler').RegularElement} */ (trimmed[0]);

		const id = b.id(context.state.scope.generate(element.name));

		context.visit(element, {
			...state,
			node: id
		});

		context.state.hoisted.push(
			b.var(
				template_name,
				b.call(
					get_template_function(namespace, state),
					b.template([b.quasi(state.template.join(''), true)], [])
				)
			)
		);

		body.push(
			b.var(
				id,
				b.call(
					'$.open',
					b.id('$$anchor'),
					b.literal(!state.metadata.context.template_needs_import_node),
					template_name
				)
			),
			...state.init
		);
		close = b.stmt(b.call('$.close', b.id('$$anchor'), id));
	} else if (is_single_child_not_needing_template) {
		context.visit(trimmed[0], state);
		body.push(...state.init);
	} else if (trimmed.length > 0) {
		const id = b.id(context.state.scope.generate('fragment'));

		const use_space_template =
			trimmed.some((node) => node.type === 'ExpressionTag') &&
			trimmed.every((node) => node.type === 'Text' || node.type === 'ExpressionTag');

		if (use_space_template) {
			// special case — we can use `$.space_frag` instead of creating a unique template
			const id = b.id(context.state.scope.generate('text'));

			process_children(trimmed, () => id, false, {
				...context,
				state
			});

			body.push(b.var(id, b.call('$.space_frag', b.id('$$anchor'))), ...state.init);
			close = b.stmt(b.call('$.close', b.id('$$anchor'), id));
		} else {
			/** @type {(is_text: boolean) => import('estree').Expression} */
			const expression = (is_text) =>
				is_text ? b.call('$.child_frag', id, b.true) : b.call('$.child_frag', id);

			process_children(trimmed, expression, false, { ...context, state });

			const use_comment_template = state.template.length === 1 && state.template[0] === '<!>';

			if (use_comment_template) {
				// special case — we can use `$.comment` instead of creating a unique template
				body.push(b.var(id, b.call('$.comment', b.id('$$anchor'))));
			} else {
				state.hoisted.push(
					b.var(
						template_name,
						b.call(
							get_template_function(namespace, state),
							b.template([b.quasi(state.template.join(''), true)], []),
							b.true
						)
					)
				);

				body.push(
					b.var(
						id,
						b.call(
							'$.open_frag',
							b.id('$$anchor'),
							b.literal(!state.metadata.context.template_needs_import_node),
							template_name
						)
					)
				);
			}

			body.push(...state.init);

			close = b.stmt(b.call('$.close_frag', b.id('$$anchor'), id));
		}
	} else {
		body.push(...state.init);
	}

	if (state.update.length > 0 || state.update_effects.length > 0) {
		/** @type {import('estree').Statement | undefined} */
		let update;

		if (state.update_effects.length > 0) {
			for (const render of state.update_effects) {
				if (!update) {
					update = render;
				}
				body.push(render);
			}
		}
		if (state.update.length > 0) {
			const render = serialize_render_stmt(state, body);
			if (!update) {
				update = render;
			}
			body.push(render);
		}

		/** @type {import('estree').Statement} */ (update).leadingComments = [
			{
				type: 'Block',
				value: ` Update `
			}
		];
	}

	body.push(...state.after_update);

	if (close !== undefined) {
		// It's important that close is the last statement in the block, as any previous statements
		// could contain element insertions into the template, which the close statement needs to
		// know of when constructing the list of current inner elements.
		body.push(close);
	}

	if (body[0]) {
		body[0].leadingComments = [
			{
				type: 'Block',
				value: ` Init `
			}
		];
	}

	return body;
}

/**
 *
 * @param {import('#compiler').Namespace} namespace
 * @param {import('../types.js').ComponentClientTransformState} state
 * @returns
 */
function get_template_function(namespace, state) {
	const contains_script_tag = state.metadata.context.template_contains_script_tag;
	return namespace === 'svg'
		? contains_script_tag
			? '$.svg_template_with_script'
			: '$.svg_template'
		: contains_script_tag
			? '$.template_with_script'
			: '$.template';
}

/**
 *
 * @param {import('../types.js').ComponentClientTransformState} state
 * @param {import('estree').Statement[]} body
 */
function serialize_render_stmt(state, body) {
	let render;
	if (state.update.length === 1 && state.update[0].singular) {
		render = state.update[0].singular;
	} else {
		render = b.stmt(
			b.call(
				'$.render_effect',
				b.thunk(
					b.block(
						state.update.map((n) => {
							if (n.init) {
								body.push(n.init);
							}
							return n.grouped;
						})
					)
				)
			)
		);
	}
	return render;
}

/**
 * Serializes the event handler function of the `on:` directive
 * @param {Pick<import('#compiler').OnDirective, 'name' | 'modifiers' | 'expression'>} node
 * @param {import('../types.js').ComponentContext} context
 */
function serialize_event_handler(node, { state, visit }) {
	if (node.expression) {
		let handler = node.expression;

		// Event handlers can be dynamic (source/store/prop/conditional etc)
		const dynamic_handler = () =>
			b.function(
				null,
				[b.rest(b.id('$$args'))],
				b.block([
					b.const('$$callback', /** @type {import('estree').Expression} */ (visit(handler))),
					b.return(
						b.call(b.member(b.id('$$callback'), b.id('apply'), false, true), b.this, b.id('$$args'))
					)
				])
			);

		if (handler.type === 'Identifier' || handler.type === 'MemberExpression') {
			const id = object(handler);
			const binding = id === null ? null : state.scope.get(id.name);
			if (
				binding !== null &&
				(binding.kind === 'state' ||
					binding.kind === 'frozen_state' ||
					binding.kind === 'legacy_reactive' ||
					binding.kind === 'derived' ||
					binding.kind === 'prop' ||
					binding.kind === 'store_sub')
			) {
				handler = dynamic_handler();
			} else {
				handler = /** @type {import('estree').Expression} */ (visit(handler));
			}
		} else if (handler.type === 'ConditionalExpression' || handler.type === 'LogicalExpression') {
			handler = dynamic_handler();
		} else {
			handler = /** @type {import('estree').Expression} */ (visit(handler));
		}

		if (node.modifiers.includes('stopPropagation')) {
			handler = b.call('$.stopPropagation', handler);
		}
		if (node.modifiers.includes('stopImmediatePropagation')) {
			handler = b.call('$.stopImmediatePropagation', handler);
		}
		if (node.modifiers.includes('preventDefault')) {
			handler = b.call('$.preventDefault', handler);
		}
		if (node.modifiers.includes('self')) {
			handler = b.call('$.self', handler);
		}
		if (node.modifiers.includes('trusted')) {
			handler = b.call('$.trusted', handler);
		}

		return handler;
	} else {
		// Function + .call to preserve "this" context as much as possible
		return b.function(
			null,
			[b.id('$$arg')],
			b.block([b.stmt(b.call('$.bubble_event.call', b.this, b.id('$$props'), b.id('$$arg')))])
		);
	}
}

/**
 * Serializes an event handler function of the `on:` directive or an attribute starting with `on`
 * @param {{name: string; modifiers: string[]; expression: import('estree').Expression | null; delegated?: import('#compiler').DelegatedEvent | null; }} node
 * @param {import('../types.js').ComponentContext} context
 */
function serialize_event(node, context) {
	const state = context.state;

	if (node.expression) {
		let handler = serialize_event_handler(node, context);
		const event_name = node.name;
		const delegated = node.delegated;

		if (delegated != null) {
			let delegated_assignment;

			if (!state.events.has(event_name)) {
				state.events.add(event_name);
			}
			// Hoist function if we can, otherwise we leave the function as is
			if (delegated.type === 'hoistable') {
				if (delegated.function === node.expression) {
					const func_name = context.state.scope.root.unique('on_' + event_name);
					state.hoisted.push(b.var(func_name, handler));
					handler = func_name;
				}
				if (node.modifiers.includes('once')) {
					handler = b.call('$.once', handler);
				}
				const hoistable_params = /** @type {import('estree').Expression[]} */ (
					delegated.function.metadata.hoistable_params
				);
				// When we hoist a function we assign an array with the function and all
				// hoisted closure params.
				const args = [handler, ...hoistable_params];
				delegated_assignment = b.array(args);
			} else {
				if (node.modifiers.includes('once')) {
					handler = b.call('$.once', handler);
				}
				delegated_assignment = handler;
			}

			state.after_update.push(
				b.stmt(
					b.assignment(
						'=',
						b.member(context.state.node, b.id('__' + event_name)),
						delegated_assignment
					)
				)
			);
			return;
		}

		if (node.modifiers.includes('once')) {
			handler = b.call('$.once', handler);
		}

		const args = [
			b.literal(event_name),
			context.state.node,
			handler,
			b.literal(node.modifiers.includes('capture'))
		];

		if (node.modifiers.includes('passive')) {
			args.push(b.literal(true));
		} else if (node.modifiers.includes('nonpassive')) {
			args.push(b.literal(false));
		} else if (PassiveEvents.includes(node.name)) {
			args.push(b.literal(true));
		}

		// Events need to run in order with bindings/actions
		state.after_update.push(b.stmt(b.call('$.event', ...args)));
	} else {
		state.after_update.push(
			b.stmt(
				b.call('$.event', b.literal(node.name), state.node, serialize_event_handler(node, context))
			)
		);
	}
}

/**
 * @param {import('#compiler').Attribute & { value: [import('#compiler').ExpressionTag] }} node
 * @param {import('../types').ComponentContext} context
 */
function serialize_event_attribute(node, context) {
	/** @type {string[]} */
	const modifiers = [];

	let event_name = node.name.slice(2);
	if (
		event_name.endsWith('capture') &&
		event_name !== 'ongotpointercapture' &&
		event_name !== 'onlostpointercapture'
	) {
		event_name = event_name.slice(0, -7);
		modifiers.push('capture');
	}

	serialize_event(
		{
			name: event_name,
			expression: node.value[0].expression,
			modifiers,
			delegated: node.metadata.delegated
		},
		context
	);
}

/**
 * Processes an array of template nodes, joining sibling text/expression nodes
 * (e.g. `{a} b {c}`) into a single update function. Along the way it creates
 * corresponding template node references these updates are applied to.
 * @param {import('#compiler').SvelteNode[]} nodes
 * @param {(is_text: boolean) => import('estree').Expression} expression
 * @param {boolean} is_element
 * @param {import('../types.js').ComponentContext} context
 */
function process_children(nodes, expression, is_element, { visit, state }) {
	const within_bound_contenteditable = state.metadata.bound_contenteditable;

	/** @typedef {Array<import('#compiler').Text | import('#compiler').ExpressionTag>} Sequence */

	/** @type {Sequence} */
	let sequence = [];

	/**
	 * @param {Sequence} sequence
	 */
	function flush_sequence(sequence) {
		if (sequence.length === 1) {
			const node = sequence[0];

			if (node.type === 'Text') {
				let prev = expression;
				expression = () => b.call('$.sibling', prev(true));
				state.template.push(node.raw);
				return;
			}

			state.template.push(' ');

			const text_id = get_node_id(b.call('$.space', expression(true)), state, 'text');

			const singular = b.stmt(
				b.call(
					'$.text_effect',
					text_id,
					b.thunk(/** @type {import('estree').Expression} */ (visit(node.expression)))
				)
			);

			if (node.metadata.contains_call_expression && !within_bound_contenteditable) {
				state.update_effects.push(singular);
			} else if (node.metadata.dynamic && !within_bound_contenteditable) {
				state.update.push({
					singular,
					grouped: b.stmt(
						b.call(
							'$.text',
							text_id,
							/** @type {import('estree').Expression} */ (visit(node.expression))
						)
					)
				});
			} else {
				state.init.push(
					b.stmt(
						b.assignment(
							'=',
							b.member(text_id, b.id('nodeValue')),
							b.call(
								'$.stringify',
								/** @type {import('estree').Expression} */ (visit(node.expression))
							)
						)
					)
				);
			}

			expression = (is_text) =>
				is_text ? b.call('$.sibling', text_id, b.true) : b.call('$.sibling', text_id);
		} else {
			const text_id = get_node_id(expression(true), state, 'text');

			state.template.push(' ');

			const contains_call_expression = sequence.some(
				(n) => n.type === 'ExpressionTag' && n.metadata.contains_call_expression
			);
			const assignment = serialize_template_literal(sequence, visit, state)[1];
			const init = b.stmt(b.assignment('=', b.member(text_id, b.id('nodeValue')), assignment));
			const singular = b.stmt(b.call('$.text_effect', text_id, b.thunk(assignment)));

			if (contains_call_expression && !within_bound_contenteditable) {
				state.update_effects.push(singular);
			} else if (
				sequence.some((node) => node.type === 'ExpressionTag' && node.metadata.dynamic) &&
				!within_bound_contenteditable
			) {
				state.update.push({
					singular,
					grouped: b.stmt(b.call('$.text', text_id, assignment))
				});
			} else {
				state.init.push(init);
			}

			expression = (is_text) =>
				is_text ? b.call('$.sibling', text_id, b.true) : b.call('$.sibling', text_id);
		}
	}

	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];

		if (node.type === 'Text' || node.type === 'ExpressionTag') {
			sequence.push(node);
		} else {
			if (sequence.length > 0) {
				flush_sequence(sequence);
				sequence = [];
			}

			if (
				node.type === 'SvelteHead' ||
				node.type === 'TitleElement' ||
				node.type === 'SnippetBlock'
			) {
				// These nodes do not contribute to the sibling/child tree
				// TODO what about e.g. ConstTag and all the other things that
				// get hoisted inside clean_nodes?
				visit(node, state);
			} else {
				if (node.type === 'EachBlock' && nodes.length === 1 && is_element) {
					node.metadata.is_controlled = true;
					visit(node, state);
				} else {
					const id = get_node_id(
						expression(false),
						state,
						node.type === 'RegularElement' ? node.name : 'node'
					);

					expression = (is_text) =>
						is_text ? b.call('$.sibling', id, b.true) : b.call('$.sibling', id);

					visit(node, {
						...state,
						node: id
					});
				}
			}
		}
	}

	if (sequence.length > 0) {
		flush_sequence(sequence);
	}
}

/**
 * @param {import('estree').Expression} expression
 * @param {import('../types.js').ComponentClientTransformState} state
 * @param {string} name
 */
function get_node_id(expression, state, name) {
	let id = expression;

	if (id.type !== 'Identifier') {
		id = b.id(state.scope.generate(name));

		state.init.push(b.var(id, expression));
	}
	return id;
}

/**
 * @param {true | Array<import('#compiler').Text | import('#compiler').ExpressionTag>} attribute_value
 * @param {import('../types').ComponentContext} context
 * @returns {[boolean, import('estree').Expression]}
 */
function serialize_attribute_value(attribute_value, context) {
	let contains_call_expression = false;

	if (attribute_value === true) {
		return [contains_call_expression, b.literal(true)];
	}

	if (attribute_value.length === 0) {
		return [contains_call_expression, b.literal('')]; // is this even possible?
	}

	if (attribute_value.length === 1) {
		const value = attribute_value[0];
		if (value.type === 'Text') {
			return [contains_call_expression, b.literal(value.data)];
		} else {
			if (value.type === 'ExpressionTag') {
				contains_call_expression = value.metadata.contains_call_expression;
			}
			return [
				contains_call_expression,
				/** @type {import('estree').Expression} */ (context.visit(value.expression))
			];
		}
	}

	return serialize_template_literal(attribute_value, context.visit, context.state);
}

/**
 * @param {Array<import('#compiler').Text | import('#compiler').ExpressionTag>} values
 * @param {(node: import('#compiler').SvelteNode) => any} visit
 * @param {import('../types.js').ComponentClientTransformState} state
 * @returns {[boolean, import('estree').TemplateLiteral]}
 */
function serialize_template_literal(values, visit, state) {
	/** @type {import('estree').TemplateElement[]} */
	const quasis = [];

	/** @type {import('estree').Expression[]} */
	const expressions = [];
	const scope = state.scope;
	let contains_call_expression = false;
	quasis.push(b.quasi(''));

	for (let i = 0; i < values.length; i++) {
		const node = values[i];
		if (node.type === 'Text') {
			const last = /** @type {import('estree').TemplateElement} */ (quasis.at(-1));
			last.value.raw += sanitize_template_string(node.data);
		} else if (node.type === 'ExpressionTag' && node.expression.type === 'Literal') {
			const last = /** @type {import('estree').TemplateElement} */ (quasis.at(-1));
			if (node.expression.value != null) {
				last.value.raw += sanitize_template_string(node.expression.value + '');
			}
		} else {
			if (node.type === 'ExpressionTag' && node.metadata.contains_call_expression) {
				contains_call_expression = true;
			}

			expressions.push(b.call('$.stringify', visit(node.expression)));
			quasis.push(b.quasi('', i + 1 === values.length));
		}
	}

	return [contains_call_expression, b.template(quasis, expressions)];
}

/** @type {import('../types').ComponentVisitors} */
export const template_visitors = {
	Fragment(node, context) {
		const body = create_block(node, 'frag', node.nodes, context);
		return b.block(body);
	},
	Comment(node, context) {
		// We'll only get here if comments are not filtered out, which they are unless preserveComments is true
		context.state.template.push(`<!--${node.data}-->`);
	},
	HtmlTag(node, context) {
		context.state.template.push('<!>');

		// push into init, so that bindings run afterwards, which might trigger another run and override hydration
		context.state.init.push(
			b.stmt(
				b.call(
					'$.html',
					context.state.node,
					b.thunk(/** @type {import('estree').Expression} */ (context.visit(node.expression))),
					b.literal(context.state.metadata.namespace === 'svg')
				)
			)
		);
	},
	ConstTag(node, { state, visit }) {
		const declaration = node.declaration.declarations[0];
		// TODO we can almost certainly share some code with $derived(...)
		if (declaration.id.type === 'Identifier') {
			state.init.push(
				b.const(
					declaration.id,
					b.call(
						'$.derived',
						b.thunk(/** @type {import('estree').Expression} */ (visit(declaration.init)))
					)
				)
			);
		} else {
			const identifiers = extract_identifiers(declaration.id);
			const tmp = b.id(state.scope.generate('computed_const'));

			// Make all identifiers that are declared within the following computed regular
			// variables, as they are not signals in that context yet
			for (const node of identifiers) {
				const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(node.name));
				binding.expression = node;
			}

			// TODO optimise the simple `{ x } = y` case — we can just return `y`
			// instead of destructuring it only to return a new object
			const fn = b.arrow(
				[],
				b.block([
					b.const(
						/** @type {import('estree').Pattern} */ (visit(declaration.id)),
						/** @type {import('estree').Expression} */ (visit(declaration.init))
					),
					b.return(b.object(identifiers.map((node) => b.prop('init', node, node))))
				])
			);

			state.init.push(b.const(tmp, b.call('$.derived', fn)));

			for (const node of identifiers) {
				const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(node.name));
				binding.expression = b.member(b.call('$.get', tmp), node);
			}
		}
	},
	DebugTag(node, { state, visit }) {
		state.init.push(
			b.stmt(
				b.call(
					'$.render_effect',
					b.thunk(
						b.block([
							b.stmt(
								b.call(
									'console.log',
									b.object(
										node.identifiers.map((identifier) =>
											b.prop(
												'init',
												identifier,
												/** @type {import('estree').Expression} */ (visit(identifier))
											)
										)
									)
								)
							),
							b.debugger
						])
					)
				)
			)
		);
	},
	RenderTag(node, context) {
		context.state.template.push('<!>');
		const binding = context.state.scope.get(node.expression.name);
		const is_reactive = binding?.kind !== 'normal' || node.expression.type !== 'Identifier';

		/** @type {import('estree').Expression[]} */
		const args = [context.state.node];
		for (const arg of node.arguments) {
			args.push(b.thunk(/** @type {import('estree').Expression} */ (context.visit(arg))));
		}

		let snippet_function = /** @type {import('estree').Expression} */ (
			context.visit(node.expression)
		);
		if (context.state.options.dev) {
			snippet_function = b.call('$.validate_snippet', snippet_function);
		}

		if (is_reactive) {
			context.state.after_update.push(
				b.stmt(b.call('$.snippet_effect', b.thunk(snippet_function), ...args))
			);
		} else {
			context.state.after_update.push(b.stmt(b.call(snippet_function, ...args)));
		}
	},
	AnimateDirective(node, { state, visit }) {
		const expression =
			node.expression === null
				? b.literal(null)
				: b.thunk(/** @type {import('estree').Expression} */ (visit(node.expression)));

		state.init.push(
			b.stmt(
				b.call(
					'$.animate',
					state.node,
					b.thunk(
						/** @type {import('estree').Expression} */ (visit(parse_directive_name(node.name)))
					),
					expression
				)
			)
		);
	},
	ClassDirective(node, { state, next }) {
		error(node, 'INTERNAL', 'Node should have been handled elsewhere');
	},
	StyleDirective(node, { state, next }) {
		error(node, 'INTERNAL', 'Node should have been handled elsewhere');
	},
	TransitionDirective(node, { state, visit }) {
		const type = node.intro && node.outro ? '$.transition' : node.intro ? '$.in' : '$.out';
		const expression =
			node.expression === null
				? b.literal(null)
				: b.thunk(/** @type {import('estree').Expression} */ (visit(node.expression)));

		state.init.push(
			b.stmt(
				b.call(
					type,
					state.node,
					b.thunk(
						/** @type {import('estree').Expression} */ (visit(parse_directive_name(node.name)))
					),
					expression,
					node.modifiers.includes('global') ? b.true : b.false
				)
			)
		);
	},
	RegularElement(node, context) {
		if (node.name === 'noscript') {
			context.state.template.push('<!>');
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

		/** @type {Array<import('#compiler').Attribute | import('#compiler').SpreadAttribute>} */
		const attributes = [];

		/** @type {import('#compiler').ClassDirective[]} */
		const class_directives = [];

		/** @type {import('#compiler').StyleDirective[]} */
		const style_directives = [];

		/** @type {import('estree').ExpressionStatement[]} */
		const lets = [];

		const is_custom_element = is_custom_element_node(node);
		let needs_input_reset = false;
		let needs_content_reset = false;

		/** @type {import('#compiler').BindDirective | null} */
		let value_binding = null;

		/** If true, needs `__value` for inputs */
		let needs_special_value_handling = node.name === 'option' || node.name === 'select';
		let is_content_editable = false;
		let has_content_editable_binding = false;

		if (is_custom_element) {
			// cloneNode is faster, but it does not instantiate the underlying class of the
			// custom element until the template is connected to the dom, which would
			// cause problems when setting properties on the custom element.
			// Therefore we need to use importNode instead, which doesn't have this caveat.
			metadata.context.template_needs_import_node = true;
		}

		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				attributes.push(attribute);
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
			} else if (attribute.type === 'ClassDirective') {
				class_directives.push(attribute);
			} else if (attribute.type === 'StyleDirective') {
				style_directives.push(attribute);
			} else if (attribute.type === 'LetDirective') {
				lets.push(/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute)));
			} else {
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
				}
				context.visit(attribute);
			}
		}

		if (child_metadata.namespace === 'foreign') {
			// input/select etc could mean something completely different in foreign namespace, so don't special-case them
			needs_content_reset = false;
			needs_input_reset = false;
			needs_special_value_handling = false;
			value_binding = null;
		}

		if (is_content_editable && has_content_editable_binding) {
			child_metadata.bound_contenteditable = true;
		}

		if (needs_input_reset && (node.name === 'input' || node.name === 'select')) {
			context.state.init.push(b.stmt(b.call('$.remove_input_attr_defaults', context.state.node)));
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
			const spread_id = serialize_element_spread_attributes(attributes, context, node, node_id);
			if (child_metadata.namespace !== 'foreign') {
				add_select_to_spread_update(spread_id, node, context, node_id);
			}
			is_attributes_reactive = spread_id !== null;
		} else {
			for (const attribute of /** @type {import('#compiler').Attribute[]} */ (attributes)) {
				if (is_event_attribute(attribute)) {
					serialize_event_attribute(attribute, context);
					continue;
				}

				if (needs_special_value_handling && attribute.name === 'value') {
					serialize_element_special_value_attribute(node.name, node_id, attribute, context);
					continue;
				}

				if (
					attribute.name !== 'autofocus' &&
					(attribute.value === true || is_text_attribute(attribute))
				) {
					const name = get_attribute_name(node, attribute, context);
					const literal_value = /** @type {import('estree').Literal} */ (
						serialize_attribute_value(attribute.value, context)[1]
					).value;
					if (name !== 'class' || literal_value) {
						// TODO namespace=foreign probably doesn't want to do template stuff at all and instead use programmatic methods
						// to create the elements it needs.
						context.state.template.push(
							` ${attribute.name}${
								DOMBooleanAttributes.includes(name) && literal_value === true
									? ''
									: `="${literal_value === true ? '' : escape_html(String(literal_value), true)}"`
							}`
						);
						continue;
					}
				}

				const is =
					is_custom_element && child_metadata.namespace !== 'foreign'
						? serialize_custom_element_attribute_update_assignment(node_id, attribute, context)
						: serialize_element_attribute_update_assignment(node, node_id, attribute, context);
				if (is) is_attributes_reactive = true;
			}
		}

		// class/style directives must be applied last since they could override class/style attributes
		serialize_class_directives(class_directives, node_id, context, is_attributes_reactive);
		serialize_style_directives(style_directives, node_id, context, is_attributes_reactive);

		context.state.template.push('>');

		/** @type {import('../types').ComponentClientTransformState} */
		const state = {
			...context.state,
			metadata: child_metadata,
			scope: /** @type {import('../../../scope').Scope} */ (
				context.state.scopes.get(node.fragment)
			),
			preserve_whitespace:
				context.state.preserve_whitespace ||
				((node.name === 'pre' || node.name === 'textarea') &&
					child_metadata.namespace !== 'foreign')
		};

		const { hoisted, trimmed } = clean_nodes(
			node,
			node.fragment.nodes,
			context.path,
			child_metadata.namespace,
			state.preserve_whitespace,
			state.options.preserveComments
		);

		for (const node of hoisted) {
			context.visit(node, state);
		}

		process_children(
			trimmed,
			() =>
				b.call(
					'$.child',
					node.name === 'template'
						? b.member(context.state.node, b.id('content'))
						: context.state.node
				),
			true,
			{ ...context, state }
		);

		if (!VoidElements.includes(node.name)) {
			context.state.template.push(`</${node.name}>`);
		}
	},
	SvelteElement(node, context) {
		context.state.template.push(`<!>`);

		/** @type {Array<import('#compiler').Attribute | import('#compiler').SpreadAttribute>} */
		const attributes = [];

		/** @type {import('#compiler').ClassDirective[]} */
		const class_directives = [];

		/** @type {import('#compiler').StyleDirective[]} */
		const style_directives = [];

		/** @type {import('estree').ExpressionStatement[]} */
		const lets = [];

		// Create a temporary context which picks up the init/update statements.
		// They'll then be added to the function parameter of $.element
		const element_id = b.id(context.state.scope.generate('$$element'));

		/** @type {import('../types').ComponentContext} */
		const inner_context = {
			...context,
			state: {
				...context.state,
				node: element_id,
				init: [],
				update: [],
				update_effects: [],
				after_update: []
			}
		};

		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				attributes.push(attribute);
			} else if (attribute.type === 'SpreadAttribute') {
				attributes.push(attribute);
			} else if (attribute.type === 'ClassDirective') {
				class_directives.push(attribute);
			} else if (attribute.type === 'StyleDirective') {
				style_directives.push(attribute);
			} else if (attribute.type === 'LetDirective') {
				lets.push(/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute)));
			} else {
				context.visit(attribute, inner_context.state);
			}
		}

		// Let bindings first, they can be used on attributes
		context.state.init.push(...lets); // create computeds in the outer context; the dynamic element is the single child of this slot

		// Then do attributes
		// Always use spread because we don't know whether the element is a custom element or not,
		// therefore we need to do the "how to set an attribute" logic at runtime.
		const is_attributes_reactive =
			serialize_dynamic_element_attributes(attributes, inner_context, element_id) !== null;

		// class/style directives must be applied last since they could override class/style attributes
		serialize_class_directives(class_directives, element_id, inner_context, is_attributes_reactive);
		serialize_style_directives(style_directives, element_id, inner_context, is_attributes_reactive);

		const get_tag = b.thunk(/** @type {import('estree').Expression} */ (context.visit(node.tag)));

		if (context.state.options.dev && context.state.metadata.namespace !== 'foreign') {
			if (node.fragment.nodes.length > 0) {
				context.state.init.push(b.stmt(b.call('$.validate_void_dynamic_element', get_tag)));
			}
			context.state.init.push(b.stmt(b.call('$.validate_dynamic_element_tag', get_tag)));
		}

		/** @type {import('estree').Statement[]} */
		const inner = inner_context.state.init;
		if (inner_context.state.update.length > 0 || inner_context.state.update_effects.length > 0) {
			if (inner_context.state.update_effects.length > 0) {
				for (const render of inner_context.state.update_effects) {
					inner.push(render);
				}
			}
			if (inner_context.state.update.length > 0) {
				inner.push(serialize_render_stmt(inner_context.state, inner));
			}
		}
		inner.push(...inner_context.state.after_update);
		inner.push(
			...create_block(node, 'dynamic_element', node.fragment.nodes, {
				...context,
				state: {
					...context.state,
					metadata: {
						...context.state.metadata,
						namespace: determine_namespace_for_children(node, context.state.metadata.namespace)
					}
				}
			})
		);
		context.state.after_update.push(
			b.stmt(
				b.call(
					'$.element',
					context.state.node,
					get_tag,
					node.metadata.svg === true
						? b.true
						: node.metadata.svg === false
							? b.false
							: b.literal(null),
					inner.length === 0
						? /** @type {any} */ (undefined)
						: b.arrow([element_id, b.id('$$anchor')], b.block(inner))
				)
			)
		);
	},
	EachBlock(node, context) {
		const each_node_meta = node.metadata;
		const collection = /** @type {import('estree').Expression} */ (context.visit(node.expression));
		let each_item_is_reactive = true;

		if (!each_node_meta.is_controlled) {
			context.state.template.push('<!>');
		}

		if (each_node_meta.array_name !== null) {
			context.state.init.push(b.const(each_node_meta.array_name, b.thunk(collection)));
		}

		// The runtime needs to know what kind of each block this is in order to optimize for the
		// key === item (we avoid extra allocations). In that case, the item doesn't need to be reactive.
		// We can guarantee this by knowing that in order for the item of the each block to change, they
		// would need to mutate the key/item directly in the array. Given that in runes mode we use ===
		// equality, we can apply a fast-path (as long as the index isn't reactive).
		let each_type = 0;

		if (
			node.key &&
			(node.key.type !== 'Identifier' || !node.index || node.key.name !== node.index)
		) {
			each_type |= EACH_KEYED;
			// If there's a destructuring, then we likely need the generated $$index
			if (node.index || node.context.type !== 'Identifier') {
				each_type |= EACH_INDEX_REACTIVE;
			}
			if (
				context.state.analysis.runes &&
				node.key.type === 'Identifier' &&
				node.context.type === 'Identifier' &&
				node.context.name === node.key.name &&
				(each_type & EACH_INDEX_REACTIVE) === 0
			) {
				// Fast-path for when the key === item
				each_item_is_reactive = false;
			} else {
				each_type |= EACH_ITEM_REACTIVE;
			}
		} else {
			each_type |= EACH_ITEM_REACTIVE;
		}

		if (each_node_meta.is_controlled) {
			each_type |= EACH_IS_CONTROLLED;
		}

		if (context.state.analysis.runes) {
			each_type |= EACH_IS_STRICT_EQUALS;
		}

		// Find the parent each blocks which contain the arrays to invalidate
		// TODO decide how much of this we want to keep for runes mode. For now we're bailing out below
		const indirect_dependencies = collect_parent_each_blocks(context).flatMap((block) => {
			const array = /** @type {import('estree').Expression} */ (context.visit(block.expression));
			const transitive_dependencies = serialize_transitive_dependencies(
				block.metadata.references,
				context
			);
			return [array, ...transitive_dependencies];
		});
		if (each_node_meta.array_name) {
			indirect_dependencies.push(b.call(each_node_meta.array_name));
		} else {
			indirect_dependencies.push(collection);
			const transitive_dependencies = serialize_transitive_dependencies(
				each_node_meta.references,
				context
			);
			indirect_dependencies.push(...transitive_dependencies);
		}

		/**
		 * @param {import('estree').Pattern} expression_for_id
		 * @returns {import('#compiler').Binding['mutation']}
		 */
		const create_mutation = (expression_for_id) => {
			return (assignment, context) => {
				if (assignment.left.type !== 'Identifier' && assignment.left.type !== 'MemberExpression') {
					// serialize_set_binding turns other patterns into IIFEs and separates the assignments
					// into separate expressions, at which point this is called again with an identifier or member expression
					return serialize_set_binding(assignment, context, () => assignment);
				}
				const left = object(assignment.left);
				const value = get_assignment_value(assignment, context);
				const invalidate = b.call(
					'$.invalidate_inner_signals',
					b.thunk(b.sequence(indirect_dependencies))
				);

				if (left === assignment.left) {
					const assign = b.assignment('=', expression_for_id, value);
					return context.state.analysis.runes ? assign : b.sequence([assign, invalidate]);
				} else {
					const original_left = /** @type {import('estree').MemberExpression} */ (assignment.left);
					const left = context.visit(original_left);
					const assign = b.assignment(assignment.operator, left, value);
					return context.state.analysis.runes ? assign : b.sequence([assign, invalidate]);
				}
			};
		};

		// We need to generate a unique identifier in case there's a bind:group below
		// which needs a reference to the index
		const index =
			each_node_meta.contains_group_binding || !node.index
				? each_node_meta.index
				: b.id(node.index);
		const item = each_node_meta.item;
		const binding = /** @type {import('#compiler').Binding} */ (context.state.scope.get(item.name));
		binding.expression = (id) => {
			const item_with_loc = with_loc(item, id);
			return each_item_is_reactive ? b.call('$.unwrap', item_with_loc) : item_with_loc;
		};
		if (node.index) {
			const index_binding = /** @type {import('#compiler').Binding} */ (
				context.state.scope.get(node.index)
			);
			index_binding.expression = (id) => {
				const index_with_loc = with_loc(index, id);
				return each_item_is_reactive ? b.call('$.unwrap', index_with_loc) : index_with_loc;
			};
		}

		/** @type {import('estree').Statement[]} */
		const declarations = [];

		if (node.context.type === 'Identifier') {
			binding.mutation = create_mutation(
				b.member(
					each_node_meta.array_name ? b.call(each_node_meta.array_name) : collection,
					index,
					true
				)
			);
		} else {
			const unwrapped = binding.expression(binding.node);
			const paths = extract_paths(node.context);

			for (const path of paths) {
				const name = /** @type {import('estree').Identifier} */ (path.node).name;
				const binding = /** @type {import('#compiler').Binding} */ (context.state.scope.get(name));
				declarations.push(
					b.let(
						path.node,
						b.thunk(
							/** @type {import('estree').Expression} */ (
								context.visit(path.expression?.(unwrapped))
							)
						)
					)
				);

				// we need to eagerly evaluate the expression in order to hit any
				// 'Cannot access x before initialization' errors
				if (context.state.options.dev) {
					declarations.push(b.stmt(b.call(name)));
				}

				binding.expression = b.call(name);
				binding.mutation = create_mutation(
					/** @type {import('estree').Pattern} */ (path.update_expression(unwrapped))
				);
			}
		}

		// TODO should use context.visit?
		const children = create_block(node, 'each_block', node.body.nodes, context);

		const else_block = node.fallback
			? b.arrow(
					[b.id('$$anchor')],
					/** @type {import('estree').BlockStatement} */ (context.visit(node.fallback))
				)
			: b.literal(null);
		const key_function = node.key
			? b.arrow(
					[node.context.type === 'Identifier' ? node.context : b.id('$$item'), index],
					b.block(
						declarations.concat(
							b.return(/** @type {import('estree').Expression} */ (context.visit(node.key)))
						)
					)
				)
			: b.literal(null);

		if (node.index && each_node_meta.contains_group_binding) {
			// We needed to create a unique identifier for the index above, but we want to use the
			// original index name in the template, therefore create another binding
			declarations.push(b.let(node.index, index));
		}

		if ((each_type & EACH_KEYED) !== 0) {
			if (context.state.options.dev && key_function.type !== 'Literal') {
				context.state.init.push(
					b.stmt(b.call('$.validate_each_keys', b.thunk(collection), key_function))
				);
			}

			context.state.after_update.push(
				b.stmt(
					b.call(
						'$.each_keyed',
						context.state.node,
						each_node_meta.array_name ? each_node_meta.array_name : b.thunk(collection),
						b.literal(each_type),
						key_function,
						b.arrow([b.id('$$anchor'), item, index], b.block(declarations.concat(children))),
						else_block
					)
				)
			);
		} else {
			context.state.after_update.push(
				b.stmt(
					b.call(
						'$.each_indexed',
						context.state.node,
						each_node_meta.array_name ? each_node_meta.array_name : b.thunk(collection),
						b.literal(each_type),
						b.arrow([b.id('$$anchor'), item, index], b.block(declarations.concat(children))),
						else_block
					)
				)
			);
		}
	},
	IfBlock(node, context) {
		context.state.template.push('<!>');

		const consequent = /** @type {import('estree').BlockStatement} */ (
			context.visit(node.consequent)
		);

		context.state.after_update.push(
			b.stmt(
				b.call(
					'$.if',
					context.state.node,
					b.thunk(/** @type {import('estree').Expression} */ (context.visit(node.test))),
					b.arrow([b.id('$$anchor')], consequent),
					node.alternate
						? b.arrow(
								[b.id('$$anchor')],
								/** @type {import('estree').BlockStatement} */ (context.visit(node.alternate))
							)
						: b.literal(null)
				)
			)
		);
	},
	AwaitBlock(node, context) {
		context.state.template.push('<!>');

		context.state.after_update.push(
			b.stmt(
				b.call(
					'$.await',
					context.state.node,
					b.thunk(/** @type {import('estree').Expression} */ (context.visit(node.expression))),
					node.pending
						? b.arrow(
								[b.id('$$anchor')],
								/** @type {import('estree').BlockStatement} */ (context.visit(node.pending))
							)
						: b.literal(null),
					node.then
						? b.arrow(
								node.value
									? [
											b.id('$$anchor'),
											/** @type {import('estree').Pattern} */ (context.visit(node.value))
										]
									: [b.id('$$anchor')],
								/** @type {import('estree').BlockStatement} */ (context.visit(node.then))
							)
						: b.literal(null),
					node.catch
						? b.arrow(
								node.error
									? [
											b.id('$$anchor'),
											/** @type {import('estree').Pattern} */ (context.visit(node.error))
										]
									: [b.id('$$anchor')],
								/** @type {import('estree').BlockStatement} */ (context.visit(node.catch))
							)
						: b.literal(null)
				)
			)
		);
	},
	KeyBlock(node, context) {
		context.state.template.push('<!>');
		const key = /** @type {import('estree').Expression} */ (context.visit(node.expression));
		const body = /** @type {import('estree').Expression} */ (context.visit(node.fragment));
		context.state.after_update.push(
			b.stmt(b.call('$.key', context.state.node, b.thunk(key), b.arrow([b.id('$$anchor')], body)))
		);
	},
	SnippetBlock(node, context) {
		// TODO hoist where possible
		/** @type {import('estree').Pattern[]} */
		const args = [b.id('$$anchor')];

		/** @type {import('estree').BlockStatement} */
		let body;

		/** @type {import('estree').Statement[]} */
		const declarations = [];

		for (let i = 0; i < node.parameters.length; i++) {
			const argument = node.parameters[i];

			if (!argument) continue;

			if (argument.type === 'Identifier') {
				args.push({
					type: 'AssignmentPattern',
					left: argument,
					right: b.id('$.noop')
				});
				const binding = /** @type {import('#compiler').Binding} */ (
					context.state.scope.get(argument.name)
				);
				binding.expression = b.call(argument);
				continue;
			}

			let arg_alias = `$$arg${i}`;
			args.push(b.id(arg_alias));

			const paths = extract_paths(argument);

			for (const path of paths) {
				const name = /** @type {import('estree').Identifier} */ (path.node).name;
				const binding = /** @type {import('#compiler').Binding} */ (context.state.scope.get(name));
				declarations.push(
					b.let(
						path.node,
						b.thunk(
							/** @type {import('estree').Expression} */ (
								context.visit(path.expression?.(b.maybe_call(b.id(arg_alias))))
							)
						)
					)
				);

				// we need to eagerly evaluate the expression in order to hit any
				// 'Cannot access x before initialization' errors
				if (context.state.options.dev) {
					declarations.push(b.stmt(b.call(name)));
				}

				binding.expression = b.call(name);
			}
		}

		body = b.block([
			...declarations,
			.../** @type {import('estree').BlockStatement} */ (context.visit(node.body)).body
		]);

		const path = context.path;
		// If we're top-level, then we can create a function for the snippet so that it can be referenced
		// in the props declaration (default value pattern).
		if (path.length === 1 && path[0].type === 'Fragment') {
			context.state.init.push(b.function_declaration(node.expression, args, body));
		} else {
			context.state.init.push(b.const(node.expression, b.arrow(args, body)));
		}
		if (context.state.options.dev) {
			context.state.init.push(b.stmt(b.call('$.add_snippet_symbol', node.expression)));
		}
	},
	FunctionExpression: function_visitor,
	ArrowFunctionExpression: function_visitor,
	FunctionDeclaration(node, context) {
		context.next({ ...context.state, in_constructor: false });
	},
	OnDirective(node, context) {
		serialize_event(node, context);
	},
	UseDirective(node, { state, next, visit }) {
		const params = [b.id('$$node')];

		if (node.expression) {
			params.push(b.id('$$props'));
		}

		/** @type {import('estree').Expression[]} */
		const args = [
			state.node,
			b.arrow(
				params,
				b.call(
					/** @type {import('estree').Expression} */ (visit(parse_directive_name(node.name))),
					...params
				)
			)
		];

		if (node.expression) {
			args.push(b.thunk(/** @type {import('estree').Expression} */ (visit(node.expression))));
		}

		// actions need to run after attribute updates in order with bindings/events
		state.after_update.push(b.stmt(b.call('$.action', ...args)));
		next();
	},
	BindDirective(node, context) {
		const { state, path, visit } = context;
		const expression = node.expression;
		const getter = b.thunk(/** @type {import('estree').Expression} */ (visit(expression)));
		const assignment = b.assignment('=', expression, b.id('$$value'));
		const setter = b.arrow(
			[b.id('$$value')],
			serialize_set_binding(
				assignment,
				context,
				() => /** @type {import('estree').Expression} */ (visit(assignment)),
				{
					skip_proxy_and_freeze: true
				}
			)
		);

		/** @type {import('estree').CallExpression} */
		let call_expr;

		const property = binding_properties[node.name];
		if (property && property.event) {
			call_expr = b.call(
				'$.bind_property',
				b.literal(node.name),
				b.literal(property.event),
				b.literal(property.type ?? 'get'),
				state.node,
				getter,
				setter
			);
		} else {
			// special cases
			switch (node.name) {
				// window
				case 'online':
					call_expr = b.call(`$.bind_online`, setter);
					break;

				case 'scrollX':
				case 'scrollY':
					call_expr = b.call(
						'$.bind_window_scroll',
						b.literal(node.name === 'scrollX' ? 'x' : 'y'),
						getter,
						setter
					);
					break;

				case 'innerWidth':
				case 'innerHeight':
				case 'outerWidth':
				case 'outerHeight':
					call_expr = b.call('$.bind_window_size', b.literal(node.name), setter);
					break;

				// media
				case 'muted':
					call_expr = b.call(`$.bind_muted`, state.node, getter, setter);
					break;
				case 'paused':
					call_expr = b.call(`$.bind_paused`, state.node, getter, setter);
					break;
				case 'volume':
					call_expr = b.call(`$.bind_volume`, state.node, getter, setter);
					break;
				case 'playbackRate':
					call_expr = b.call(`$.bind_playback_rate`, state.node, getter, setter);
					break;
				case 'currentTime':
					call_expr = b.call(`$.bind_current_time`, state.node, getter, setter);
					break;
				case 'buffered':
					call_expr = b.call(`$.bind_buffered`, state.node, setter);
					break;
				case 'played':
					call_expr = b.call(`$.bind_played`, state.node, setter);
					break;
				case 'seekable':
					call_expr = b.call(`$.bind_seekable`, state.node, setter);
					break;
				case 'seeking':
					call_expr = b.call(`$.bind_seeking`, state.node, setter);
					break;
				case 'ended':
					call_expr = b.call(`$.bind_ended`, state.node, setter);
					break;
				case 'readyState':
					call_expr = b.call(`$.bind_ready_state`, state.node, setter);
					break;

				// dimensions
				case 'contentRect':
				case 'contentBoxSize':
				case 'borderBoxSize':
				case 'devicePixelContentBoxSize':
					call_expr = b.call('$.bind_resize_observer', state.node, b.literal(node.name), setter);
					break;

				case 'clientWidth':
				case 'clientHeight':
				case 'offsetWidth':
				case 'offsetHeight':
					call_expr = b.call('$.bind_element_size', state.node, b.literal(node.name), setter);
					break;

				// various
				case 'value': {
					const parent = path.at(-1);
					if (parent?.type === 'RegularElement' && parent.name === 'select') {
						call_expr = b.call(`$.bind_select_value`, state.node, getter, setter);
					} else {
						call_expr = b.call(`$.bind_value`, state.node, getter, setter);
					}
					break;
				}

				case 'this':
					call_expr = b.call(
						`$.bind_this`,
						state.node,
						setter,
						/** @type {import('estree').Expression} */ (
							// if expression is not an identifier, we know it can't be a signal
							expression.type === 'Identifier'
								? expression
								: expression.type === 'MemberExpression' && expression.object.type === 'Identifier'
									? expression.object
									: undefined
						)
					);
					break;
				case 'textContent':
				case 'innerHTML':
				case 'innerText':
					call_expr = b.call(
						'$.bind_content_editable',
						b.literal(node.name),
						state.node,
						getter,
						setter
					);
					break;

				// checkbox/radio
				case 'checked':
					call_expr = b.call(`$.bind_checked`, state.node, getter, setter);
					break;

				case 'group': {
					/** @type {import('estree').CallExpression[]} */
					const indexes = [];
					for (const parent_each_block of node.metadata.parent_each_blocks) {
						indexes.push(b.call('$.unwrap', parent_each_block.metadata.index));
					}

					// We need to additionally invoke the value attribute signal to register it as a dependency,
					// so that when the value is updated, the group binding is updated
					let group_getter = getter;
					const parent = path.at(-1);
					if (parent?.type === 'RegularElement') {
						const value = /** @type {any[]} */ (
							/** @type {import('#compiler').Attribute} */ (
								parent.attributes.find(
									(a) =>
										a.type === 'Attribute' &&
										a.name === 'value' &&
										!is_text_attribute(a) &&
										a.value !== true
								)
							)?.value
						);
						if (value !== undefined) {
							group_getter = b.thunk(
								b.block([
									b.stmt(serialize_attribute_value(value, context)[1]),
									b.return(/** @type {import('estree').Expression} */ (visit(expression)))
								])
							);
						}
					}

					call_expr = b.call(
						'$.bind_group',
						node.metadata.binding_group_name,
						b.array(indexes),
						state.node,
						group_getter,
						setter
					);
					break;
				}

				default:
					error(node, 'INTERNAL', 'unknown binding ' + node.name);
			}
		}

		// Bindings need to happen after attribute updates, therefore after the render effect, and in order with events/actions.
		// bind:this is a special case as it's one-way and could influence the render effect.
		if (node.name === 'this') {
			state.init.push(b.stmt(call_expr));
		} else {
			state.after_update.push(b.stmt(call_expr));
		}
	},
	Component(node, context) {
		context.state.template.push('<!>');

		const binding = context.state.scope.get(
			node.name.includes('.') ? node.name.slice(0, node.name.indexOf('.')) : node.name
		);
		if (binding !== null && binding.kind !== 'normal') {
			// Handle dynamic references to what seems like static inline components
			const component = serialize_inline_component(node, '$$component', context);
			context.state.after_update.push(
				b.stmt(
					b.call(
						'$.component',
						context.state.node,
						// TODO use untrack here to not update when binding changes?
						// Would align with Svelte 4 behavior, but it's arguably nicer/expected to update this
						b.thunk(
							/** @type {import('estree').Expression} */ (context.visit(b.member_id(node.name)))
						),
						b.arrow([b.id('$$component')], b.block([component]))
					)
				)
			);
			return;
		}
		const component = serialize_inline_component(node, node.name, context);
		context.state.after_update.push(component);
	},
	SvelteSelf(node, context) {
		context.state.template.push('<!>');
		const component = serialize_inline_component(node, context.state.analysis.name, context);
		context.state.after_update.push(component);
	},
	SvelteComponent(node, context) {
		context.state.template.push('<!>');

		let component = serialize_inline_component(node, '$$component', context);
		if (context.state.options.dev) {
			component = b.stmt(b.call('$.validate_dynamic_component', b.thunk(b.block([component]))));
		}
		context.state.after_update.push(
			b.stmt(
				b.call(
					'$.component',
					context.state.node,
					b.thunk(/** @type {import('estree').Expression} */ (context.visit(node.expression))),
					b.arrow([b.id('$$component')], b.block([component]))
				)
			)
		);
	},
	Attribute(node, context) {
		if (is_event_attribute(node)) {
			serialize_event_attribute(node, context);
		}
	},
	LetDirective(node, { state }) {
		// let:x        -->  const x = $.derived(() => $$slotProps.x);
		// let:x={{y, z}}  -->  const derived_x = $.derived(() => { const { y, z } = $$slotProps.x; return { y, z }));
		if (node.expression && node.expression.type !== 'Identifier') {
			const name = state.scope.generate(node.name);
			const bindings = state.scope.get_bindings(node);

			for (const binding of bindings) {
				binding.expression = b.member(b.call('$.get', b.id(name)), b.id(binding.node.name));
			}

			return b.const(
				name,
				b.call(
					'$.derived',
					b.thunk(
						b.block([
							b.let(
								/** @type {import('estree').Expression} */ (node.expression).type ===
									'ObjectExpression'
									? // @ts-expect-error types don't match, but it can't contain spread elements and the structure is otherwise fine
										b.object_pattern(node.expression.properties)
									: // @ts-expect-error types don't match, but it can't contain spread elements and the structure is otherwise fine
										b.array_pattern(node.expression.elements),
								b.member(b.id('$$slotProps'), b.id(node.name))
							),
							b.return(b.object(bindings.map((binding) => b.init(binding.node.name, binding.node))))
						])
					)
				)
			);
		} else {
			const name = node.expression === null ? node.name : node.expression.name;
			return b.const(
				name,
				b.call(
					// in legacy mode, sources can be mutated but they're not fine-grained.
					// Using the safe-equal derived version ensures the slot is still updated
					state.analysis.runes ? '$.derived' : '$.derived_safe_equal',
					b.thunk(b.member(b.id('$$slotProps'), b.id(node.name)))
				)
			);
		}
	},
	SpreadAttribute(node, { visit }) {
		return visit(node.expression);
	},
	SvelteFragment(node, context) {
		/** @type {import('estree').Statement[]} */
		const lets = [];

		for (const attribute of node.attributes) {
			if (attribute.type === 'LetDirective') {
				lets.push(/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute)));
			}
		}

		const state = {
			...context.state,
			// TODO this logic eventually belongs in create_block, when fragments are used everywhere
			scope: /** @type {import('../../../scope').Scope} */ (context.state.scopes.get(node.fragment))
		};

		context.state.init.push(...lets);
		context.state.init.push(
			...create_block(
				node,
				'slot_template',
				/** @type {import('#compiler').SvelteNode[]} */ (node.fragment.nodes),
				{
					...context,
					state
				}
			)
		);
	},
	SlotElement(node, context) {
		// <slot {a}>fallback</slot>  -->   $.slot($$slots.default, { get a() { .. } }, () => ...fallback);
		context.state.template.push('<!>');

		/** @type {import('estree').Property[]} */
		const props = [];

		/** @type {import('estree').Expression[]} */
		const spreads = [];

		/** @type {import('estree').ExpressionStatement[]} */
		const lets = [];

		let is_default = true;

		/** @type {import('estree').Expression} */
		let name = b.literal('default');

		for (const attribute of node.attributes) {
			if (attribute.type === 'SpreadAttribute') {
				spreads.push(
					b.thunk(/** @type {import('estree').Expression} */ (context.visit(attribute)))
				);
			} else if (attribute.type === 'Attribute') {
				const [, value] = serialize_attribute_value(attribute.value, context);
				if (attribute.name === 'name') {
					name = value;
					is_default = false;
				} else if (attribute.name !== 'slot') {
					if (attribute.metadata.dynamic) {
						props.push(b.get(attribute.name, [b.return(value)]));
					} else {
						props.push(b.init(attribute.name, value));
					}
				}
			} else if (attribute.type === 'LetDirective') {
				lets.push(/** @type {import('estree').ExpressionStatement} */ (context.visit(attribute)));
			}
		}

		// Let bindings first, they can be used on attributes
		context.state.init.push(...lets);

		const props_expression =
			spreads.length === 0
				? b.object(props)
				: b.call('$.spread_props', b.object(props), ...spreads);
		const fallback =
			node.fragment.nodes.length === 0
				? b.literal(null)
				: b.arrow(
						[b.id('$$anchor')],
						b.block(create_block(node, 'fallback', node.fragment.nodes, context))
					);

		const expression = is_default
			? b.member(b.id('$$props'), b.id('children'))
			: b.member(b.member(b.id('$$props'), b.id('$$slots')), name, true, true);

		const slot = b.call('$.slot', context.state.node, expression, props_expression, fallback);
		context.state.after_update.push(b.stmt(slot));
	},
	SvelteHead(node, context) {
		// TODO attributes?
		context.state.init.push(
			b.stmt(
				b.call(
					'$.head',
					b.arrow(
						[b.id('$$anchor')],
						b.block(create_block(node, 'head', node.fragment.nodes, context))
					)
				)
			)
		);
	},
	TitleElement(node, { state, visit }) {
		// TODO throw validation error when attributes present / when children something else than text/expression tags
		if (node.fragment.nodes.length === 1 && node.fragment.nodes[0].type === 'Text') {
			state.init.push(
				b.stmt(
					b.assignment(
						'=',
						b.member(b.id('$.document'), b.id('title')),
						b.literal(/** @type {import('#compiler').Text} */ (node.fragment.nodes[0]).data)
					)
				)
			);
		} else {
			state.update.push({
				grouped: b.stmt(
					b.assignment(
						'=',
						b.member(b.id('$.document'), b.id('title')),
						serialize_template_literal(/** @type {any} */ (node.fragment.nodes), visit, state)[1]
					)
				)
			});
		}
	},
	SvelteBody(node, context) {
		context.next({
			...context.state,
			node: b.id('$.document.body')
		});
	},
	SvelteWindow(node, context) {
		context.next({
			...context.state,
			node: b.id('$.window')
		});
	},
	SvelteDocument(node, context) {
		context.next({
			...context.state,
			node: b.id('$.document')
		});
	},
	CallExpression: javascript_visitors_runes.CallExpression
};
