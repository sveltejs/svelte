/** @import { ArrowFunctionExpression } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { visit_function } from './shared/function.js';

/**
 * @param {ArrowFunctionExpression} node
 * @param {ComponentContext} context
 */
export function ArrowFunctionExpression(node, context) {
	return visit_function(node, context);
}
