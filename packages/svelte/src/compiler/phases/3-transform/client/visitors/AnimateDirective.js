/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { parse_directive_name } from './shared/utils.js';

/**
 * @param {AST.AnimateDirective} node
 * @param {ComponentContext} context
 */
export function AnimateDirective(node, context) {
	const expression =
		node.expression === null
			? b.null
			: b.thunk(/** @type {Expression} */ (context.visit(node.expression)));

	// in after_update to ensure it always happens after bind:this
	let statement = b.stmt(
		b.call(
			'$.animation',
			context.state.node,
			b.thunk(/** @type {Expression} */ (context.visit(parse_directive_name(node.name)))),
			expression
		)
	);

	if (node.metadata.expression.is_async()) {
		statement = b.stmt(
			b.call(
				'$.run_after_blockers',
				node.metadata.expression.blockers(),
				b.thunk(b.block([statement]))
			)
		);
	}

	context.state.after_update.push(statement);
}
