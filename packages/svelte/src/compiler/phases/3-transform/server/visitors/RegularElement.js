/** @import { Expression } from 'estree' */
/** @import { Location } from 'locate-character' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext, ComponentServerTransformState } from '../types.js' */
/** @import { Scope } from '../../../scope.js' */
import { is_void } from '../../../../../utils.js';
import { dev, locator } from '../../../../state.js';
import * as b from '#compiler/builders';
import { clean_nodes, determine_namespace_for_children } from '../../utils.js';
import { build_element_attributes, build_spread_object } from './shared/element.js';
import { process_children, build_template, build_attribute_value } from './shared/utils.js';

/**
 * @param {AST.RegularElement} node
 * @param {ComponentContext} context
 */
export function RegularElement(node, context) {
	const namespace = determine_namespace_for_children(node, context.state.namespace);

	/** @type {ComponentServerTransformState} */
	const state = {
		...context.state,
		namespace,
		preserve_whitespace:
			context.state.preserve_whitespace || node.name === 'pre' || node.name === 'textarea'
	};

	const node_is_void = is_void(node.name);

	context.state.template.push(b.literal(`<${node.name}`));
	const body = build_element_attributes(node, { ...context, state });
	context.state.template.push(b.literal(node_is_void ? '/>' : '>')); // add `/>` for XHTML compliance

	if ((node.name === 'script' || node.name === 'style') && node.fragment.nodes.length === 1) {
		context.state.template.push(
			b.literal(/** @type {AST.Text} */ (node.fragment.nodes[0]).data),
			b.literal(`</${node.name}>`)
		);

		return;
	}

	const { hoisted, trimmed } = clean_nodes(
		node,
		node.fragment.nodes,
		context.path,
		namespace,
		{
			...state,
			scope: /** @type {Scope} */ (state.scopes.get(node.fragment))
		},
		state.preserve_whitespace,
		state.options.preserveComments
	);

	for (const node of hoisted) {
		context.visit(node, state);
	}

	if (dev) {
		const location = /** @type {Location} */ (locator(node.start));
		state.template.push(
			b.stmt(
				b.call(
					'$.push_element',
					b.id('$$payload'),
					b.literal(node.name),
					b.literal(location.line),
					b.literal(location.column)
				)
			)
		);
	}

	let select_with_value = false;

	if (node.name === 'select') {
		const value = node.attributes.find(
			(attribute) =>
				(attribute.type === 'Attribute' || attribute.type === 'BindDirective') &&
				attribute.name === 'value'
		);
		if (node.attributes.some((attribute) => attribute.type === 'SpreadAttribute')) {
			select_with_value = true;
			state.template.push(
				b.stmt(
					b.assignment(
						'=',
						b.id('$$payload.select_value'),
						b.member(
							build_spread_object(
								node,
								node.attributes.filter(
									(attribute) =>
										attribute.type === 'Attribute' ||
										attribute.type === 'BindDirective' ||
										attribute.type === 'SpreadAttribute'
								),
								context
							),
							'value',
							false,
							true
						)
					)
				)
			);
		} else if (value) {
			select_with_value = true;
			const left = b.id('$$payload.select_value');
			if (value.type === 'Attribute') {
				state.template.push(
					b.stmt(b.assignment('=', left, build_attribute_value(value.value, context)))
				);
			} else if (value.type === 'BindDirective') {
				state.template.push(
					b.stmt(
						b.assignment(
							'=',
							left,
							value.expression.type === 'SequenceExpression'
								? /** @type {Expression} */ (context.visit(b.call(value.expression.expressions[0])))
								: /** @type {Expression} */ (context.visit(value.expression))
						)
					)
				);
			}
		}
	}

	if (
		node.name === 'option' &&
		!node.attributes.some(
			(attribute) =>
				attribute.type === 'SpreadAttribute' ||
				((attribute.type === 'Attribute' || attribute.type === 'BindDirective') &&
					attribute.name === 'value')
		)
	) {
		const inner_state = { ...state, template: [], init: [] };
		process_children(trimmed, { ...context, state: inner_state });

		state.template.push(
			b.stmt(
				b.call(
					'$.valueless_option',
					b.id('$$payload'),
					b.thunk(b.block([...inner_state.init, ...build_template(inner_state.template)]))
				)
			)
		);
	} else if (body !== null) {
		// if this is a `<textarea>` value or a contenteditable binding, we only add
		// the body if the attribute/binding is falsy
		const inner_state = { ...state, template: [], init: [] };
		process_children(trimmed, { ...context, state: inner_state });

		let id = /** @type {Expression} */ (body);

		if (body.type !== 'Identifier') {
			id = b.id(state.scope.generate('$$body'));
			state.template.push(b.const(id, body));
		}

		// Use the body expression as the body if it's truthy, otherwise use the inner template
		state.template.push(
			b.if(
				id,
				b.block(build_template([id])),
				b.block([...inner_state.init, ...build_template(inner_state.template)])
			)
		);
	} else {
		process_children(trimmed, { ...context, state });
	}

	if (select_with_value) {
		state.template.push(b.stmt(b.assignment('=', b.id('$$payload.select_value'), b.void0)));
	}

	if (!node_is_void) {
		state.template.push(b.literal(`</${node.name}>`));
	}

	if (dev) {
		state.template.push(b.stmt(b.call('$.pop_element')));
	}
}
