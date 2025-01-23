/** @import { AwaitExpression } from 'estree' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {ComponentContext} context
 */
export function AwaitExpression(node, context) {
	const suspend = context.state.analysis.suspenders.has(node);

	if (!suspend) {
		return context.next();
	}

	return b.call('$.await_outside_boundary');
}
