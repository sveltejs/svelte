/** @import { Context } from '../types' */
/** @import { AST } from '#compiler'; */
import * as e from '../../../errors.js';

/**
 * @param {AST.AnimateDirective} node
 * @param {Context} context
 */
export function AnimateDirective(node, context) {
	if (context.state.analysis.custom_renderer) {
		e.incompatible_with_custom_renderer(node, '`animate:`');
	}

	context.next({ ...context.state, expression: node.metadata.expression });

	if (node.metadata.expression.has_await) {
		e.illegal_await_expression(node);
	}
}
