/** @import { MemberExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';

/**
 * @param {MemberExpression} node
 * @param {Context} context
 */
export function MemberExpression(node, context) {
	if (
		context.state.analysis.runes &&
		node.object.type === 'ThisExpression' &&
		node.property.type === 'PrivateIdentifier'
	) {
		const field = context.state.private_derived.get(node.property.name);

		if (field) {
			return b.call(node);
		}
	}

	context.next();
}
