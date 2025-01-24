/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	// `has`, not `get`, because all top-level await expressions should
	// block regardless of whether they need context preservation
	// in the client output
	const suspend = context.state.analysis.suspenders.has(node);

	if (!suspend) {
		return context.next();
	}

	return b.call('$.await_outside_boundary');
}
