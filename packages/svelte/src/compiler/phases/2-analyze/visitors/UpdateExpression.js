/** @import { UpdateExpression } from 'estree' */
/** @import { Context } from '../types' */
import { object } from '../../../utils/ast.js';
import { validate_assignment } from './shared/utils.js';

/**
 * @param {UpdateExpression} node
 * @param {Context} context
 */
export function UpdateExpression(node, context) {
	validate_assignment(node, node.argument, context.state);

	if (context.state.reactive_statement) {
		const id = node.argument.type === 'MemberExpression' ? object(node.argument) : node.argument;
		if (id?.type === 'Identifier') {
			const binding = context.state.scope.get(id.name);

			if (binding) {
				context.state.reactive_statement.assignments.add(binding);
			}
		}
	}

	context.next();
}
