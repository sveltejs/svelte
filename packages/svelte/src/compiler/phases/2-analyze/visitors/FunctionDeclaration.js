/** @import { FunctionDeclaration } from 'estree' */
/** @import { Context } from '../types' */
import { visit_function } from './shared/function.js';
import { validate_identifier_name } from './shared/utils.js';

/**
 * @param {FunctionDeclaration} node
 * @param {Context} context
 */
export function FunctionDeclaration(node, context) {
	if (context.state.analysis.runes && node.id !== null) {
		validate_identifier_name(context.state.scope.get(node.id.name));
	}

	visit_function(node, context);
}
