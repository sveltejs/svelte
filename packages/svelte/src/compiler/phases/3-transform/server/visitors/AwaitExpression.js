/** @import { AwaitExpression } from 'estree' */
/** @import { ComponentContext } from '../types.js' */

/**
 * This is only registered for components, currently.
 * @param {AwaitExpression} node
 * @param {ComponentContext} context
 */
export function AwaitExpression(node, context) {
	const hoisted = context.state.analysis.hoisted_promises.get(node.argument);
	if (hoisted) {
		node.argument = hoisted;
	}
}
