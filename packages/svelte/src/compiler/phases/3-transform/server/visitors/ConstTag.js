/** @import { Expression, Pattern } from 'estree' */
/** @import { Ast } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {Ast.ConstTag} node
 * @param {ComponentContext} context
 */
export function ConstTag(node, context) {
	const declaration = node.declaration.declarations[0];
	const id = /** @type {Pattern} */ (context.visit(declaration.id));
	const init = /** @type {Expression} */ (context.visit(declaration.init));

	context.state.init.push(b.const(id, init));
}
