/** @import { BlockStatement, ExpressionStatement } from 'estree' */
/** @import { SvelteFragment } from '#compiler' */
/** @import { ComponentContext } from '../types' */

/**
 * @param {SvelteFragment} node
 * @param {ComponentContext} context
 */
export function SvelteFragment(node, context) {
	const child_state = {
		...context.state,
		getters: { ...context.state.getters }
	};

	for (const attribute of node.attributes) {
		if (attribute.type === 'LetDirective') {
			context.state.template.push(
				/** @type {ExpressionStatement} */ (context.visit(attribute, child_state))
			);
		}
	}

	const block = /** @type {BlockStatement} */ (context.visit(node.fragment, child_state));

	context.state.template.push(block);
}
