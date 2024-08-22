/** @import { BlockStatement } from 'estree' */
/** @import { Ast } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { empty_comment } from './shared/utils.js';

/**
 * @param {Ast.KeyBlock} node
 * @param {ComponentContext} context
 */
export function KeyBlock(node, context) {
	context.state.template.push(
		empty_comment,
		/** @type {BlockStatement} */ (context.visit(node.fragment)),
		empty_comment
	);
}
