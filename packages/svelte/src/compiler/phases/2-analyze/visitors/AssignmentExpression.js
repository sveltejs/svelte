/** @import { AssignmentExpression } from 'estree' */
/** @import { Context } from '../types' */
import { extract_identifiers, object } from '../../../utils/ast.js';
import { validate_assignment } from './shared/utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context} context
 */
export function AssignmentExpression(node, context) {
	validate_assignment(node, node.left, context);

	if (context.state.reactive_statement) {
		const id = node.left.type === 'MemberExpression' ? object(node.left) : node.left;
		if (id !== null) {
			for (const id of extract_identifiers(node.left)) {
				const binding = context.state.scope.get(id.name);

				if (binding) {
					context.state.reactive_statement.assignments.add(binding);
				}
			}
		}
	}

	if (context.state.expression) {
		context.state.expression.has_assignment = true;
	}

	context.next();
}
