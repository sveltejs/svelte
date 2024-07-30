/** @import { FunctionDeclaration } from 'estree' */
/** @import { Context } from '../types' */
import { visit_function } from './shared/function.js';

/**
 * @param {FunctionDeclaration} node
 * @param {Context} context
 */
export function FunctionDeclaration(node, context) {
	visit_function(node, context);
}
