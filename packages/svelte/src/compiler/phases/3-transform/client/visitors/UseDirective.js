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
	let action = /** @type {Expression} */ (context.visit(parse_directive_name(node.name)));
	if (action.type === 'MemberExpression') {
		action = b.maybe_call(
			b.member(action, 'bind', false, true),
			/** @type {Expression} */ (action.object)
		);
	}

	const get_action = b.arrow([], action);
	const get_value = node.expression
		? b.thunk(/** @type {Expression} */ (context.visit(node.expression)))
		: undefined;

	// actions need to run after attribute updates in order with bindings/events
	context.state.after_update.push(
		b.stmt(b.call('$.action', context.state.node, get_action, get_value))
	);
	context.next();
}
