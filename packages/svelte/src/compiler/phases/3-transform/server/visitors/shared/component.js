/** @import { BlockStatement, Expression, Pattern, Property, Statement } from 'estree' */
/** @import { Attribute, Component, LetDirective, SvelteComponent, SvelteSelf, TemplateNode, Text } from '#compiler' */
/** @import { ComponentContext } from '../../types.js' */
import { empty_comment, build_attribute_value } from './utils.js';
import * as b from '../../../../../utils/builders.js';
import { is_element_node } from '../../../../nodes.js';

/**
 * @param {Component | SvelteComponent | SvelteSelf} node
 * @param {Expression} expression
 * @param {ComponentContext} context
 */
export function build_inline_component(node, expression, context) {
	/** @type {Array<Property[] | Expression>} */
	const props_and_spreads = [];

	/** @type {Property[]} */
	const custom_css_props = [];

	/** @type {Record<string, LetDirective[]>} */
	const lets = { default: [] };

	/**
	 * Children in the default slot are evaluated in the component scope,
	 * children in named slots are evaluated in the parent scope
	 */
	const child_state = {
		...context.state,
		scope: node.metadata.scopes.default
	};

	/** @type {Record<string, TemplateNode[]>} */
	const children = {};

	/**
	 * If this component has a slot property, it is a named slot within another component. In this case
	 * the slot scope applies to the component itself, too, and not just its children.
	 */
	const slot_scope_applies_to_itself = node.attributes.some(
		(node) => node.type === 'Attribute' && node.name === 'slot'
	);

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
			if (!slot_scope_applies_to_itself) {
				lets.default.push(attribute);
			}
		} else if (attribute.type === 'SpreadAttribute') {
			props_and_spreads.push(/** @type {Expression} */ (context.visit(attribute)));
		} else if (attribute.type === 'Attribute') {
			if (attribute.name.startsWith('--')) {
				const value = build_attribute_value(attribute.value, context, false, true);
				custom_css_props.push(b.init(attribute.name, value));
				continue;
			}

			if (attribute.name === 'children') {
				has_children_prop = true;
			}

			const value = build_attribute_value(attribute.value, context, false, true);
			push_prop(b.prop('init', b.key(attribute.name), value));
		} else if (attribute.type === 'BindDirective' && attribute.name !== 'this') {
			// TODO this needs to turn the whole thing into a while loop because the binding could be mutated eagerly in the child
			push_prop(
				b.get(attribute.name, [
					b.return(/** @type {Expression} */ (context.visit(attribute.expression)))
				])
			);
			push_prop(
				b.set(attribute.name, [
					b.stmt(
						/** @type {Expression} */ (
							context.visit(b.assignment('=', attribute.expression, b.id('$$value')))
						)
					),
					b.stmt(b.assignment('=', b.id('$$settled'), b.false))
				])
			);
		}
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
			const slot = /** @type {Attribute | undefined} */ (
				child.attributes.find(
					(attribute) => attribute.type === 'Attribute' && attribute.name === 'slot'
				)
			);

			if (slot !== undefined) {
				slot_name = /** @type {Text[]} */ (slot.value)[0].data;

				lets[slot_name] = child.attributes.filter((attribute) => attribute.type === 'LetDirective');
			} else if (child.type === 'SvelteFragment') {
				lets.default.push(
					...child.attributes.filter((attribute) => attribute.type === 'LetDirective')
				);
			}
		}

		children[slot_name] = children[slot_name] || [];
		children[slot_name].push(child);
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
				slot_name === 'default'
					? child_state
					: {
							...context.state,
							scope: node.metadata.scopes[slot_name]
						}
			)
		);

		if (block.body.length === 0) continue;

		/** @type {Pattern[]} */
		const params = [b.id('$$payload')];

		if (lets[slot_name].length > 0) {
			const pattern = b.object_pattern(
				lets[slot_name].map((node) => {
					if (node.expression === null) {
						return b.init(node.name, b.id(node.name));
					}

					if (node.expression.type === 'ObjectExpression') {
						// @ts-expect-error it gets parsed as an `ObjectExpression` but is really an `ObjectPattern`
						return b.init(node.name, b.object_pattern(node.expression.properties));
					}

					if (node.expression.type === 'ArrayExpression') {
						// @ts-expect-error it gets parsed as an `ArrayExpression` but is really an `ArrayPattern`
						return b.init(node.name, b.array_pattern(node.expression.elements));
					}

					return b.init(node.name, node.expression);
				})
			);

			params.push(pattern);
		}

		const slot_fn = b.arrow(params, b.block(block.body));

		if (slot_name === 'default' && !has_children_prop) {
			if (
				lets.default.length === 0 &&
				children.default.every((node) => node.type !== 'SvelteFragment')
			) {
				// create `children` prop...
				push_prop(b.prop('init', b.id('children'), slot_fn));

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
		push_prop(b.prop('init', b.id('$$slots'), b.object(serialized_slots)));
	}

	const props_expression =
		props_and_spreads.length === 0 ||
		(props_and_spreads.length === 1 && Array.isArray(props_and_spreads[0]))
			? b.object(/** @type {Property[]} */ (props_and_spreads[0] || []))
			: b.call(
					'$.spread_props',
					b.array(props_and_spreads.map((p) => (Array.isArray(p) ? b.object(p) : p)))
				);

	/** @type {Statement} */
	let statement = b.stmt(
		(node.type === 'SvelteComponent' ? b.maybe_call : b.call)(
			expression,
			b.id('$$payload'),
			props_expression
		)
	);

	if (snippet_declarations.length > 0) {
		statement = b.block([...snippet_declarations, statement]);
	}

	const dynamic =
		node.type === 'SvelteComponent' || (node.type === 'Component' && node.metadata.dynamic);

	if (custom_css_props.length > 0) {
		context.state.template.push(
			b.stmt(
				b.call(
					'$.css_props',
					b.id('$$payload'),
					b.literal(context.state.namespace === 'svg' ? false : true),
					b.object(custom_css_props),
					b.thunk(b.block([statement])),
					dynamic && b.true
				)
			)
		);
	} else {
		if (dynamic) {
			context.state.template.push(empty_comment);
		}

		context.state.template.push(statement);

		if (!context.state.skip_hydration_boundaries) {
			context.state.template.push(empty_comment);
		}
	}
}
