/** @import { MemberExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { is_pure, is_safe_identifier } from './shared/utils.js';

/**
 * @param {MemberExpression} node
 * @param {Context} context
 */
export function MemberExpression(node, context) {
	if (node.object.type === 'Identifier' && node.property.type === 'Identifier') {
		const binding = context.state.scope.get(node.object.name);
		if (binding?.kind === 'rest_prop' && node.property.name.startsWith('$$')) {
			e.props_illegal_name(node.property);
		}
	}

	if (context.state.expression && !is_pure(node, context)) {
		context.state.expression.has_state = true;
	}

	if (!is_safe_identifier(node, context.state.scope)) {
		context.state.analysis.needs_context = true;
	}

	context.next();
}
