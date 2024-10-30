/** @import { NewExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as w from '../../../warnings.js';

/**
 * @param {NewExpression} node
 * @param {Context} context
 */
export function NewExpression(node, context) {
	if (node.callee.type === 'ClassExpression' && context.state.scope.function_depth > 0) {
		w.perf_avoid_inline_class(node);
	}

	context.state.analysis.needs_context = true;

	context.next();
}
