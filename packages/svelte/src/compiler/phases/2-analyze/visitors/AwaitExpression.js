/** @import { AwaitExpression } from 'estree' */
/** @import { Context } from '../types' */
import { extract_identifiers } from '../../../utils/ast.js';
import * as w from '../../../warnings.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const declarator = context.path.at(-1);
	const declaration = context.path.at(-2);
	const program = context.path.at(-3);

	if (context.state.ast_type === 'instance') {
		if (
			declarator?.type !== 'VariableDeclarator' ||
			context.state.function_depth !== 1 ||
			declaration?.type !== 'VariableDeclaration' ||
			program?.type !== 'Program'
		) {
			throw new Error('TODO: invalid usage of AwaitExpression in component');
		}
		for (const declarator of declaration.declarations) {
			for (const id of extract_identifiers(declarator.id)) {
				const binding = context.state.scope.get(id.name);
				if (binding !== null) {
					binding.kind = 'derived';
				}
			}
		}
	}

	context.next();
}
