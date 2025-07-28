/** @import { CallExpression, Expression, SpreadElement, Super } from 'estree' */
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

	const noop = b.arrow([], b.block([]));

	// Generate helper variables for clearer error messages
	const get = b.id(state.scope.generate(id.name + '_get'));
	const set = b.id(state.scope.generate(id.name + '_set'));

	const getter = b.logical(
		'??',
		b.conditional(
			b.call('Array.isArray', id),
			b.member(id, b.literal(0), true),
			b.member(id, b.id('get'))
		),
		noop
	);
	const setter = b.logical(
		'??',
		b.conditional(
			b.call('Array.isArray', id),
			b.member(id, b.literal(1), true),
			b.member(id, b.id('set'))
		),
		noop
	);

	state.init.push(b.const(get, getter));
	state.init.push(b.const(set, setter));

	return { get, set };
}
