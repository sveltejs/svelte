/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { PromiseOptimiser } from './shared/utils.js';

/**
 * @param {AST.PortalTag} node
 * @param {ComponentContext} context
 */
export function PortalTag(node, context) {
	const optimiser = new PromiseOptimiser();
	const value = optimiser.transform(
		/** @type {Expression} */ (context.visit(node.expression)),
		node.metadata.expression
	);

	context.state.template.push(
		...optimiser.render_block([b.stmt(b.call('$.portal_outlet', b.id('$$renderer'), value))])
	);
}
