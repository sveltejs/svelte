/** @import { MemberExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {MemberExpression} node
 * @param {Context} context
 */
export function MemberExpressionRunes(node, context) {
	if (node.object.type === 'ThisExpression' && node.property.type === 'PrivateIdentifier') {
		const field = context.state.private_derived.get(node.property.name);

		if (field) {
			return b.call(node);
		}
	}

	context.next();
}
