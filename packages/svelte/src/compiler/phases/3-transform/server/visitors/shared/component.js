/** @import { BlockStatement, Expression, Pattern, Property, SequenceExpression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../../types.js' */
import {
	empty_comment,
	build_attribute_value,
	create_async_block,
	PromiseOptimiser
} from './utils.js';
import * as b from '#compiler/builders';
import { is_element_node } from '../../../../nodes.js';
import { dev } from '../../../../../state.js';

/**
 * @param {AST.Component | AST.SvelteComponent | AST.SvelteSelf} node
 * @param {Expression} expression
 * @param {ComponentContext} context
 */
export function build_inline_component(node, expression, context) {
	/** @type {Array<Property[] | Expression>} */
	const props_and_spreads = [];
	/** @type {Array<() => void>} */
	const delayed_props = [];

	/** @type {Property[]} */
	const custom_css_props = [];

	/** @type {Record<string, AST.LetDirective[]>} */
	const lets = { default: [] };

	/**
	 * Children in the default slot are evaluated in the component scope,
	 * children in named slots are evaluated in the parent scope
	 */
	const child_state = {
		...context.state,
		scope: node.metadata.scopes.default
	};

	/** @type {Record<string, AST.TemplateNode[]>} */
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
	 * @param {boolean} [delay]
	 */
	function push_prop(prop, delay = false) {
		const do_push = () => {
			const current = props_and_spreads.at(-1);
			const current_is_props = Array.isArray(current);
			const props = current_is_props ? current : [];
			props.push(prop);
			if (!current_is_props) {
				props_and_spreads.push(props);
			}
		};

		if (delay) {
			delayed_props.push(do_push);
		} else {
			do_push();
		}
	}

	const optimiser = new PromiseOptimiser();

	for (const attribute of node.attributes) {
		if (attribute.type === 'LetDirective') {
			if (!slot_scope_applies_to_itself) {
				lets.default.push(attribute);
			}
		} else if (attribute.type === 'SpreadAttribute') {
			let expression = /** @type {Expression} */ (context.visit(attribute));
			props_and_spreads.push(optimiser.transform(expression, attribute.metadata.expression));
		} else if (attribute.type === 'Attribute') {
			const value = build_attribute_value(
				attribute.value,
				context,
				optimiser.transform,
				false,
				true
			);

			if (attribute.name.startsWith('--')) {
				custom_css_props.push(b.init(attribute.name, value));
				continue;
			}

			if (attribute.name === 'children') {
				has_children_prop = true;
			}

			push_prop(b.prop('init', b.key(attribute.name), value));
		} else if (attribute.type === 'BindDirective' && attribute.name !== 'this') {
			// Bindings are a bit special: we don't want to add them to (async) deriveds but we need to check if they have blockers
			optimiser.check_blockers(attribute.metadata.expression);

			if (attribute.expression.type === 'SequenceExpression') {
				const [get, set] = /** @type {SequenceExpression} */ (context.visit(attribute.expression))
					.expressions;
				const get_id = b.id(context.state.scope.generate('bind_get'));
				const set_id = b.id(context.state.scope.generate('bind_set'));

				context.state.init.push(b.var(get_id, get));
				context.state.init.push(b.var(set_id, set));

				push_prop(b.get(attribute.name, [b.return(b.call(get_id))]));
				push_prop(b.set(attribute.name, [b.stmt(b.call(set_id, b.id('$$value')))]));
			} else {
				// Delay prop pushes so bindings come at the end, to avoid spreads overwriting them
				push_prop(
					b.get(attribute.name, [
						b.return(/** @type {Expression} */ (context.visit(attribute.expression)))
					]),
					true
				);

				push_prop(
					b.set(attribute.name, [
						b.stmt(
							/** @type {Expression} */ (
								context.visit(b.assignment('=', attribute.expression, b.id('$$value')))
							)
						),
						b.stmt(b.assignment('=', b.id('$$settled'), b.false))
					]),
					true
				);
			}
		}
	}

	delayed_props.forEach((fn) => fn());

	/** @type {Statement[]} */
	const snippet_declarations = [];

	/** @type {Property[]} */
	const serialized_slots = [];

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

			// Interop: allows people to pass snippets when component still uses slots
			serialized_slots.push(
				b.init(child.expression.name === 'children' ? 'default' : child.expression.name, b.true)
			);

			continue;
		}

		let slot_name = 'default';
		if (is_element_node(child)) {
			const slot = /** @type {AST.Attribute | undefined} */ (
				child.attributes.find(
					(attribute) => attribute.type === 'Attribute' && attribute.name === 'slot'
				)
			);

			if (slot !== undefined) {
				slot_name = /** @type {AST.Text[]} */ (slot.value)[0].data;

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
		const params = [b.id('$$renderer')];

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

		const slot_fn = b.arrow(
			params,
			node.fragment.metadata.has_await
				? b.block([create_async_block(b.block(block.body))])
				: b.block(block.body)
		);

		if (slot_name === 'default' && !has_children_prop) {
			if (
				lets.default.length === 0 &&
				children.default.every(
					(node) =>
						node.type !== 'SvelteFragment' ||
						!node.attributes.some((attr) => attr.type === 'LetDirective')
				)
			) {
				// create `children` prop...
				push_prop(
					b.prop(
						'init',
						b.id('children'),
						dev ? b.call('$.prevent_snippet_stringification', slot_fn) : slot_fn
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
			b.id('$$renderer'),
			props_expression
		)
	);

	if (snippet_declarations.length > 0) {
		statement = b.block([...snippet_declarations, statement]);
	}

	const dynamic =
		node.type === 'SvelteComponent' || (node.type === 'Component' && node.metadata.dynamic);

	if (custom_css_props.length > 0) {
		statement = b.stmt(
			b.call(
				'$.css_props',
				b.id('$$renderer'),
				b.literal(context.state.namespace === 'svg' ? false : true),
				b.object(custom_css_props),
				b.thunk(b.block([statement])),
				dynamic && b.true
			)
		);
	}

	const is_async = optimiser.is_async();

	if (is_async) {
		statement = create_async_block(
			b.block([optimiser.apply(), statement]),
			optimiser.blockers(),
			optimiser.has_await
		);
	}

	if (dynamic && custom_css_props.length === 0) {
		context.state.template.push(empty_comment);
	}

	context.state.template.push(statement);

	if (
		!is_async &&
		!context.state.skip_hydration_boundaries &&
		custom_css_props.length === 0 &&
		optimiser.expressions.length === 0
	) {
		context.state.template.push(empty_comment);
	}
}
