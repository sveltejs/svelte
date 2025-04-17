/** @import { ArrowFunctionExpression, BlockStatement, Expression, FunctionDeclaration, FunctionExpression, Statement } from 'estree' */
/** @import { ComponentContext } from '../types' */
import { add_state_transformers } from './shared/declarations.js';
import * as b from '#compiler/builders';

/**
 * @param {BlockStatement} node
 * @param {ComponentContext} context
 */
export function BlockStatement(node, context) {
	add_state_transformers(context);
	const tracing = context.state.scope.tracing;

	if (tracing !== null) {
		const parent =
			/** @type {ArrowFunctionExpression | FunctionDeclaration | FunctionExpression} */ (
				context.path.at(-1)
			);

		const is_async = parent.async;

		const call = b.call(
			'$.trace',
			/** @type {Expression} */ (tracing),
			b.thunk(b.block(node.body.map((n) => /** @type {Statement} */ (context.visit(n)))), is_async)
		);

		return b.block([b.return(is_async ? b.await(call) : call)]);
	}

	context.next();
}
