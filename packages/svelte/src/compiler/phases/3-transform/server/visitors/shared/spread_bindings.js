/** @import { Expression, SpreadElement } from 'estree' */
/** @import { ComponentContext as ServerContext } from '../../types.js' */
import * as b from '#compiler/builders';
import { dev, source } from '../../../../../state.js';

/**
 * Initializes spread bindings for a SpreadElement in a bind directive.
 * @param {SpreadElement} spread
 * @param {ServerContext} context
 * @returns {[get: Expression, set: Expression]}
 */
export function init_spread_bindings(spread, { state, visit }) {
	const expression_text = b.literal(source.slice(spread.start, spread.end));

	let expression = /** @type {Expression} */ (visit(spread.argument));

	if (expression.type !== 'Identifier') {
		const id = b.id(state.scope.generate('$$spread_binding'));

		state.init.push(b.const(id, expression));
		expression = id;
	}

	if (dev) {
		state.init.push(b.stmt(b.call('$.validate_spread_binding', expression, expression_text)));
	}

	return [
		b.maybe_call(b.member(expression, b.literal(0), true)),
		b.call(b.member(expression, b.literal(1), true), b.id('$$value'))
	];
}
