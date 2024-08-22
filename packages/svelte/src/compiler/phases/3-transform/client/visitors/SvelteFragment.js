/** @import { BlockStatement, ExpressionStatement } from 'estree' */
/** @import { Ast } from '#compiler' */
/** @import { ComponentContext } from '../types' */

/**
 * @param {Ast.SvelteFragment} node
 * @param {ComponentContext} context
 */
export function SvelteFragment(node, context) {
	for (const attribute of node.attributes) {
		if (attribute.type === 'LetDirective') {
			context.state.init.push(/** @type {ExpressionStatement} */ (context.visit(attribute)));
		}
	}

	context.state.init.push(.../** @type {BlockStatement} */ (context.visit(node.fragment)).body);
}
