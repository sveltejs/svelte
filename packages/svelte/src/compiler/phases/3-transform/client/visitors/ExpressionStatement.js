/** @import { Expression, ExpressionStatement, Node, Program } from 'estree' */
/** @import { ComponentContext, ParallelizedChunk } from '../types' */
import * as b from '#compiler/builders';
import { get_rune } from '../../../scope.js';
import { can_be_parallelized } from '../utils.js';

/**
 * @param {ExpressionStatement} node
 * @param {ComponentContext} context
 */
export function ExpressionStatement(node, context) {
	const parent = /** @type {Node} */ (context.path.at(-1));
	const position = /** @type {Program} */ (parent).body?.indexOf?.(node);
	if (node.expression.type === 'CallExpression') {
		const rune = get_rune(node.expression, context.state.scope);

		if (rune === '$effect' || rune === '$effect.pre') {
			const callee = rune === '$effect' ? '$.user_effect' : '$.user_pre_effect';
			const func = /** @type {Expression} */ (context.visit(node.expression.arguments[0]));

			const expr = b.call(callee, /** @type {Expression} */ (func));
			expr.callee.loc = node.expression.callee.loc; // ensure correct mapping

			return b.stmt(expr);
		}

		if (rune === '$inspect.trace') {
			return b.empty;
		}
	}
	if (
		node.expression.type === 'AwaitExpression' &&
		context.state.analysis.instance?.scope === context.state.scope
	) {
		const current_chunk = context.state.current_parallelized_chunk;
		const parallelize = can_be_parallelized(
			node.expression.argument,
			context.state.scope,
			context.state.analysis,
			current_chunk?.bindings ?? []
		);
		if (parallelize) {
			const declarator = {
				id: null,
				init: /** @type {Expression} */ (context.visit(node.expression.argument))
			};
			if (current_chunk) {
				current_chunk.declarators.push(declarator);
				current_chunk.position = position;
			} else {
				/** @type {ParallelizedChunk} */
				const chunk = {
					kind: null,
					declarators: [declarator],
					position,
					bindings: []
				};
				context.state.current_parallelized_chunk = chunk;
				context.state.parallelized_chunks.push(chunk);
			}
			return;
		}
	}

	context.next();
}
