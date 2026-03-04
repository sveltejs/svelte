/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { parse_directive_name } from './shared/utils.js';

/**
 * @param {AST.UseDirective} node
 * @param {ComponentContext} context
 */
export function UseDirective(node, context) {
	const params = [b.id('$$node')];

	if (node.expression) {
		params.push(b.id('$$action_arg'));
	}

	/** @type {Expression[]} */
	const args = [
		context.state.node,
		b.arrow(
			params,
			b.maybe_call(
				/** @type {Expression} */ (context.visit(parse_directive_name(node.name))),
				...params
			)
		)
	];

	if (node.expression) {
		args.push(b.thunk(/** @type {Expression} */ (context.visit(node.expression))));
	}

	// actions need to run after attribute updates in order with bindings/events
	let statement = b.stmt(b.call('$.action', ...args));

	if (node.metadata.expression.is_async()) {
		statement = b.stmt(
			b.call(
				'$.run_after_blockers',
				node.metadata.expression.blockers(),
				b.thunk(b.block([statement]))
			)
		);
	}

	context.state.init.push(statement);
	context.next();
}
