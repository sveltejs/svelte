/** @import { BlockStatement } from 'estree' */
/** @import { SvelteFragment } from '#compiler' */
/** @import { ComponentContext } from '../types' */

/**
 * @param {SvelteFragment} node
 * @param {ComponentContext} context
 */
export function SvelteFragment(node, context) {
	context.state.template.push(/** @type {BlockStatement} */ (context.visit(node.fragment)));
}
