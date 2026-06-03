/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

import { mark_subtree_dynamic } from './shared/fragment.js';

/**
 * @param {AST.TransitionDirective} node
 * @param {Context} context
 */
export function TransitionDirective(node, context) {
	mark_subtree_dynamic(context.path);

	context.next({ ...context.state, expression: node.metadata.expression });

	if (node.metadata.expression.has_await) {
		e.illegal_await_expression(node);
	}
}
