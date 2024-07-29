/** @import { AssignmentExpression } from 'estree' */
/** @import { Context } from '../types' */
import { validate_assignment } from './shared/utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	validate_assignment(node, node.left, context.state);
	context.next();
}
