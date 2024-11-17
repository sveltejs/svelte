/** @import { BlockStatement, Expression, Literal, Property, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { is_hydratable } from '../../../../../internal/server/hydration.js';
import * as b from '../../../../utils/builders.js';
import { empty_comment, build_attribute_value } from './shared/utils.js';

/**
 * @param {AST.SlotElement} node
 * @param {ComponentContext} context
 */
export function SlotElement(node, context) {
	/** @type {Property[]} */
	const props = [];

	/** @type {Expression[]} */
	const spreads = [];

	let name = b.literal('default');

	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') {
			spreads.push(/** @type {Expression} */ (context.visit(attribute)));
		} else if (attribute.type === 'Attribute') {
			const value = build_attribute_value(attribute.value, context, false, true);

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
			? b.literal(null)
			: b.thunk(/** @type {BlockStatement} */ (context.visit(node.fragment)));

	const slot = b.call(
		'$.slot',
		b.id('$$payload'),
		b.id('$$props'),
		name,
		props_expression,
		fallback
	);

	const templates = /** @type {Array<Expression | Statement>} */ ([b.stmt(slot)]);

	if (is_hydratable()) {
		templates.unshift(empty_comment);
		templates.push(empty_comment);
	}

	context.state.template.push(...templates);
}
