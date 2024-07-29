/** @import { AssignmentExpression } from 'estree' */
/** @import { SvelteNode } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_assignment } from './shared/utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	const parent = /** @type {SvelteNode} */ (context.path.at(-1));
	if (parent.type !== 'ConstTag') {
		validate_assignment(node, node.left, context.state);
	}

	context.next();
}
