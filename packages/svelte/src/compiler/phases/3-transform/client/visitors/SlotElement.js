/** @import { BlockStatement, Expression, ExpressionStatement, Property } from 'estree' */
/** @import { SlotElement } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_attribute_value } from './shared/element.js';

/**
 * @param {SlotElement} node
 * @param {ComponentContext} context
 */
export function SlotElement(node, context) {
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
			const { value } = build_attribute_value(attribute.value, context);

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
		spreads.length === 0 ? b.object(props) : b.call('$.spread_props', b.object(props), ...spreads);

	const fallback =
		node.fragment.nodes.length === 0
			? b.literal(null)
			: b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.fragment)));

	const expression = is_default
		? b.call('$.default_slot', b.id('$$props'))
		: b.member(b.member(b.id('$$props'), '$$slots'), name, true, true);

	const slot = b.call('$.slot', context.state.node, expression, props_expression, fallback);
	context.state.init.push(b.stmt(slot));
}
