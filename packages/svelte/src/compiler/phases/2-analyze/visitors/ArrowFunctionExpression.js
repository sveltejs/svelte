/** @import { ArrowFunctionExpression } from 'estree' */
/** @import { Context } from '../types' */
import { visit_function } from './shared/function.js';

/**
 * @param {ArrowFunctionExpression} node
 * @param {Context} context
 */
export function ArrowFunctionExpression(node, context) {
	visit_function(node, context);
}
