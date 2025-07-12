/** @import { FunctionDeclaration } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { build_hoisted_params } from '../utils.js';
import * as b from '#compiler/builders';

/**
 * @param {FunctionDeclaration} node
 * @param {ComponentContext} context
 */
export function FunctionDeclaration(node, context) {
	const state = { ...context.state, in_constructor: false, in_derived: false };

	if (node.metadata?.hoisted === true) {
		const params = build_hoisted_params(node, context);
		const body = context.visit(node.body, state);

		context.state.hoisted.push(/** @type {FunctionDeclaration} */ ({ ...node, params, body }));

		return b.empty;
	}

	context.next(state);
}
