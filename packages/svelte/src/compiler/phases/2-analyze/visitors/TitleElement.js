/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {AST.TitleElement} node
 * @param {Context} context
 */
export function TitleElement(node, context) {
	for (const attribute of node.attributes) {
		e.title_illegal_attribute(attribute);
	}

	for (const child of node.fragment.nodes) {
		if (child.type !== 'Text' && child.type !== 'ExpressionTag') {
			e.title_invalid_content(child);
		}
	}

	context.visit(node.fragment);
}
