/** @import { Identifier, Node } from 'estree' */
/** @import { Context } from '../types' */
import is_reference from 'is-reference';
import * as b from '#compiler/builders';
import { build_getter } from '../utils.js';

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

		// Optimize prop access: If it's a member read access, we can use the $$props object directly
		const binding = context.state.scope.get(node.name);
		if (
			context.state.analysis.runes && // can't do this in legacy mode because the proxy does more than just read/write
			binding !== null &&
			node !== binding.node &&
			binding.kind === 'rest_prop'
		) {
			const grand_parent = context.path.at(-2);

			if (
				parent?.type === 'MemberExpression' &&
				!parent.computed &&
				grand_parent?.type !== 'AssignmentExpression' &&
				grand_parent?.type !== 'UpdateExpression'
			) {
				const key = /** @type {Identifier} */ (parent.property);

				if (!binding.metadata?.exclude_props?.includes(key.name)) {
					return b.id('$$props');
				}
			}
		}

		return build_getter(node, context.state);
	}
}
