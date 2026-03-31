/** @import { Expression, Identifier, Pattern, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { dev } from '../../../../state.js';
import { extract_identifiers, object } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { create_derived } from '../utils.js';
import { get_value } from './shared/declarations.js';
import { build_expression } from './shared/utils.js';

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 * @returns {Statement[]}
 */
export function serialize_sync_const_tag(node, context) {
	const serialized = serialize_const_tag(node, context);

	/** @type {Statement[]} */
	const statements = [b.const(serialized.id, serialized.expression)];

	// we need to eagerly evaluate the expression in order to hit any
	// 'Cannot access x before initialization' errors
	if (dev) {
		statements.push(b.stmt(b.call('$.get', serialized.id)));
	}

	return statements;
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
		promise_stmt = b.stmt(b.await(b.member(/** @type {Expression} */ (blockers[0]), 'promise')));
	} else if (blockers.length > 0) {
		promise_stmt = b.stmt(b.await(b.call('$.wait', b.array(blockers))));
	}

	const assignment = b.assignment('=', serialized.id, serialized.expression);
	const thunk = promise_stmt
		? b.thunk(b.block([promise_stmt, b.stmt(assignment)]), true)
		: b.thunk(assignment, node.metadata.expression.has_await);

	return {
		declarations: [b.let(serialized.id)],
		thunk
	};
}

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 */
function serialize_const_tag(node, context) {
	const declaration = node.declaration.declarations[0];
	// TODO we can almost certainly share some code with $derived(...)
	if (declaration.id.type === 'Identifier') {
		const init = build_expression(context, declaration.init, node.metadata.expression);

		let expression = create_derived(context.state, init, node.metadata.expression.has_await);

		if (dev) {
			expression = b.call('$.tag', expression, b.literal(declaration.id.name));
		}

		context.state.transform[declaration.id.name] = { read: get_value };
		return { id: declaration.id, expression };
	}

	const identifiers = extract_identifiers(declaration.id);
	const tmp = b.id(context.state.scope.generate('computed_const'));
	const transform = { ...context.state.transform };

	// Make all identifiers that are declared within the following computed regular
	// variables, as they are not signals in that context yet
	for (const node of identifiers) {
		delete transform[node.name];
	}

	const child_state = /** @type {ComponentContext['state']} */ ({
		...context.state,
		transform
	});

	// TODO optimise the simple `{ x } = y` case — we can just return `y`
	// instead of destructuring it only to return a new object
	const init = build_expression(
		{ ...context, state: child_state },
		declaration.init,
		node.metadata.expression
	);

	const block = b.block([
		b.const(/** @type {Pattern} */ (context.visit(declaration.id, child_state)), init),
		b.return(b.object(identifiers.map((node) => b.prop('init', node, node))))
	]);

	let expression = create_derived(context.state, block, node.metadata.expression.has_await);

	if (dev) {
		expression = b.call('$.tag', expression, b.literal('[@const]'));
	}

	for (const node of identifiers) {
		context.state.transform[node.name] = {
			read: (node) => b.member(b.call('$.get', tmp), node)
		};
	}

	return { id: tmp, expression };
}
