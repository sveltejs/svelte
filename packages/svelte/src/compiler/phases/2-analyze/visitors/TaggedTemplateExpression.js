/** @import { TaggedTemplateExpression, VariableDeclarator } from 'estree' */
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

	if (node.tag.type === 'Identifier') {
		const binding = context.state.scope.get(node.tag.name);

		if (binding !== null) {
			binding.is_called = true;
		}
	}
	context.next();
}
