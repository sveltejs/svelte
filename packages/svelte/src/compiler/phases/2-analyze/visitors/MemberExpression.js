/** @import { MemberExpression } from 'estree' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

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

	context.next();
}
