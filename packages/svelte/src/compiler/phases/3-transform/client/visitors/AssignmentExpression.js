/** @import { AssignmentExpression } from 'estree' */
/** @import { Context } from '../types' */
import { build_setter } from '../utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	if (node.left.type === 'Identifier') {
		if (Object.hasOwn(context.state.transformers, node.left.name)) {
			const transformer = context.state.transformers[node.left.name]?.assign;

			if (transformer) {
				return transformer(node, context.visit);
			}
		}
	}

	return build_setter(node, context, context.next);
}
