/** @import { Expression, SpreadElement } from 'estree' */
/** @import { ComponentContext as ClientContext } from '../../types.js' */
import * as b from '#compiler/builders';
import { dev, source } from '../../../../../state.js';

/**
 * Initializes spread bindings for a SpreadElement in a bind directive.
 * @param {SpreadElement} spread
 * @param {ClientContext} context
 * @returns {[get: Expression, set: Expression]}
 */
export function init_spread_binding(spread, { state, visit }) {
	const expression = /** @type {Expression} */ (visit(spread.argument));
	const expression_text = b.literal(source.slice(spread.start, spread.end));

	const id = b.id(state.scope.generate('$$spread_binding'));
	state.init.push(
		b.const(
			id,
			b.call(
				'$.derived',
				b.thunk(dev ? b.call('$.validate_spread_binding', expression, expression_text) : expression)
			)
		)
	);

	const binding = b.call('$.get', id);

	return [
		b.thunk(b.call(b.logical('??', b.member(binding, b.literal(0), true), b.id('$.noop')))),
		b.arrow([b.id('$$value')], b.call(b.member(binding, b.literal(1), true), b.id('$$value')))
	];
}
