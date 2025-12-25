/** @import { FunctionDeclaration } from 'estree' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {FunctionDeclaration} node
 * @param {ComponentContext} context
 */
export function FunctionDeclaration(node, context) {
	const state = { ...context.state, in_constructor: false, in_derived: false };
	if (node.id) {
		const binding = context.state.scope.get(node.id.name);
		if (binding && context.state.analysis.instance_body?.top_function_declarations.includes(binding)) {
			const fn = /** @type {FunctionDeclaration} */ (context.next(state) ?? node);
			const expression = b.function(fn.id, fn.params, fn.body, fn.async, fn.generator);
			const declaration = b.let(fn.id, b.call('$.state', expression));
			context.state.legacy_instance_top_function_declarations.push(declaration);
			return b.empty;
		}
	}
	context.next(state);
}
