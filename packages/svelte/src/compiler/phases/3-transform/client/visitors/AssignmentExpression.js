/** @import { AssignmentExpression } from 'estree' */
/** @import { Context } from '../types' */
import { build_setter } from '../utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	return build_setter(node, context, context.next);
}
