/** @import { AssignmentExpression } from 'estree' */
/** @import { Context } from '../types' */
import { serialize_set_binding } from '../utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	return serialize_set_binding(node, context, context.next);
}
