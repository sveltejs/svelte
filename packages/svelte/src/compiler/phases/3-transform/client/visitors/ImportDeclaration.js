/** @import { ImportDeclaration } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {ImportDeclaration} node
 * @param {ComponentContext} context
 */
export function ImportDeclaration(node, context) {
	if ('hoisted' in context.state) {
		// TODO we can get rid of this visitor
		context.state.hoisted.push(node);
		return b.empty;
	}

	context.next();
}
