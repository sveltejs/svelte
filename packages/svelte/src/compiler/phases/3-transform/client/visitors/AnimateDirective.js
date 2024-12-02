/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { parse_directive_name } from './shared/utils.js';

/**
 * @param {AST.AnimateDirective} node
 * @param {ComponentContext} context
 */
export function AnimateDirective(node, context) {
	const expression =
		node.expression === null
			? b.literal(null)
			: b.thunk(/** @type {Expression} */ (context.visit(node.expression)));

	// in after_update to ensure it always happens after bind:this
	context.state.after_update.push(
		b.stmt(
			b.call(
				'$.animation',
				context.state.node,
				b.thunk(/** @type {Expression} */ (context.visit(parse_directive_name(node.name)))),
				expression
			)
		)
	);
}
