/** @import { Expression, Pattern } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { extract_identifiers } from '../../../../utils/ast.js';

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 */
export function ConstTag(node, context) {
	const declaration = node.declaration.declarations[0];
	const id = /** @type {Pattern} */ (context.visit(declaration.id));
	const init = /** @type {Expression} */ (context.visit(declaration.init));
	const has_await = node.metadata.expression.has_await;

	if (has_await || context.state.async_consts) {
		const run = (context.state.async_consts ??= {
			id: b.id(context.state.scope.generate('promises')),
			thunks: []
		});

		const identifiers = extract_identifiers(declaration.id);
		const bindings = context.state.scope.get_bindings(declaration);

		for (const identifier of identifiers) {
			context.state.init.push(b.let(identifier.name));
		}

		const assignment = b.assignment('=', id, init);
		run.thunks.push(b.thunk(b.block([b.stmt(assignment)]), has_await));

		const blocker = b.member(run.id, b.literal(run.thunks.length - 1), true);
		for (const binding of bindings) {
			binding.blocker = blocker;
		}
	} else {
		context.state.init.push(b.const(id, init));
	}
}
