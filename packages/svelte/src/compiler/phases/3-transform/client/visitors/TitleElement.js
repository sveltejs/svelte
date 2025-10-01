/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_template_chunk } from './shared/utils.js';

/**
 * @param {AST.TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	const { has_state, value } = build_template_chunk(
		/** @type {any} */ (node.fragment.nodes),
		context
	);
	const evaluated = context.state.scope.evaluate(value);

	const statement = b.stmt(
		b.assignment(
			'=',
			b.id('$.document.title'),
			evaluated.is_known
				? b.literal(evaluated.value)
				: evaluated.is_defined
					? value
					: b.logical('??', value, b.literal(''))
		)
	);

	if (has_state) {
		context.state.update.push(statement);
	} else {
		context.state.init.push(statement);
	}
}
