/** @import { BlockStatement, Expression, ExpressionStatement, Literal, Property } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_attribute_value } from './shared/element.js';
import { memoize_expression } from './shared/utils.js';

/**
 * @param {AST.SlotElement} node
 * @param {ComponentContext} context
 */
export function SlotElement(node, context) {
	// <slot {a}>fallback</slot>  -->   $.slot($$slots.default, { get a() { .. } }, () => ...fallback);
	context.state.template.push_comment();

	/** @type {Property[]} */
	const props = [];

	/** @type {Expression[]} */
	const spreads = [];

	/** @type {ExpressionStatement[]} */
	const lets = [];

	let is_default = true;

	let name = b.literal('default');

	for (const attribute of node.attributes) {
		if (attribute.type === 'SpreadAttribute') {
			spreads.push(b.thunk(/** @type {Expression} */ (context.visit(attribute))));
		} else if (attribute.type === 'Attribute') {
			const { value, has_state } = build_attribute_value(
				attribute.value,
				context,
				(value, metadata) => (metadata.has_call ? memoize_expression(context.state, value) : value)
			);

			if (attribute.name === 'name') {
				name = /** @type {Literal} */ (value);
				is_default = false;
			} else if (attribute.name !== 'slot') {
				if (has_state) {
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
			? b.null
			: b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.fragment)));

	const slot = b.call(
		'$.slot',
		context.state.node,
		b.id('$$props'),
		name,
		props_expression,
		fallback
	);

	context.state.init.push(b.stmt(slot));
}
