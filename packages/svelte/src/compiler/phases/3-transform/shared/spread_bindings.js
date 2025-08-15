/** @import { Expression } from 'estree' */
/** @import { ComponentContext as ClientContext } from '../client/types.js' */
/** @import { ComponentContext as ServerContext } from '../server/types.js' */
import * as b from '#compiler/builders';
import { dev, source } from '../../../state.js';

/**
 * Initializes spread bindings for a SpreadElement in a bind directive.
 * @param {Expression} spread_expression
 * @param {ClientContext | ServerContext} context
 * @returns {{ get: Expression, set: Expression }}
 */
export function init_spread_bindings(spread_expression, { state, visit }) {
	const expression = /** @type {Expression} */ (visit(spread_expression));
	const expression_text = dev
		? b.literal(source.slice(spread_expression.start, spread_expression.end))
		: undefined;

	const id = state.scope.generate('$$spread_binding');
	const get = b.id(id + '_get');
	const set = b.id(id + '_set');
	state.init.push(
		b.const(
			b.array_pattern([get, set]),
			b.call('$.validate_spread_bindings', expression, expression_text)
		)
	);

	return { get, set };
}
