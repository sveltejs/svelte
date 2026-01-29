/** @import { Expression, SpreadElement } from 'estree' */
/** @import { ComponentContext as ClientContext } from '../../types.js' */
import * as b from '#compiler/builders';
import { dev, source } from '../../../../../state.js';
import { get_value } from './declarations.js';

/**
 * Initializes spread bindings for a SpreadElement in a bind directive.
 * @param {SpreadElement} spread
 * @param {ClientContext} context
 * @returns {[get: Expression, set: Expression]}
 */
export function init_spread_binding(spread, { state, visit }) {
	const expression_text = b.literal(source.slice(spread.start, spread.end));
	let expression = /** @type {Expression} */ (visit(spread.argument));

	if (expression.type !== 'Identifier') {
		const id = b.id(state.scope.generate('$$spread_binding'));
		const arg = dev ? b.call('$.validate_spread_binding', expression, expression_text) : expression;

		state.init.push(b.const(id, b.call('$.derived', b.thunk(arg))));

		expression = get_value(id);
	} else if (dev) {
		state.init.push(b.stmt(b.call('$.validate_spread_binding', expression, expression_text)));
	}

	return [
		b.maybe_call(b.member(expression, b.literal(0), true)),
		b.call(b.member(expression, b.literal(1), true), b.id('$$value'))
	];
}
