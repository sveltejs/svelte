/** @import { Pattern } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
/** @import { ExpressionMetadata } from '../../../nodes.js' */
import { dev } from '../../../../state.js';
import { extract_identifiers } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';
import { create_derived } from '../utils.js';
import { get_value } from './shared/declarations.js';
import { build_expression } from './shared/utils.js';

/**
 * @param {AST.ConstTag} node
 * @param {ComponentContext} context
 */
export function ConstTag(node, context) {
	const declaration = node.declaration.declarations[0];
	// TODO we can almost certainly share some code with $derived(...)
	if (declaration.id.type === 'Identifier') {
		const init = build_expression(context, declaration.init, node.metadata.expression);

		let expression = create_derived(context.state, init, node.metadata.expression.has_await);

		if (dev) {
			expression = b.call('$.tag', expression, b.literal(declaration.id.name));
		}

		context.state.transform[declaration.id.name] = { read: get_value };

		add_const_declaration(
			context.state,
			declaration.id,
			expression,
			node.metadata.expression,
			context.state.scope.get_bindings(declaration)
		);
	} else {
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

		add_const_declaration(
			context.state,
			tmp,
			expression,
			node.metadata.expression,
			context.state.scope.get_bindings(declaration)
		);

		for (const node of identifiers) {
			context.state.transform[node.name] = {
				read: (node) => b.member(b.call('$.get', tmp), node)
			};
		}
	}
}

/**
 * @param {ComponentContext['state']} state
 * @param {import('estree').Identifier} id
 * @param {import('estree').Expression} expression
 * @param {ExpressionMetadata} metadata
 * @param {import('#compiler').Binding[]} bindings
 */
function add_const_declaration(state, id, expression, metadata, bindings) {
	// we need to eagerly evaluate the expression in order to hit any
	// 'Cannot access x before initialization' errors
	const after = dev ? [b.stmt(b.call('$.get', id))] : [];

	const has_await = metadata.has_await;
	const blockers = [...metadata.dependencies].map((dep) => dep.blocker).filter((b) => b !== null);

	if (has_await || state.async_consts || blockers.length > 0) {
		const run = (state.async_consts ??= {
			id: b.id(state.scope.generate('promises')),
			thunks: []
		});

		state.consts.push(b.let(id));

		const assignment = b.assignment('=', id, expression);
		const body = after.length === 0 ? assignment : b.block([b.stmt(assignment), ...after]);

		if (blockers.length > 0) run.thunks.push(b.thunk(b.call('Promise.all', b.array(blockers))));

		run.thunks.push(b.thunk(body, has_await));

		const blocker = b.member(run.id, b.literal(run.thunks.length - 1), true);

		for (const binding of bindings) {
			binding.blocker = blocker;
		}
	} else {
		state.consts.push(b.const(id, expression));
		state.consts.push(...after);
	}
}
