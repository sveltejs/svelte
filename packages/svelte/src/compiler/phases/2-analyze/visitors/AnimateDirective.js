/** @import { Context } from '../types' */
/** @import { AST } from '#compiler'; */
import * as e from '../../../errors.js';
import { custom_renderer } from '../../../state.js';

/**
 * @param {AST.AnimateDirective} node
 * @param {Context} context
 */
export function AnimateDirective(node, context) {
	if (custom_renderer) {
		e.incompatible_with_custom_renderer(node, '`animate:`');
	}

	context.next({ ...context.state, expression: node.metadata.expression });

	if (node.metadata.expression.has_await) {
		e.illegal_await_expression(node);
	}
}
