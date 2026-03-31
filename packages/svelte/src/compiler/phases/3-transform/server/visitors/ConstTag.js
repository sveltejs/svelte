/** @import { Expression, Identifier, Pattern, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { extract_identifiers, object } from '../../../../utils/ast.js';

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 * @returns {Statement[]}
 */
export function serialize_sync_const_tag(node, context) {
	const serialized = serialize_const_tag(node, context);
	return [b.const(serialized.id, serialized.init)];
}

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 * @param {Identifier} promise_id
 * @returns {{ declarations: Statement[]; thunk: Expression }}
 */
export function serialize_async_const_tag(node, context, promise_id) {
	const serialized = serialize_const_tag(node, context);
	const blockers = [...node.metadata.expression.dependencies]
		.map((dep) => dep.blocker)
		.filter((b) => b !== null && object(b) !== promise_id);

	/** @type {Statement | undefined} */
	let promise_stmt;

	if (blockers.length === 1) {
		promise_stmt = b.stmt(b.await(/** @type {Expression} */ (blockers[0])));
	} else if (blockers.length > 0) {
		promise_stmt = b.stmt(b.await(b.call('Promise.all', b.array(blockers))));
	}

	const assignment = b.assignment('=', serialized.id, serialized.init);
	const thunk = promise_stmt
		? b.thunk(b.block([promise_stmt, b.stmt(assignment)]), true)
		: b.thunk(assignment, node.metadata.expression.has_await);

	return {
		declarations: extract_identifiers(serialized.declaration).map((identifier) =>
			b.let(identifier.name)
		),
		thunk
	};
}

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 */
function serialize_const_tag(node, context) {
	const declaration = node.declaration.declarations[0];
	const id = /** @type {Pattern} */ (context.visit(declaration.id));
	const init = /** @type {Expression} */ (context.visit(declaration.init));
	return { id, declaration: declaration.id, init };
}
