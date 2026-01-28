/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../../types' */
import * as b from '#compiler/builders';

/**
 *
 * @param {AST.SvelteBody | AST.SvelteDocument | AST.SvelteWindow} node
 * @param {string} id
 * @param {ComponentContext} context
 */
export function visit_special_element(node, id, context) {
	const state = { ...context.state, node: b.id(id) };

	for (const attribute of node.attributes) {
		if (attribute.type === 'OnDirective') {
			context.state.init.push(b.stmt(/** @type {Expression} */ (context.visit(attribute, state))));
		} else {
			context.visit(attribute, state);
		}
	}
}
