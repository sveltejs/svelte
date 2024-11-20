/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { disallow_children } from './shared/special-element.js';
import * as e from '../../../errors.js';
import { is_event_attribute } from '../../../utils/ast.js';

/**
 * @param {AST.SvelteWindow} node
 * @param {Context} context
 */
export function SvelteWindow(node, context) {
	disallow_children(node);

	for (const attribute of node.attributes) {
		if (
			attribute.type === 'SpreadAttribute' ||
			(attribute.type === 'Attribute' && !is_event_attribute(attribute))
		) {
			e.illegal_element_attribute(attribute, 'svelte:window');
		}
	}

	context.next();
}
