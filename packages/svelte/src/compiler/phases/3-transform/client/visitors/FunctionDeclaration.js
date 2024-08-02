/** @import { FunctionDeclaration } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { build_hoistable_params } from '../utils.js';
import * as b from '../../../../utils/builders.js';

/**
 * @param {FunctionDeclaration} node
 * @param {ComponentContext} context
 */
export function FunctionDeclaration(node, context) {
	const metadata = node.metadata;

	const state = { ...context.state, in_constructor: false };

	if (metadata?.hoistable === true) {
		const params = build_hoistable_params(node, context);

		context.state.hoisted.push(
			/** @type {FunctionDeclaration} */ ({
				...node,
				id: node.id !== null ? context.visit(node.id, state) : null,
				params,
				body: context.visit(node.body, state)
			})
		);

		return b.empty;
	}

	context.next(state);
}
