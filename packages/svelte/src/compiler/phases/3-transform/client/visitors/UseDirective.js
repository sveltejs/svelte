/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
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
			b.call(/** @type {Expression} */ (context.visit(parse_directive_name(node.name))), ...params)
		)
	];

	if (node.expression) {
		args.push(b.thunk(/** @type {Expression} */ (context.visit(node.expression))));
	}

	// actions need to run after attribute updates in order with bindings/events
	context.state.after_update.push(b.stmt(b.call('$.action', ...args)));
	context.next();
}
