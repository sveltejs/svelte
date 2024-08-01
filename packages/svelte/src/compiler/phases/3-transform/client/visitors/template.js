/** @import { BlockStatement, Expression, ExpressionStatement, Identifier, MemberExpression, Property, Statement } from 'estree' */
/** @import { Attribute, Component, SvelteComponent, SvelteSelf, TemplateNode, Text } from '#compiler' */
/** @import { ComponentContext, ComponentVisitors } from '../types.js' */
import { dev, is_ignored } from '../../../../state.js';
import { get_attribute_chunks, is_event_attribute } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { is_element_node } from '../../../nodes.js';
import { create_derived, serialize_set_binding } from '../utils.js';
import { javascript_visitors_runes } from './javascript-runes.js';
import {
	serialize_bind_this,
	serialize_event_handler,
	serialize_template_literal,
	serialize_validate_binding
} from './shared/utils.js';
import { serialize_attribute_value, serialize_event_attribute } from './shared/element.js';

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

/** @type {ComponentVisitors} */
export const template_visitors = {
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
