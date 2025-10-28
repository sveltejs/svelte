/** @import { ArrowFunctionExpression, BlockStatement, Declaration, Expression, FunctionDeclaration, FunctionExpression, Statement, VariableDeclaration } from 'estree' */
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

	/** @type {BlockStatement['body']} */
	const body = [];
	for (const child of node.body) {
		const visited = /** @type {Declaration | Statement} */ (context.visit(child));
		if (
			visited.type === 'ClassDeclaration' &&
			'metadata' in visited &&
			visited.metadata !== null &&
			typeof visited.metadata === 'object' &&
			'computed_field_declarations' in visited.metadata
		) {
			body.push(
				.../** @type {VariableDeclaration[]} */ (visited.metadata.computed_field_declarations)
			);
		}
		body.push(visited);
	}

	if (tracing !== null) {
		const parent =
			/** @type {ArrowFunctionExpression | FunctionDeclaration | FunctionExpression} */ (
				context.path.at(-1)
			);

		const is_async = parent.async;

		const call = b.call(
			'$.trace',
			/** @type {Expression} */ (tracing),
			b.thunk(b.block(body), is_async)
		);

		return b.block([b.return(is_async ? b.await(call) : call)]);
	}
	return b.block(body);
}
