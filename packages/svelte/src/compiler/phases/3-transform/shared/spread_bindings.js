/** @import { Expression, MemberExpression, SequenceExpression, SpreadElement, Literal, Super, UpdateExpression, ExpressionStatement } from 'estree' */
/** @import { ComponentClientTransformState } from '../client/types.js' */
/** @import { ComponentServerTransformState } from '../server/types.js' */
import * as b from '#compiler/builders';

/**
 * Handles SpreadElement by creating a variable declaration and returning getter/setter expressions
 * @param {SpreadElement} spread_expression
 * @param {ComponentClientTransformState | ComponentServerTransformState} state
 * @param {function} visit
 * @returns {{get: Expression, set: Expression}}
 */
export function handle_spread_binding(spread_expression, state, visit) {
	// Generate a unique variable name for this spread binding
	const id = b.id(state.scope.generate('$$bindings'));

	const visited_expression = /** @type {Expression} */ (visit(spread_expression.argument));
	state.init.push(b.const(id, visited_expression));

	// Create conditional expressions that work for both arrays and objects
	// Array.isArray($$bindings) ? $$bindings[0] : $$bindings.get
	const get = b.conditional(
		b.call('Array.isArray', id),
		b.member(id, b.literal(0), true),
		b.member(id, b.id('get'))
	);

	// Array.isArray($$bindings) ? $$bindings[1] : $$bindings.set
	const set = b.conditional(
		b.call('Array.isArray', id),
		b.member(id, b.literal(1), true),
		b.member(id, b.id('set'))
	);

	return { get, set };
}
