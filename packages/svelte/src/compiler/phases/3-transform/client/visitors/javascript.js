import * as b from '../../../../utils/builders.js';
import { function_visitor, serialize_hoistable_params } from '../utils.js';

/** @type {import('../types.js').ComponentVisitors} */
export const javascript_visitors = {
	Program(node, { visit }) {
		return /** @type {import('estree').Program} */ ({
			...node,
			body: node.body.map((node) => /** @type {import('estree').Node} */ (visit(node)))
		});
	},
	BlockStatement(node, { visit }) {
		return /** @type {import('estree').BlockStatement} */ ({
			...node,
			body: node.body.map((node) => /** @type {import('estree').Node} */ (visit(node)))
		});
	},
	FunctionExpression: function_visitor,
	ArrowFunctionExpression: function_visitor,
	FunctionDeclaration(node, context) {
		const metadata = node.metadata;

		const state = { ...context.state, in_constructor: false };

		if (metadata?.hoistable === true) {
			const params = serialize_hoistable_params(node, context);

			context.state.hoisted.push(
				/** @type {import('estree').FunctionDeclaration} */ ({
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
};
