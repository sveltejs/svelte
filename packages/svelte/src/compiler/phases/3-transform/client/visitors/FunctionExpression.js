/** @import { FunctionExpression } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { visit_function } from './shared/function.js';

/**
 * @param {FunctionExpression} node
 * @param {ComponentContext} context
 */
export function FunctionExpression(node, context) {
	return visit_function(node, context);
}
