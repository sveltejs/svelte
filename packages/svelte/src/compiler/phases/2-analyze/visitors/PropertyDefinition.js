/** @import { PropertyDefinition } from 'estree' */
/** @import { Context } from '../types' */

/**
 *
 * @param {PropertyDefinition} node
 * @param {Context} context
 */
export function PropertyDefinition(node, context) {
	context.state.class_state?.register(node, context);
	context.next();
}
