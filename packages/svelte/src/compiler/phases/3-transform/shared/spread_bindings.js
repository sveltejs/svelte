/** @import { Expression } from 'estree' */
/** @import { ComponentContext as ClientContext } from '../client/types.js' */
/** @import { ComponentContext as ServerContext } from '../server/types.js' */
import * as b from '#compiler/builders';
import { dev, source } from '../../../state.js';

/**
 * Initializes spread bindings for a SpreadElement in a bind directive.
 * @param {Expression} spread_expression
 * @param {ClientContext | ServerContext} context
 * @returns {[get: Expression, set: Expression]}
 */
export function init_spread_bindings(spread_expression, { state, visit }) {
	const expression = /** @type {Expression} */ (visit(spread_expression));
	const expression_text = b.literal(source.slice(spread_expression.start, spread_expression.end));

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

	const is_server = state.options.generate === 'server';
	const binding = is_server ? b.call(id) : b.call('$.get', id);

	return [
		b.thunk(b.call(b.logical('??', b.member(binding, b.literal(0), true), b.id('$.noop')))),
		b.arrow(
			[b.id('$$value')],
			b.call(
				b.logical('??', b.member(binding, b.literal(1), true), b.id('$.noop')),
				b.id('$$value')
			)
		)
	];
}
