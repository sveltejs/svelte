/** @import { Expression, Pattern, Statement } from 'estree' */
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
	const blockers = [...node.metadata.expression.dependencies]
		.map((dep) => dep.blocker)
		.filter((b) => b !== null && b.object !== context.state.async_consts?.id);

	if (node.metadata.promises_id) {
		const run = (context.state.async_consts ??= {
			id: node.metadata.promises_id,
			thunks: []
		});

		const identifiers = extract_identifiers(declaration.id);

		for (const identifier of identifiers) {
			context.state.init.push(b.let(identifier.name));
		}

		if (blockers.length === 1) {
			run.thunks.push(b.thunk(/** @type {Expression} */ (blockers[0])));
		} else if (blockers.length > 0) {
			run.thunks.push(b.thunk(b.call('Promise.all', b.array(blockers))));
		}

		// keep the number of thunks pushed in sync with ConstTag in analysis phase
		const assignment = b.assignment('=', id, init);
		run.thunks.push(b.thunk(assignment, node.metadata.expression.has_await));
	} else {
		context.state.init.push(b.const(id, init));
	}
}
