/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	if (context.state.scope.function_depth > 1) {
		return context.next();
	}

	return b.call('$.await_outside_boundary');
}
