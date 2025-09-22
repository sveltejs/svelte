/** @import { BlockStatement, Expression, Literal, Property } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import {
	build_attribute_value,
	PromiseOptimiser,
	create_async_block,
	block_open,
	block_close
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
				optimiser.transform,
				false,
				true
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
			? create_async_block(b.block([optimiser.apply(), b.stmt(slot)]))
			: b.stmt(slot);

	context.state.template.push(block_open, statement, block_close);
}
