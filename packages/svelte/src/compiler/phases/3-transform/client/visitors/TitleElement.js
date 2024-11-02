/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_template_literal } from './shared/utils.js';

/**
 * @param {AST.TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	const { has_state, value } = build_template_literal(
		/** @type {any} */ (node.fragment.nodes),
		context.visit,
		context.state
	);

	context.state.init.push(b.stmt(b.call('$.title', value)));

	if (has_state) {
		const statement = b.stmt(b.assignment('=', b.id('$.document.title'), value));
		context.state.update.push(statement);
	}
}
