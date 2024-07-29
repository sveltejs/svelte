/** @import { AssignmentExpression } from 'estree' */
/** @import { SvelteNode } from '#compiler' */
/** @import { Context, LegacyAnalysisState } from '../types' */
import { extract_identifiers, object } from '../../../utils/ast.js';
import { validate_assignment } from './shared/utils.js';

/**
 * @param {AssignmentExpression} node
 * @param {Context<LegacyAnalysisState>} context
 */
export function AssignmentExpression(node, context) {
	const parent = /** @type {SvelteNode} */ (context.path.at(-1));
	if (parent.type !== 'ConstTag') {
		validate_assignment(node, node.left, context.state);
	}

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

	context.next();
}
