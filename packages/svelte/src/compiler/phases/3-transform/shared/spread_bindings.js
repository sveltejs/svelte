/** @import { Expression, SpreadElement } from 'estree' */
/** @import { Context } from 'zimmerframe' */
/** @import { ComponentClientTransformState } from '../client/types.js' */
/** @import { ComponentServerTransformState } from '../server/types.js' */
/** @import { AST } from '#compiler' */
import * as b from '#compiler/builders';
import { dev, source } from '../../../state.js';

/**
 * Initializes spread bindings for a SpreadElement in a bind directive.
 * @param {SpreadElement} spread_expression
 * @param {Context<AST.SvelteNode, ComponentClientTransformState> | Context<AST.SvelteNode, ComponentServerTransformState>} context
 * @returns {{ get: Expression, set: Expression }}
 */
export function init_spread_bindings(spread_expression, { state, visit }) {
	const visited_expression = /** @type {Expression} */ (visit(spread_expression.argument));
	const expression_text = dev
		? b.literal(source.slice(spread_expression.argument.start, spread_expression.argument.end))
		: undefined;

	const id = state.scope.generate('$$spread_binding');
	const get = b.id(id + '_get');
	const set = b.id(id + '_set');
	state.init.push(
		b.const(
			b.array_pattern([get, set]),
			b.call('$.validate_spread_bindings', visited_expression, expression_text)
		)
	);

	return { get, set };
}
