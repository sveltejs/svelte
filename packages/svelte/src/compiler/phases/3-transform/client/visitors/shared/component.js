/** @import { BlockStatement, Expression, ExpressionStatement, Identifier, MemberExpression, Pattern, Property, SequenceExpression, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../../types.js' */
import { dev, is_ignored } from '../../../../../state.js';
import { get_attribute_chunks, object } from '../../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { add_svelte_meta, build_bind_this, Memoizer, validate_binding } from '../shared/utils.js';
import { build_attribute_value } from '../shared/element.js';
import { build_event_handler } from './events.js';
import { determine_slot } from '../../../../../utils/slot.js';

/**
 * @param {AST.Component | AST.SvelteComponent | AST.SvelteSelf} node
 * @param {string} component_name
 * @param {ComponentContext} context
 * @returns {Statement}
 */
export function build_component(node, component_name, context) {
	/** @type {Expression} */
	const anchor = context.state.node;

	/** @type {Array<Property[] | Expression>} */
	const props_and_spreads = [];

	/** @type {Array<() => void>} */
	const delayed_props = [];

	/** @type {ExpressionStatement[]} */
	const lets = [];

	/** @type {Record<string, typeof context.state>} */
	const states = {
		default: {
			...context.state,
			scope: node.metadata.scopes.default,
			transform: { ...context.state.transform }
		}
	};

	/** @type {Record<string, AST.TemplateNode[]>} */
	const children = {};

	/** @type {Record<string, Expression[]>} */
	const events = {};

	const memoizer = new Memoizer();

	/** @type {Property[]} */
	const custom_css_props = [];

	/** @type {Identifier | MemberExpression | SequenceExpression | null} */
	let bind_this = null;

	/** @type {ExpressionStatement[]} */
	const binding_initializers = [];

	const is_component_dynamic =
		node.type === 'SvelteComponent' || (node.type === 'Component' && node.metadata.dynamic);

	// The variable name used for the component inside $.component()
	const intermediate_name =
		node.type === 'Component' && node.metadata.dynamic
			? context.state.scope.generate(node.name)
			: '$$component';

	/**
	 * If this component has a slot property, it is a named slot within another component. In this case
	 * the slot scope applies to the component itself, too, and not just its children.
	 */
	let slot_scope_applies_to_itself = !!determine_slot(node);

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

	if (slot_scope_applies_to_itself) {
		for (const attribute of node.attributes) {
			if (attribute.type === 'LetDirective') {
				context.visit(attribute, { ...context.state, let_directives: lets });
			}
		}
	}

	for (const attribute of node.attributes) {
		if (attribute.type === 'LetDirective') {
			if (!slot_scope_applies_to_itself) {
				context.visit(attribute, { ...states.default, let_directives: lets });
			}
		} else if (attribute.type === 'OnDirective') {
			if (!attribute.expression) {
				context.state.analysis.needs_props = true;
			}

			let handler = build_event_handler(
				attribute.expression,
				attribute.metadata.expression,
				context
			);

			if (attribute.modifiers.includes('once')) {
				handler = b.call('$.once', handler);
			}

			(events[attribute.name] ||= []).push(handler);
		} else if (attribute.type === 'SpreadAttribute') {
			const expression = /** @type {Expression} */ (context.visit(attribute));
			const memoized_expression = memoizer.add(expression, attribute.metadata.expression);
			const is_memoized = expression !== memoized_expression;

			if (
				is_memoized ||
				attribute.metadata.expression.has_state ||
				attribute.metadata.expression.has_await
			) {
				props_and_spreads.push(
					b.thunk(is_memoized ? b.call('$.get', memoized_expression) : expression)
				);
			} else {
				props_and_spreads.push(expression);
			}
		} else if (attribute.type === 'Attribute') {
			if (attribute.name.startsWith('--')) {
				custom_css_props.push(
					b.init(
						attribute.name,
						build_attribute_value(attribute.value, context, (value, metadata) => {
							const memoized = memoizer.add(value, metadata);

							// TODO put the derived in the local block
							return value !== memoized ? b.call('$.get', memoized) : value;
						}).value
					)
				);
				continue;
			}

			if (attribute.name === 'slot') {
				slot_scope_applies_to_itself = true;
			}

			if (attribute.name === 'children') {
				has_children_prop = true;
			}

			const { value, has_state } = build_attribute_value(
				attribute.value,
				context,
				(value, metadata) => {
					// When we have a non-simple computation, anything other than an Identifier or Member expression,
					// then there's a good chance it needs to be memoized to avoid over-firing when read within the
					// child component (e.g. `active={i === index}`)
					const should_wrap_in_derived =
						metadata.has_await ||
						get_attribute_chunks(attribute.value).some((n) => {
							return (
								n.type === 'ExpressionTag' &&
								n.expression.type !== 'Identifier' &&
								n.expression.type !== 'MemberExpression'
							);
						});

					const memoized = memoizer.add(value, metadata, should_wrap_in_derived);

					return value !== memoized ? b.call('$.get', memoized) : value;
				}
			);

			if (has_state) {
				push_prop(b.get(attribute.name, [b.return(value)]));
			} else {
				push_prop(b.init(attribute.name, value));
			}
		} else if (attribute.type === 'BindDirective') {
			const expression = /** @type {Expression} */ (
				context.visit(attribute.expression, { ...context.state, memoizer })
			);

			// Bindings are a bit special: we don't want to add them to (async) deriveds but we need to check if they have blockers
			memoizer.check_blockers(attribute.metadata.expression);

			if (
				dev &&
				attribute.name !== 'this' &&
				!is_ignored(node, 'ownership_invalid_binding') &&
				// bind:x={() => x.y, y => x.y = y} will be handled by the assignment expression binding validation
				attribute.expression.type !== 'SequenceExpression'
			) {
				const left = object(attribute.expression);
				const binding = left && context.state.scope.get(left.name);

				if (binding?.kind === 'bindable_prop' || binding?.kind === 'prop') {
					context.state.analysis.needs_mutation_validation = true;
					binding_initializers.push(
						b.stmt(
							b.call(
								'$$ownership_validator.binding',
								b.literal(binding.node.name),
								b.id(is_component_dynamic ? intermediate_name : component_name),
								b.thunk(expression)
							)
						)
					);
				}
			}

			if (expression.type === 'SequenceExpression') {
				if (attribute.name === 'this') {
					bind_this = attribute.expression;
				} else {
					const [get, set] = expression.expressions;
					const get_id = b.id(context.state.scope.generate('bind_get'));
					const set_id = b.id(context.state.scope.generate('bind_set'));

					context.state.init.push(b.var(get_id, get));
					context.state.init.push(b.var(set_id, set));

					push_prop(b.get(attribute.name, [b.return(b.call(get_id))]));
					push_prop(b.set(attribute.name, [b.stmt(b.call(set_id, b.id('$$value')))]));
				}
			} else {
				if (
					dev &&
					expression.type === 'MemberExpression' &&
					context.state.analysis.runes &&
					!is_ignored(node, 'binding_property_non_reactive')
				) {
					validate_binding(context.state, attribute, expression);
				}

				if (attribute.name === 'this') {
					bind_this = attribute.expression;
				} else {
					const is_store_sub =
						attribute.expression.type === 'Identifier' &&
						context.state.scope.get(attribute.expression.name)?.kind === 'store_sub';

					// Delay prop pushes so bindings come at the end, to avoid spreads overwriting them
					if (is_store_sub) {
						push_prop(
							b.get(attribute.name, [b.stmt(b.call('$.mark_store_binding')), b.return(expression)]),
							true
						);
					} else {
						push_prop(b.get(attribute.name, [b.return(expression)]), true);
					}

					const assignment = b.assignment(
						'=',
						/** @type {Pattern} */ (attribute.expression),
						b.id('$$value')
					);

					push_prop(
						b.set(attribute.name, [b.stmt(/** @type {Expression} */ (context.visit(assignment)))]),
						true
					);
				}
			}
		} else if (attribute.type === 'AttachTag') {
			const evaluated = context.state.scope.evaluate(attribute.expression);

			let expression = /** @type {Expression} */ (context.visit(attribute.expression));

			if (attribute.metadata.expression.has_state) {
				expression = b.arrow(
					[b.id('$$node')],
					b.call(
						evaluated.is_function ? expression : b.logical('||', expression, b.id('$.noop')),
						b.id('$$node')
					)
				);
			}

			push_prop(b.prop('init', b.call('$.attachment'), expression, true));
		}
	}

	delayed_props.forEach((fn) => fn());

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

	/** @type {import('estree').Property[]} */
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

		let slot_name = determine_slot(child) ?? 'default';

		(children[slot_name] ||= []).push(child);
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
					? slot_scope_applies_to_itself
						? context.state
						: states.default
					: {
							...context.state,
							scope: node.metadata.scopes[slot_name],
							transform: { ...context.state.transform }
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
			if (
				lets.length === 0 &&
				children.default.every(
					(node) =>
						node.type !== 'SvelteFragment' ||
						!node.attributes.some((attr) => attr.type === 'LetDirective')
				)
			) {
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

	if (
		!context.state.analysis.runes &&
		node.attributes.some((attribute) => attribute.type === 'BindDirective')
	) {
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
			is_component_dynamic
				? intermediate_name
				: /** @type {Expression} */ (context.visit(b.member_id(component_name))),
			node_id,
			props_expression
		);
	};

	if (bind_this !== null) {
		const prev = fn;

		fn = (node_id) => {
			return build_bind_this(bind_this, prev(node_id), context);
		};
	}

	const statements = [...snippet_declarations, ...memoizer.deriveds(context.state.analysis.runes)];

	if (is_component_dynamic) {
		const prev = fn;

		fn = (node_id) => {
			return b.call(
				'$.component',
				node_id,
				b.thunk(
					/** @type {Expression} */ (
						context.visit(node.type === 'Component' ? b.member_id(component_name) : node.expression)
					)
				),
				b.arrow(
					[b.id('$$anchor'), b.id(intermediate_name)],
					b.block([...binding_initializers, b.stmt(prev(b.id('$$anchor')))])
				)
			);
		};
	} else {
		statements.push(...binding_initializers);
	}

	if (Object.keys(custom_css_props).length > 0) {
		if (context.state.metadata.namespace === 'svg') {
			// this boils down to <g><!></g>
			context.state.template.push_element('g', node.start);
		} else {
			// this boils down to <svelte-css-wrapper style='display: contents'><!></svelte-css-wrapper>
			context.state.template.push_element('svelte-css-wrapper', node.start);
			context.state.template.set_prop('style', 'display: contents');
		}

		context.state.template.push_comment();
		context.state.template.pop_element();

		statements.push(
			b.stmt(b.call('$.css_props', anchor, b.thunk(b.object(custom_css_props)))),
			b.stmt(fn(b.member(anchor, 'lastChild'))),
			b.stmt(b.call('$.reset', anchor))
		);
	} else {
		context.state.template.push_comment();

		statements.push(add_svelte_meta(fn(anchor), node, 'component', { componentTag: node.name }));
	}

	memoizer.apply();

	const async_values = memoizer.async_values();
	const blockers = memoizer.blockers();

	if (async_values || blockers) {
		return b.stmt(
			b.call(
				'$.async',
				anchor,
				blockers,
				async_values,
				b.arrow([b.id('$$anchor'), ...memoizer.async_ids()], b.block(statements))
			)
		);
	}

	return statements.length > 1 ? b.block(statements) : statements[0];
}
