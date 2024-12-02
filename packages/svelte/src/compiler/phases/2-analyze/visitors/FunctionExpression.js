/** @import { FunctionExpression } from 'estree' */
/** @import { Context } from '../types' */
import { visit_function } from './shared/function.js';

/**
 * @param {FunctionExpression} node
 * @param {Context} context
 */
export function FunctionExpression(node, context) {
	visit_function(node, context);
}
