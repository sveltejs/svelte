/** @import { UpdateExpression } from 'estree' */
/** @import { Context } from '../types' */
import { validate_assignment } from './shared/utils.js';

/**
 * @param {UpdateExpression} node
 * @param {Context} context
 */
export function UpdateExpression(node, context) {
	validate_assignment(node, node.argument, context.state);
	context.next();
}
