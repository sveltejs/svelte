/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { is_event_attribute } from '../../../utils/ast.js';
import { disallow_children } from './shared/special-element.js';

/**
 * @param {AST.SvelteBody} node
 * @param {Context} context
 */
export function SvelteBody(node, context) {
	disallow_children(node);
	for (const attribute of node.attributes) {
		if (
			attribute.type === 'SpreadAttribute' ||
			(attribute.type === 'Attribute' && !is_event_attribute(attribute))
		) {
			e.svelte_body_illegal_attribute(attribute);
		}
	}
	context.next();
}
