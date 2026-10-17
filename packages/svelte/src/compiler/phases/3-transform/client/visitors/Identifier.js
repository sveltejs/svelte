/** @import { Identifier, Node } from 'estree' */
/** @import { Context } from '../types' */
import is_reference from 'is-reference';
import * as b from '#compiler/builders';
import { build_getter, is_prop_source, prop_read_may_be_in_teardown } from '../utils.js';

/**
 * @param {Identifier} node
 * @param {Context} context
 */
export function Identifier(node, context) {
	const parent = /** @type {Node} */ (context.path.at(-1));

	if (is_reference(node, parent)) {
		if (node.name === '$$props') {
			return b.id('$$sanitized_props');
		}

		const binding = context.state.scope.get(node.name);
		if (
			context.state.is_instance &&
			binding !== null &&
			node !== binding.node &&
			(binding.kind === 'prop' || binding.kind === 'bindable_prop') &&
			!is_prop_source(binding, context.state) &&
			prop_read_may_be_in_teardown(binding, node, context.state)
		) {
			return b.call(
				'$.get_prop_value',
				b.id('$$props'),
				b.literal(binding.prop_alias ?? node.name)
			);
		}

		return build_getter(node, context.state);
	}
}
