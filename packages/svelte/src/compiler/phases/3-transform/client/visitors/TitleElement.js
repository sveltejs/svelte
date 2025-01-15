/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_template_chunk } from './shared/utils.js';

/**
 * @param {AST.TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	const { has_state, is_async, value } = build_template_chunk(
		/** @type {any} */ (node.fragment.nodes),
		context.visit,
		context.state
	);

	const statement = b.stmt(b.assignment('=', b.id('$.document.title'), value));

	if (has_state) {
		context.state.update.push(statement);
		context.state.metadata.update_is_async ||= is_async;
	} else {
		if (is_async) {
			throw new Error('TODO top-level await');
		}

		context.state.init.push(statement);
	}
}
