/** @import { TitleElement, Text } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_template_literal } from './shared/utils.js';

/**
 * @param {TitleElement} node
 * @param {ComponentContext} context
 */
export function TitleElement(node, context) {
	let has_state = node.fragment.nodes.some(
		(node) => node.type === 'ExpressionTag' && node.metadata.expression.has_state
	);

	const value = build_template_literal(
		/** @type {any} */ (node.fragment.nodes),
		context.visit,
		context.state
	)[1];

	const statement = b.stmt(b.assignment('=', b.member(b.id('$.document'), b.id('title')), value));

	if (has_state) {
		context.state.update.push(statement);
	} else {
		context.state.init.push(statement);
	}
}
