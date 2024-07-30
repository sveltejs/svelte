/** @import { ExpressionStatement, ImportDeclaration } from 'estree' */
/** @import { Context } from '../types' */
import * as w from '../../../warnings.js';

/**
 * @param {ExpressionStatement} node
 * @param {Context} context
 */
export function ExpressionStatement(node, context) {
	// warn on `new Component({ target: ... })` if imported from a `.svelte` file
	if (
		node.expression.type === 'NewExpression' &&
		node.expression.callee.type === 'Identifier' &&
		node.expression.arguments.length === 1 &&
		node.expression.arguments[0].type === 'ObjectExpression' &&
		node.expression.arguments[0].properties.some(
			(p) => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'target'
		)
	) {
		const binding = context.state.scope.get(node.expression.callee.name);

		if (binding?.kind === 'normal' && binding.declaration_kind === 'import') {
			const declaration = /** @type {ImportDeclaration} */ (binding.initial);

			// Theoretically someone could import a class from a `.svelte.js` module, but that's too rare to worry about
			if (
				/** @type {string} */ (declaration.source.value).endsWith('.svelte') &&
				declaration.specifiers.find(
					(s) => s.local.name === binding.node.name && s.type === 'ImportDefaultSpecifier'
				)
			) {
				w.legacy_component_creation(node.expression);
			}
		}
	}

	context.next();
}
