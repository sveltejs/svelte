/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { mark_subtree_dynamic } from './shared/fragment.js';
import * as e from '../../../errors.js';

/**
 * @param {AST.UseDirective} node
 * @param {Context} context
 */
export function UseDirective(node, context) {
	mark_subtree_dynamic(context.path);

	context.next({ ...context.state, expression: node.metadata.expression });

	if (node.metadata.expression.has_await) {
		e.illegal_await_expression(node);
	}
}
