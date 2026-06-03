/** @import { TaggedTemplateExpression } from 'estree' */
/** @import { Context } from '../types' */
import { is_pure } from './shared/utils.js';

/**
 * @param {TaggedTemplateExpression} node
 * @param {Context} context
 */
export function TaggedTemplateExpression(node, context) {
	if (context.state.expression && !is_pure(node.tag, context)) {
		context.state.expression.has_call = true;
		context.state.expression.has_state = true;
	}

	context.next();
}
