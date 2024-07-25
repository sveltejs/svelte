/** @import { AssignmentExpression } from 'estree' */
/** @import { Context } from '../types.js' */
import { serialize_set_binding } from './shared/utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	return serialize_set_binding(node, context, context.next);
}
