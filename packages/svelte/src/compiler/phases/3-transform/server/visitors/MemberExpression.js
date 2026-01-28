/** @import { ClassBody, MemberExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';

/**
 * @param {MemberExpression} node
 * @param {Context} context
 */
export function MemberExpression(node, context) {
	if (context.state.analysis.runes && node.property.type === 'PrivateIdentifier') {
		const field = context.state.state_fields?.get(`#${node.property.name}`);

		if (field?.type === '$derived' || field?.type === '$derived.by') {
			return b.call(node);
		}
	}

	context.next();
}
