/** @import { ArrowFunctionExpression, FunctionExpression, Node } from 'estree' */
/** @import { ComponentContext } from '../../types' */

/**
 * @param {ArrowFunctionExpression | FunctionExpression} node
 * @param {ComponentContext} context
 */
export const visit_function = (node, context) => {
	let state = { ...context.state, in_constructor: false, in_derived: false };

	if (node.type === 'FunctionExpression') {
		const parent = /** @type {Node} */ (context.path.at(-1));
		state.in_constructor = parent.type === 'MethodDefinition' && parent.kind === 'constructor';
	}

	context.next(state);
};
