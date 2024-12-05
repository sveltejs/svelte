/** @import { SpreadElement } from 'estree' */
/** @import { Context } from '../types' */

/**
 * @param {SpreadElement} node
 * @param {Context} context
 */
export function SpreadElement(node, context) {
	if (context.state.expression) {
		// treat e.g. `[...x]` the same as `[...x.values()]`
		context.state.expression.has_call = true;
		context.state.expression.has_state = true;
	}

	context.next();
}
