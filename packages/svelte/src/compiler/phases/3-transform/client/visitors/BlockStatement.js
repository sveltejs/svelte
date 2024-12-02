/** @import { BlockStatement } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { add_state_transformers } from './shared/declarations.js';

/**
 * @param {BlockStatement} node
 * @param {ComponentContext} context
 */
export function BlockStatement(node, context) {
	add_state_transformers(context);
	context.next();
}
