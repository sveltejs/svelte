/** @import { Expression } from 'estree' */
/** @import { SvelteBody, SvelteDocument, SvelteWindow } from '#compiler' */
/** @import { ComponentContext } from '../../types' */
import { is_event_attribute } from '../../../../../utils/ast.js';
import * as b from '../../../../../utils/builders.js';

/**
 *
 * @param {SvelteBody | SvelteDocument | SvelteWindow} node
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
