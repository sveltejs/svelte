/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { ComponentContext } from '../types' */

import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {ComponentContext} context
 */
export function AwaitExpression(node, context) {
	// Inside component
	if (context.state.analysis.instance) {
		return b.call('$.await_derived', b.thunk(/** @type {Expression} */ (context.visit(node.argument))));
	}

	context.next();
}
