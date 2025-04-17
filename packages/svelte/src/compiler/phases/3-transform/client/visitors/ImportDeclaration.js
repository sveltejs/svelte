/** @import { ImportDeclaration } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {ImportDeclaration} node
 * @param {ComponentContext} context
 */
export function ImportDeclaration(node, context) {
	if ('hoisted' in context.state) {
		context.state.hoisted.push(node);
		return b.empty;
	}

	context.next();
}
