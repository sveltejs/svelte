/** @import { UpdateExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '#compiler/builders';

/**
 * @param {UpdateExpression} node
 * @param {Context} context
 */
export function UpdateExpression(node, context) {
	const argument = node.argument;

	if (
		argument.type === 'Identifier' &&
		context.state.scope.get(argument.name)?.kind === 'store_sub'
	) {
		return b.call(
			node.prefix ? '$.update_store_pre' : '$.update_store',
			b.assignment('??=', b.id('$$store_subs'), b.object([])),
			b.literal(argument.name),
			b.id(argument.name.slice(1)),
			node.operator === '--' && b.literal(-1)
		);
	}

	return context.next();
}
