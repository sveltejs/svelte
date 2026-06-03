/** @import { FunctionDeclaration } from 'estree' */
/** @import { ComponentContext } from '../types' */

/**
 * @param {FunctionDeclaration} node
 * @param {ComponentContext} context
 */
export function FunctionDeclaration(node, context) {
	const state = { ...context.state, in_constructor: false, in_derived: false };

	context.next(state);
}
