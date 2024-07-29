/** @import { BlockStatement, Expression, ExpressionStatement, Property } from 'estree' */
/** @import { SlotElement } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';
import { empty_comment, serialize_attribute_value } from './shared/utils.js';

/**
 * @param {SlotElement} node
 * @param {ComponentContext} context
 */
export function SlotElement(node, context) {
	/** @type {Property[]} */
	const props = [];

	/** @type {Expression[]} */
	const spreads = [];

	/** @type {Expression} */
	let expression = b.call('$.default_slot', b.id('$$props'));

	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') {
			spreads.push(/** @type {Expression} */ (context.visit(attribute)));
		} else if (attribute.type === 'Attribute') {
			const value = serialize_attribute_value(attribute.value, context, false, true);

			if (attribute.name === 'name') {
				expression = b.member(b.member_id('$$props.$$slots'), value, true, true);
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
			? b.literal(null)
			: b.thunk(/** @type {BlockStatement} */ (context.visit(node.fragment)));

	const slot = b.call('$.slot', b.id('$$payload'), expression, props_expression, fallback);

	context.state.template.push(empty_comment, b.stmt(slot), empty_comment);
}
