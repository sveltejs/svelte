/** @import { StaticBlock } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { add_state_transformers } from './shared/declarations.js';

/**
 * @param {StaticBlock} node
 * @param {ComponentContext} context
 */
export function StaticBlock(node, context) {
	add_state_transformers(context);
	context.next();
}
