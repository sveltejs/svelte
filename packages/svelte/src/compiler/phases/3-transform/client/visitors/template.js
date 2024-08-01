/** @import { BlockStatement, CallExpression, Expression, ExpressionStatement, Identifier, MemberExpression, ObjectExpression, Pattern, Property, Statement, Super } from 'estree' */
/** @import { Attribute, BindDirective, Binding, ClassDirective, Component, EachBlock, SpreadAttribute, StyleDirective, SvelteComponent, SvelteNode, SvelteSelf, TemplateNode, Text } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext, ComponentVisitors } from '../types.js' */
import is_reference from 'is-reference';
import { walk } from 'zimmerframe';
import {
	EACH_INDEX_REACTIVE,
	EACH_IS_ANIMATED,
	EACH_IS_CONTROLLED,
	EACH_IS_STRICT_EQUALS,
	EACH_ITEM_REACTIVE,
	EACH_KEYED
} from '../../../../../constants.js';
import { dev, is_ignored, locator } from '../../../../state.js';
import {
	extract_paths,
	get_attribute_chunks,
	get_attribute_expression,
	is_event_attribute,
	is_text_attribute,
	object
} from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { binding_properties } from '../../../bindings.js';
import { is_element_node } from '../../../nodes.js';
import { determine_namespace_for_children } from '../../utils.js';
import {
	create_derived,
	create_derived_block_argument,
	get_assignment_value,
	serialize_get_binding,
	serialize_set_binding,
	with_loc
} from '../utils.js';
import { javascript_visitors_runes } from './javascript-runes.js';
import {
	parse_directive_name,
	serialize_event_handler,
	serialize_render_stmt,
	serialize_template_literal,
	serialize_update
} from './shared/utils.js';
import {
	serialize_attribute_value,
	serialize_class_directives,
	serialize_event,
	serialize_event_attribute,
	serialize_style_directives
} from './shared/element.js';

/**
 * @param {Binding[]} references
 * @param {ComponentContext} context
 */
function serialize_transitive_dependencies(references, context) {
	/** @type {Set<Binding>} */
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
 * @param {Binding} binding
 * @param {Set<Binding>} seen
 * @returns {Binding[]}
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
 * Serializes dynamic element attribute assignments.
 * Returns the `true` if spread is deemed reactive.
 * @param {Array<Attribute | SpreadAttribute>} attributes
 * @param {ComponentContext} context
 * @param {Identifier} element_id
 * @returns {boolean}
 */
function serialize_dynamic_element_attributes(attributes, context, element_id) {
	if (attributes.length === 0) {
		if (context.state.analysis.css.hash) {
			context.state.init.push(
				b.stmt(b.call('$.set_class', element_id, b.literal(context.state.analysis.css.hash)))
			);
		}
		return false;
	}

	// TODO why are we always treating this as a spread? needs docs, if that's not an error

	let needs_isolation = false;
	let is_reactive = false;

	/** @type {ObjectExpression['properties']} */
	const values = [];

	for (const attribute of attributes) {
		if (attribute.type === 'Attribute') {
			const [, value] = serialize_attribute_value(attribute.value, context);

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
				values.push(b.init(attribute.name, value));
			}
		} else {
			values.push(b.spread(/** @type {Expression} */ (context.visit(attribute))));
		}

		is_reactive ||=
			attribute.metadata.expression.has_state ||
			// objects could contain reactive getters -> play it safe and always assume spread attributes are reactive
			attribute.type === 'SpreadAttribute';
		needs_isolation ||=
			attribute.type === 'SpreadAttribute' && attribute.metadata.expression.has_call;
	}

	if (needs_isolation || is_reactive) {
		const id = context.state.scope.generate('attributes');
		context.state.init.push(b.let(id));

		const update = b.stmt(
			b.assignment(
				'=',
				b.id(id),
				b.call(
					'$.set_dynamic_element_attributes',
					element_id,
					b.id(id),
					b.object(values),
					b.literal(context.state.analysis.css.hash)
				)
			)
		);

		if (needs_isolation) {
			context.state.init.push(serialize_update(update));
			return false;
		}

		context.state.update.push(update);
		return true;
	}

	context.state.init.push(
		b.stmt(
			b.call(
				'$.set_dynamic_element_attributes',
				element_id,
				b.literal(null),
				b.object(values),
				b.literal(context.state.analysis.css.hash)
			)
		)
	);
	return false;
}

/**
 * @param {ComponentContext} context
 */
function collect_parent_each_blocks(context) {
	return /** @type {EachBlock[]} */ (context.path.filter((node) => node.type === 'EachBlock'));
}

/**
 * @param {Component | SvelteComponent | SvelteSelf} node
 * @param {string} component_name
 * @param {ComponentContext} context
 * @param {Expression} anchor
 * @returns {Statement}
 */
function serialize_inline_component(node, component_name, context, anchor = context.state.node) {
	/** @type {Array<Property[] | Expression>} */
	const props_and_spreads = [];

	/** @type {ExpressionStatement[]} */
	const lets = [];

	/** @type {Record<string, TemplateNode[]>} */
	const children = {};

	/** @type {Record<string, Expression[]>} */
	const events = {};

	/** @type {Property[]} */
	const custom_css_props = [];

	/** @type {Identifier | MemberExpression | null} */
	let bind_this = null;

	/**
	 * @type {ExpressionStatement[]}
	 */
	const binding_initializers = [];

	/**
	 * If this component has a slot property, it is a named slot within another component. In this case
	 * the slot scope applies to the component itself, too, and not just its children.
	 */
	let slot_scope_applies_to_itself = false;

	/**
	 * Components may have a children prop and also have child nodes. In this case, we assume
	 * that the child component isn't using render tags yet and pass the slot as $$slots.default.
	 * We're not doing it for spread attributes, as this would result in too many false positives.
	 */
	let has_children_prop = false;

	/**
	 * @param {Property} prop
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
			lets.push(/** @type {ExpressionStatement} */ (context.visit(attribute)));
		} else if (attribute.type === 'OnDirective') {
			events[attribute.name] ||= [];
			let handler = serialize_event_handler(attribute, null, context);
			if (attribute.modifiers.includes('once')) {
				handler = b.call('$.once', handler);
			}
			events[attribute.name].push(handler);
		} else if (attribute.type === 'SpreadAttribute') {
			const expression = /** @type {Expression} */ (context.visit(attribute));
			if (attribute.metadata.expression.has_state) {
				let value = expression;

				if (attribute.metadata.expression.has_call) {
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

			if (attribute.name === 'children') {
				has_children_prop = true;
			}

			const [, value] = serialize_attribute_value(attribute.value, context);

			if (attribute.metadata.expression.has_state) {
				let arg = value;

				// When we have a non-simple computation, anything other than an Identifier or Member expression,
				// then there's a good chance it needs to be memoized to avoid over-firing when read within the
				// child component.
				const should_wrap_in_derived = get_attribute_chunks(attribute.value).some((n) => {
					return (
						n.type === 'ExpressionTag' &&
						n.expression.type !== 'Identifier' &&
						n.expression.type !== 'MemberExpression'
					);
				});

				if (should_wrap_in_derived) {
					const id = b.id(context.state.scope.generate(attribute.name));
					context.state.init.push(b.var(id, create_derived(context.state, b.thunk(value))));
					arg = b.call('$.get', id);
				}

				push_prop(b.get(attribute.name, [b.return(arg)]));
			} else {
				push_prop(b.init(attribute.name, value));
			}
		} else if (attribute.type === 'BindDirective') {
			const expression = /** @type {Expression} */ (context.visit(attribute.expression));

			if (
				dev &&
				expression.type === 'MemberExpression' &&
				context.state.analysis.runes &&
				!is_ignored(node, 'binding_property_non_reactive')
			) {
				context.state.init.push(serialize_validate_binding(context.state, attribute, expression));
			}

			if (attribute.name === 'this') {
				bind_this = attribute.expression;
			} else {
				if (dev) {
					binding_initializers.push(
						b.stmt(
							b.call(
								b.id('$.add_owner_effect'),
								b.thunk(expression),
								b.id(component_name),
								is_ignored(node, 'ownership_invalid_binding') && b.true
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

	/** @type {Statement[]} */
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
			const attribute = /** @type {Attribute | undefined} */ (
				child.attributes.find(
					(attribute) => attribute.type === 'Attribute' && attribute.name === 'slot'
				)
			);

			if (attribute !== undefined) {
				slot_name = /** @type {Text[]} */ (attribute.value)[0].data;
			}
		}

		(children[slot_name] ||= []).push(child);
	}

	// Serialize each slot
	/** @type {Property[]} */
	const serialized_slots = [];
	for (const slot_name of Object.keys(children)) {
		const block = /** @type {BlockStatement} */ (
			context.visit(
				{
					...node.fragment,
					// @ts-expect-error
					nodes: children[slot_name]
				},
				{
					...context.state,
					scope:
						context.state.scopes.get(slot_name === 'default' ? children[slot_name][0] : node) ??
						context.state.scope
				}
			)
		);

		if (block.body.length === 0) continue;

		const slot_fn = b.arrow(
			[b.id('$$anchor'), b.id('$$slotProps')],
			b.block([
				...(slot_name === 'default' && !slot_scope_applies_to_itself ? lets : []),
				...block.body
			])
		);

		if (slot_name === 'default' && !has_children_prop) {
			if (lets.length === 0 && children.default.every((node) => node.type !== 'SvelteFragment')) {
				// create `children` prop...
				push_prop(
					b.init(
						'children',
						dev ? b.call('$.wrap_snippet', b.id(context.state.analysis.name), slot_fn) : slot_fn
					)
				);

				// and `$$slots.default: true` so that `<slot>` on the child works
				serialized_slots.push(b.init(slot_name, b.true));
			} else {
				// create `$$slots.default`...
				serialized_slots.push(b.init(slot_name, slot_fn));

				// and a `children` prop that errors
				push_prop(b.init('children', b.id('$.invalid_default_snippet')));
			}
		} else {
			serialized_slots.push(b.init(slot_name, slot_fn));
		}
	}

	if (serialized_slots.length > 0) {
		push_prop(b.init('$$slots', b.object(serialized_slots)));
	}

	if (!context.state.analysis.runes) {
		push_prop(b.init('$$legacy', b.true));
	}

	const props_expression =
		props_and_spreads.length === 0 ||
		(props_and_spreads.length === 1 && Array.isArray(props_and_spreads[0]))
			? b.object(/** @type {Property[]} */ (props_and_spreads[0]) || [])
			: b.call(
					'$.spread_props',
					...props_and_spreads.map((p) => (Array.isArray(p) ? b.object(p) : p))
				);

	/** @param {Expression} node_id */
	let fn = (node_id) => {
		return b.call(
			// TODO We can remove this ternary once we remove legacy mode, since in runes mode dynamic components
			// will be handled separately through the `$.component` function, and then the component name will
			// always be referenced through just the identifier here.
			node.type === 'SvelteComponent'
				? component_name
				: /** @type {Expression} */ (context.visit(b.member_id(component_name))),
			node_id,
			props_expression
		);
	};

	if (bind_this !== null) {
		const prev = fn;

		fn = (node_id) => {
			return serialize_bind_this(bind_this, prev(node_id), context);
		};
	}

	const statements = [...snippet_declarations];

	if (node.type === 'SvelteComponent') {
		const prev = fn;

		fn = (node_id) => {
			return b.call(
				'$.component',
				node_id,
				b.thunk(/** @type {Expression} */ (context.visit(node.expression))),
				b.arrow(
					[b.id('$$anchor'), b.id(component_name)],
					b.block([
						...binding_initializers,
						b.stmt(
							dev
								? b.call('$.validate_dynamic_component', b.thunk(prev(b.id('$$anchor'))))
								: prev(b.id('$$anchor'))
						)
					])
				)
			);
		};
	} else {
		statements.push(...binding_initializers);
	}

	if (Object.keys(custom_css_props).length > 0) {
		context.state.template.push(
			context.state.metadata.namespace === 'svg'
				? '<g><!></g>'
				: '<div style="display: contents"><!></div>'
		);

		statements.push(
			b.stmt(b.call('$.css_props', anchor, b.thunk(b.object(custom_css_props)))),
			b.stmt(fn(b.member(anchor, b.id('lastChild')))),
			b.stmt(b.call('$.reset', anchor))
		);
	} else {
		context.state.template.push('<!>');
		statements.push(b.stmt(fn(anchor)));
	}

	return statements.length > 1 ? b.block(statements) : statements[0];
}

/**
 * Serializes `bind:this` for components and elements.
 * @param {Identifier | MemberExpression} expression
 * @param {Expression} value
 * @param {import('zimmerframe').Context<SvelteNode, ComponentClientTransformState>} context
 */
function serialize_bind_this(expression, value, { state, visit }) {
	/** @type {Identifier[]} */
	const ids = [];

	/** @type {Expression[]} */
	const values = [];

	/** @type {typeof state.getters} */
	const getters = {};

	// Pass in each context variables to the get/set functions, so that we can null out old values on teardown.
	// Note that we only do this for each context variables, the consequence is that the value might be stale in
	// some scenarios where the value is a member expression with changing computed parts or using a combination of multiple
	// variables, but that was the same case in Svelte 4, too. Once legacy mode is gone completely, we can revisit this.
	walk(expression, null, {
		Identifier(node, { path }) {
			if (Object.hasOwn(getters, node.name)) return;

			const parent = /** @type {Expression} */ (path.at(-1));
			if (!is_reference(node, parent)) return;

			const binding = state.scope.get(node.name);
			if (!binding) return;

			for (const [owner, scope] of state.scopes) {
				if (owner.type === 'EachBlock' && scope === binding.scope) {
					ids.push(node);
					values.push(/** @type {Expression} */ (visit(node)));
					getters[node.name] = node;
					break;
				}
			}
		}
	});

	const child_state = { ...state, getters: { ...state.getters, ...getters } };

	const get = /** @type {Expression} */ (visit(expression, child_state));
	const set = /** @type {Expression} */ (
		visit(b.assignment('=', expression, b.id('$$value')), child_state)
	);

	// If we're mutating a property, then it might already be non-existent.
	// If we make all the object nodes optional, then it avoids any runtime exceptions.
	/** @type {Expression | Super} */
	let node = get;

	while (node.type === 'MemberExpression') {
		node.optional = true;
		node = node.object;
	}

	return b.call(
		'$.bind_this',
		value,
		b.arrow([b.id('$$value'), ...ids], set),
		b.arrow([...ids], get),
		values.length > 0 && b.thunk(b.array(values))
	);
}

/** @type {ComponentVisitors} */
export const template_visitors = {
	SvelteElement(node, context) {
		context.state.template.push(`<!>`);

		/** @type {Array<Attribute | SpreadAttribute>} */
		const attributes = [];

		/** @type {Attribute['value'] | undefined} */
		let dynamic_namespace = undefined;

		/** @type {ClassDirective[]} */
		const class_directives = [];

		/** @type {StyleDirective[]} */
		const style_directives = [];

		/** @type {ExpressionStatement[]} */
		const lets = [];

		// Create a temporary context which picks up the init/update statements.
		// They'll then be added to the function parameter of $.element
		const element_id = b.id(context.state.scope.generate('$$element'));

		/** @type {ComponentContext} */
		const inner_context = {
			...context,
			state: {
				...context.state,
				node: element_id,
				before_init: [],
				init: [],
				update: [],
				after_update: []
			}
		};

		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				if (attribute.name === 'xmlns' && !is_text_attribute(attribute)) {
					dynamic_namespace = attribute.value;
				}
				attributes.push(attribute);
			} else if (attribute.type === 'SpreadAttribute') {
				attributes.push(attribute);
			} else if (attribute.type === 'ClassDirective') {
				class_directives.push(attribute);
			} else if (attribute.type === 'StyleDirective') {
				style_directives.push(attribute);
			} else if (attribute.type === 'LetDirective') {
				lets.push(/** @type {ExpressionStatement} */ (context.visit(attribute)));
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
		serialize_style_directives(
			style_directives,
			element_id,
			inner_context,
			is_attributes_reactive,
			true
		);

		const get_tag = b.thunk(/** @type {Expression} */ (context.visit(node.tag)));

		if (dev && context.state.metadata.namespace !== 'foreign') {
			if (node.fragment.nodes.length > 0) {
				context.state.init.push(b.stmt(b.call('$.validate_void_dynamic_element', get_tag)));
			}
			context.state.init.push(b.stmt(b.call('$.validate_dynamic_element_tag', get_tag)));
		}

		/** @type {Statement[]} */
		const inner = inner_context.state.init;
		if (inner_context.state.update.length > 0) {
			inner.push(serialize_render_stmt(inner_context.state.update));
		}
		inner.push(...inner_context.state.after_update);
		inner.push(
			.../** @type {BlockStatement} */ (
				context.visit(node.fragment, {
					...context.state,
					metadata: {
						...context.state.metadata,
						namespace: determine_namespace_for_children(node, context.state.metadata.namespace)
					}
				})
			).body
		);

		const location = dev && locator(node.start);

		context.state.init.push(
			b.stmt(
				b.call(
					'$.element',
					context.state.node,
					get_tag,
					node.metadata.svg || node.metadata.mathml ? b.true : b.false,
					inner.length > 0 && b.arrow([element_id, b.id('$$anchor')], b.block(inner)),
					dynamic_namespace && b.thunk(serialize_attribute_value(dynamic_namespace, context)[1]),
					location && b.array([b.literal(location.line), b.literal(location.column)])
				)
			)
		);
	},
	EachBlock(node, context) {
		const each_node_meta = node.metadata;
		const collection = /** @type {Expression} */ (context.visit(node.expression));

		if (!each_node_meta.is_controlled) {
			context.state.template.push('<!>');
		}

		if (each_node_meta.array_name !== null) {
			context.state.init.push(b.const(each_node_meta.array_name, b.thunk(collection)));
		}

		let flags = 0;

		if (node.metadata.keyed) {
			flags |= EACH_KEYED;

			if (node.index) {
				flags |= EACH_INDEX_REACTIVE;
			}

			// In runes mode, if key === item, we don't need to wrap the item in a source
			const key_is_item =
				/** @type {Expression} */ (node.key).type === 'Identifier' &&
				node.context.type === 'Identifier' &&
				node.context.name === node.key.name;

			if (!context.state.analysis.runes || !key_is_item) {
				flags |= EACH_ITEM_REACTIVE;
			}
		} else {
			flags |= EACH_ITEM_REACTIVE;
		}

		// Since `animate:` can only appear on elements that are the sole child of a keyed each block,
		// we can determine at compile time whether the each block is animated or not (in which
		// case it should measure animated elements before and after reconciliation).
		if (
			node.key &&
			node.body.nodes.some((child) => {
				if (child.type !== 'RegularElement' && child.type !== 'SvelteElement') return false;
				return child.attributes.some((attr) => attr.type === 'AnimateDirective');
			})
		) {
			flags |= EACH_IS_ANIMATED;
		}

		if (each_node_meta.is_controlled) {
			flags |= EACH_IS_CONTROLLED;
		}

		if (context.state.analysis.runes) {
			flags |= EACH_IS_STRICT_EQUALS;
		}

		// If the array is a store expression, we need to invalidate it when the array is changed.
		// This doesn't catch all cases, but all the ones that Svelte 4 catches, too.
		let store_to_invalidate = '';
		if (node.expression.type === 'Identifier' || node.expression.type === 'MemberExpression') {
			const id = object(node.expression);
			if (id) {
				const binding = context.state.scope.get(id.name);
				if (binding?.kind === 'store_sub') {
					store_to_invalidate = id.name;
				}
			}
		}

		// Legacy mode: find the parent each blocks which contain the arrays to invalidate
		const indirect_dependencies = collect_parent_each_blocks(context).flatMap((block) => {
			const array = /** @type {Expression} */ (context.visit(block.expression));
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

		const child_state = {
			...context.state,
			getters: { ...context.state.getters }
		};

		/** The state used when generating the key function, if necessary */
		const key_state = {
			...context.state,
			getters: { ...context.state.getters }
		};

		/**
		 * @param {Pattern} expression_for_id
		 * @returns {Binding['mutation']}
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
				const invalidate_store = store_to_invalidate
					? b.call('$.invalidate_store', b.id('$$stores'), b.literal(store_to_invalidate))
					: undefined;

				const sequence = [];
				if (!context.state.analysis.runes) sequence.push(invalidate);
				if (invalidate_store) sequence.push(invalidate_store);

				if (left === assignment.left) {
					const assign = b.assignment('=', expression_for_id, value);
					sequence.unshift(assign);
					return b.sequence(sequence);
				} else {
					const original_left = /** @type {MemberExpression} */ (assignment.left);
					const left = context.visit(original_left);
					const assign = b.assignment(assignment.operator, left, value);
					sequence.unshift(assign);
					return b.sequence(sequence);
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
		const binding = /** @type {Binding} */ (context.state.scope.get(item.name));
		const getter = (/** @type {Identifier} */ id) => {
			const item_with_loc = with_loc(item, id);
			return b.call('$.unwrap', item_with_loc);
		};
		child_state.getters[item.name] = getter;

		if (node.index) {
			child_state.getters[node.index] = (id) => {
				const index_with_loc = with_loc(index, id);
				return (flags & EACH_INDEX_REACTIVE) === 0
					? index_with_loc
					: b.call('$.get', index_with_loc);
			};

			key_state.getters[node.index] = b.id(node.index);
		}

		/** @type {Statement[]} */
		const declarations = [];

		if (node.context.type === 'Identifier') {
			binding.mutation = create_mutation(
				b.member(
					each_node_meta.array_name ? b.call(each_node_meta.array_name) : collection,
					index,
					true
				)
			);

			key_state.getters[node.context.name] = node.context;
		} else {
			const unwrapped = getter(binding.node);
			const paths = extract_paths(node.context);

			for (const path of paths) {
				const name = /** @type {Identifier} */ (path.node).name;
				const binding = /** @type {Binding} */ (context.state.scope.get(name));
				const needs_derived = path.has_default_value; // to ensure that default value is only called once
				const fn = b.thunk(
					/** @type {Expression} */ (context.visit(path.expression?.(unwrapped), child_state))
				);

				declarations.push(
					b.let(path.node, needs_derived ? b.call('$.derived_safe_equal', fn) : fn)
				);

				const getter = needs_derived ? b.call('$.get', b.id(name)) : b.call(name);
				child_state.getters[name] = getter;
				binding.mutation = create_mutation(
					/** @type {Pattern} */ (path.update_expression(unwrapped))
				);

				// we need to eagerly evaluate the expression in order to hit any
				// 'Cannot access x before initialization' errors
				if (dev) {
					declarations.push(b.stmt(getter));
				}

				key_state.getters[name] = path.node;
			}
		}

		const block = /** @type {BlockStatement} */ (context.visit(node.body, child_state));

		/** @type {Expression} */
		let key_function = b.id('$.index');

		if (node.metadata.keyed) {
			const expression = /** @type {Expression} */ (
				context.visit(/** @type {Expression} */ (node.key), key_state)
			);

			key_function = b.arrow([node.context, index], expression);
		}

		if (node.index && each_node_meta.contains_group_binding) {
			// We needed to create a unique identifier for the index above, but we want to use the
			// original index name in the template, therefore create another binding
			declarations.push(b.let(node.index, index));
		}

		if (dev && (flags & EACH_KEYED) !== 0) {
			context.state.init.push(
				b.stmt(b.call('$.validate_each_keys', b.thunk(collection), key_function))
			);
		}

		/** @type {Expression[]} */
		const args = [
			context.state.node,
			b.literal(flags),
			each_node_meta.array_name ? each_node_meta.array_name : b.thunk(collection),
			key_function,
			b.arrow([b.id('$$anchor'), item, index], b.block(declarations.concat(block.body)))
		];

		if (node.fallback) {
			args.push(
				b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.fallback)))
			);
		}

		context.state.init.push(b.stmt(b.call('$.each', ...args)));
	},
	IfBlock(node, context) {
		context.state.template.push('<!>');

		const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));

		const args = [
			context.state.node,
			b.thunk(/** @type {Expression} */ (context.visit(node.test))),
			b.arrow([b.id('$$anchor')], consequent)
		];

		if (node.alternate || node.elseif) {
			args.push(
				node.alternate
					? b.arrow(
							[b.id('$$anchor')],
							/** @type {BlockStatement} */ (context.visit(node.alternate))
						)
					: b.literal(null)
			);
		}

		if (node.elseif) {
			// We treat this...
			//
			//   {#if x}
			//     ...
			//   {:else}
			//     {#if y}
			//       <div transition:foo>...</div>
			//     {/if}
			//   {/if}
			//
			// ...slightly differently to this...
			//
			//   {#if x}
			//     ...
			//   {:else if y}
			//     <div transition:foo>...</div>
			//   {/if}
			//
			// ...even though they're logically equivalent. In the first case, the
			// transition will only play when `y` changes, but in the second it
			// should play when `x` or `y` change — both are considered 'local'
			args.push(b.literal(true));
		}

		context.state.init.push(b.stmt(b.call('$.if', ...args)));
	},
	AwaitBlock(node, context) {
		context.state.template.push('<!>');

		let then_block;
		let catch_block;

		if (node.then) {
			/** @type {Pattern[]} */
			const args = [b.id('$$anchor')];
			const block = /** @type {BlockStatement} */ (context.visit(node.then));

			if (node.value) {
				const argument = create_derived_block_argument(node.value, context);

				args.push(argument.id);

				if (argument.declarations !== null) {
					block.body.unshift(...argument.declarations);
				}
			}

			then_block = b.arrow(args, block);
		}

		if (node.catch) {
			/** @type {Pattern[]} */
			const args = [b.id('$$anchor')];
			const block = /** @type {BlockStatement} */ (context.visit(node.catch));

			if (node.error) {
				const argument = create_derived_block_argument(node.error, context);

				args.push(argument.id);

				if (argument.declarations !== null) {
					block.body.unshift(...argument.declarations);
				}
			}

			catch_block = b.arrow(args, block);
		}

		context.state.init.push(
			b.stmt(
				b.call(
					'$.await',
					context.state.node,
					b.thunk(/** @type {Expression} */ (context.visit(node.expression))),
					node.pending
						? b.arrow(
								[b.id('$$anchor')],
								/** @type {BlockStatement} */ (context.visit(node.pending))
							)
						: b.literal(null),
					then_block,
					catch_block
				)
			)
		);
	},
	KeyBlock(node, context) {
		context.state.template.push('<!>');
		const key = /** @type {Expression} */ (context.visit(node.expression));
		const body = /** @type {Expression} */ (context.visit(node.fragment));
		context.state.init.push(
			b.stmt(b.call('$.key', context.state.node, b.thunk(key), b.arrow([b.id('$$anchor')], body)))
		);
	},
	SnippetBlock(node, context) {
		// TODO hoist where possible
		/** @type {Pattern[]} */
		const args = [b.id('$$anchor')];

		/** @type {BlockStatement} */
		let body;

		/** @type {Statement[]} */
		const declarations = [];

		const getters = { ...context.state.getters };
		const child_state = { ...context.state, getters };

		for (let i = 0; i < node.parameters.length; i++) {
			const argument = node.parameters[i];

			if (!argument) continue;

			if (argument.type === 'Identifier') {
				args.push({
					type: 'AssignmentPattern',
					left: argument,
					right: b.id('$.noop')
				});

				getters[argument.name] = b.call(argument);
				continue;
			}

			let arg_alias = `$$arg${i}`;
			args.push(b.id(arg_alias));

			const paths = extract_paths(argument);

			for (const path of paths) {
				const name = /** @type {Identifier} */ (path.node).name;
				const needs_derived = path.has_default_value; // to ensure that default value is only called once
				const fn = b.thunk(
					/** @type {Expression} */ (
						context.visit(path.expression?.(b.maybe_call(b.id(arg_alias))))
					)
				);

				declarations.push(
					b.let(path.node, needs_derived ? b.call('$.derived_safe_equal', fn) : fn)
				);

				getters[name] = needs_derived ? b.call('$.get', b.id(name)) : b.call(name);

				// we need to eagerly evaluate the expression in order to hit any
				// 'Cannot access x before initialization' errors
				if (dev) {
					declarations.push(b.stmt(getters[name]));
				}
			}
		}

		body = b.block([
			...declarations,
			.../** @type {BlockStatement} */ (context.visit(node.body, child_state)).body
		]);

		/** @type {Expression} */
		let snippet = b.arrow(args, body);

		if (dev) {
			snippet = b.call('$.wrap_snippet', b.id(context.state.analysis.name), snippet);
		}

		const declaration = b.const(node.expression, snippet);

		// Top-level snippets are hoisted so they can be referenced in the `<script>`
		if (context.path.length === 1 && context.path[0].type === 'Fragment') {
			context.state.analysis.top_level_snippets.push(declaration);
		} else {
			context.state.init.push(declaration);
		}
	},
	OnDirective(node, context) {
		serialize_event(node, node.metadata.expression, context);
	},
	UseDirective(node, { state, next, visit }) {
		const params = [b.id('$$node')];

		if (node.expression) {
			params.push(b.id('$$action_arg'));
		}

		/** @type {Expression[]} */
		const args = [
			state.node,
			b.arrow(
				params,
				b.call(/** @type {Expression} */ (visit(parse_directive_name(node.name))), ...params)
			)
		];

		if (node.expression) {
			args.push(b.thunk(/** @type {Expression} */ (visit(node.expression))));
		}

		// actions need to run after attribute updates in order with bindings/events
		state.after_update.push(b.stmt(b.call('$.action', ...args)));
		next();
	},
	BindDirective(node, context) {
		const { state, path, visit } = context;
		const expression = node.expression;
		const property = binding_properties[node.name];

		if (
			expression.type === 'MemberExpression' &&
			(node.name !== 'this' ||
				path.some(
					({ type }) =>
						type === 'IfBlock' ||
						type === 'EachBlock' ||
						type === 'AwaitBlock' ||
						type === 'KeyBlock'
				)) &&
			dev &&
			context.state.analysis.runes &&
			!is_ignored(node, 'binding_property_non_reactive')
		) {
			context.state.init.push(
				serialize_validate_binding(
					context.state,
					node,
					/**@type {MemberExpression} */ (visit(expression))
				)
			);
		}

		const getter = b.thunk(/** @type {Expression} */ (visit(expression)));
		const assignment = b.assignment('=', expression, b.id('$$value'));
		const setter = b.arrow(
			[b.id('$$value')],
			serialize_set_binding(
				assignment,
				context,
				() => /** @type {Expression} */ (visit(assignment)),
				null,
				{
					skip_proxy_and_freeze: true
				}
			)
		);

		/** @type {CallExpression} */
		let call_expr;

		if (property?.event) {
			call_expr = b.call(
				'$.bind_property',
				b.literal(node.name),
				b.literal(property.event),
				state.node,
				setter,
				property.bidirectional && getter
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

				// document
				case 'activeElement':
					call_expr = b.call('$.bind_active_element', setter);
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

				case 'files':
					call_expr = b.call(`$.bind_files`, state.node, getter, setter);
					break;

				case 'this':
					call_expr = serialize_bind_this(node.expression, state.node, context);
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
				case 'focused':
					call_expr = b.call(`$.bind_focused`, state.node, setter);
					break;
				case 'group': {
					const indexes = node.metadata.parent_each_blocks.map((each) => {
						// if we have a keyed block with an index, the index is wrapped in a source
						return each.metadata.keyed && each.index
							? b.call('$.get', each.metadata.index)
							: each.metadata.index;
					});

					// We need to additionally invoke the value attribute signal to register it as a dependency,
					// so that when the value is updated, the group binding is updated
					let group_getter = getter;
					const parent = path.at(-1);
					if (parent?.type === 'RegularElement') {
						const value = /** @type {any[]} */ (
							/** @type {Attribute} */ (
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
									b.return(/** @type {Expression} */ (visit(expression)))
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
					throw new Error('unknown binding ' + node.name);
			}
		}

		const parent = /** @type {import('#compiler').SvelteNode} */ (context.path.at(-1));

		// Bindings need to happen after attribute updates, therefore after the render effect, and in order with events/actions.
		// bind:this is a special case as it's one-way and could influence the render effect.
		if (node.name === 'this') {
			state.init.push(b.stmt(call_expr));
		} else {
			const has_action_directive =
				parent.type === 'RegularElement' &&
				parent.attributes.find((a) => a.type === 'UseDirective');
			state.after_update.push(
				b.stmt(has_action_directive ? b.call('$.effect', b.thunk(call_expr)) : call_expr)
			);
		}
	},
	Component(node, context) {
		if (node.metadata.dynamic) {
			// Handle dynamic references to what seems like static inline components
			const component = serialize_inline_component(node, '$$component', context, b.id('$$anchor'));
			context.state.init.push(
				b.stmt(
					b.call(
						'$.component',
						context.state.node,
						// TODO use untrack here to not update when binding changes?
						// Would align with Svelte 4 behavior, but it's arguably nicer/expected to update this
						b.thunk(/** @type {Expression} */ (context.visit(b.member_id(node.name)))),
						b.arrow([b.id('$$anchor'), b.id('$$component')], b.block([component]))
					)
				)
			);
			return;
		}

		const component = serialize_inline_component(node, node.name, context);
		context.state.init.push(component);
	},
	SvelteSelf(node, context) {
		const component = serialize_inline_component(node, context.state.analysis.name, context);
		context.state.init.push(component);
	},
	SvelteComponent(node, context) {
		let component = serialize_inline_component(node, '$$component', context);

		context.state.init.push(component);
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
				state.getters[binding.node.name] = b.member(
					b.call('$.get', b.id(name)),
					b.id(binding.node.name)
				);
			}

			return b.const(
				name,
				b.call(
					'$.derived',
					b.thunk(
						b.block([
							b.let(
								/** @type {Expression} */ (node.expression).type === 'ObjectExpression'
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
				create_derived(state, b.thunk(b.member(b.id('$$slotProps'), b.id(node.name))))
			);
		}
	},
	SpreadAttribute(node, { visit }) {
		return visit(node.expression);
	},
	SvelteFragment(node, context) {
		/** @type {Statement[]} */
		const lets = [];

		for (const attribute of node.attributes) {
			if (attribute.type === 'LetDirective') {
				lets.push(/** @type {ExpressionStatement} */ (context.visit(attribute)));
			}
		}

		context.state.init.push(...lets);
		context.state.init.push(.../** @type {BlockStatement} */ (context.visit(node.fragment)).body);
	},
	SlotElement(node, context) {
		// <slot {a}>fallback</slot>  -->   $.slot($$slots.default, { get a() { .. } }, () => ...fallback);
		context.state.template.push('<!>');

		/** @type {Property[]} */
		const props = [];

		/** @type {Expression[]} */
		const spreads = [];

		/** @type {ExpressionStatement[]} */
		const lets = [];

		let is_default = true;

		/** @type {Expression} */
		let name = b.literal('default');

		for (const attribute of node.attributes) {
			if (attribute.type === 'SpreadAttribute') {
				spreads.push(b.thunk(/** @type {Expression} */ (context.visit(attribute))));
			} else if (attribute.type === 'Attribute') {
				const [, value] = serialize_attribute_value(attribute.value, context);
				if (attribute.name === 'name') {
					name = value;
					is_default = false;
				} else if (attribute.name !== 'slot') {
					if (attribute.metadata.expression.has_state) {
						props.push(b.get(attribute.name, [b.return(value)]));
					} else {
						props.push(b.init(attribute.name, value));
					}
				}
			} else if (attribute.type === 'LetDirective') {
				lets.push(/** @type {ExpressionStatement} */ (context.visit(attribute)));
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
				: b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.fragment)));

		const expression = is_default
			? b.call('$.default_slot', b.id('$$props'))
			: b.member(b.member(b.id('$$props'), b.id('$$slots')), name, true, true);

		const slot = b.call('$.slot', context.state.node, expression, props_expression, fallback);
		context.state.init.push(b.stmt(slot));
	},
	SvelteHead(node, context) {
		// TODO attributes?
		context.state.init.push(
			b.stmt(
				b.call(
					'$.head',
					b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.fragment)))
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
						b.literal(/** @type {Text} */ (node.fragment.nodes[0]).data)
					)
				)
			);
		} else {
			state.update.push(
				b.stmt(
					b.assignment(
						'=',
						b.member(b.id('$.document'), b.id('title')),
						serialize_template_literal(/** @type {any} */ (node.fragment.nodes), visit, state)[1]
					)
				)
			);
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
	CallExpression: javascript_visitors_runes.CallExpression,
	VariableDeclaration: javascript_visitors_runes.VariableDeclaration
};

/**
 * @param {ComponentClientTransformState} state
 * @param {BindDirective} binding
 * @param {MemberExpression} expression
 */
function serialize_validate_binding(state, binding, expression) {
	const string = state.analysis.source.slice(binding.start, binding.end);

	const get_object = b.thunk(/** @type {Expression} */ (expression.object));
	const get_property = b.thunk(
		/** @type {Expression} */ (
			expression.computed
				? expression.property
				: b.literal(/** @type {Identifier} */ (expression.property).name)
		)
	);

	const loc = locator(binding.start);

	return b.stmt(
		b.call(
			'$.validate_binding',
			b.literal(string),
			get_object,
			get_property,
			loc && b.literal(loc.line),
			loc && b.literal(loc.column)
		)
	);
}
