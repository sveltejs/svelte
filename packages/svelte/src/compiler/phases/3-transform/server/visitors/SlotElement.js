/** @import { BlockStatement, Expression, Literal, Property } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import {
	empty_comment,
	build_attribute_value,
	PromiseOptimiser,
	call_child_renderer
} from './shared/utils.js';

/**
 * @param {AST.SlotElement} node
 * @param {ComponentContext} context
 */
export function SlotElement(node, context) {
	/** @type {Property[]} */
	const props = [];

	/** @type {Expression[]} */
	const spreads = [];

	const optimiser = new PromiseOptimiser();

	let name = b.literal('default');

	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') {
			let expression = /** @type {Expression} */ (context.visit(attribute));
			spreads.push(optimiser.transform(expression, attribute.metadata.expression));
		} else if (attribute.type === 'Attribute') {
			const value = build_attribute_value(
				attribute.value,
				context,
				false,
				true,
				optimiser.transform
			);

			if (attribute.name === 'name') {
				name = /** @type {Literal} */ (value);
			} else if (attribute.name !== 'slot') {
				props.push(b.init(attribute.name, value));
			}
		}
	}

	const props_expression =
		spreads.length === 0
			? b.object(props)
			: b.call('$.spread_props', b.array([b.object(props), ...spreads]));

	const fallback =
		node.fragment.nodes.length === 0
			? b.null
			: b.thunk(/** @type {BlockStatement} */ (context.visit(node.fragment)));

	const slot = b.call(
		'$.slot',
		b.id('$$renderer'),
		b.id('$$props'),
		name,
		props_expression,
		fallback
	);

	const statement =
		optimiser.expressions.length > 0
			? call_child_renderer(b.block([optimiser.apply(), b.stmt(slot)]), true)
			: b.stmt(slot);

	context.state.template.push(empty_comment, statement, empty_comment);
}
