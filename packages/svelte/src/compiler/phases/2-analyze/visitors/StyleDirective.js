/** @import { StyleDirective } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {StyleDirective} node
 * @param {Context} context
 */
export function StyleDirective(node, context) {
	if (node.modifiers.length > 1 || (node.modifiers.length && node.modifiers[0] !== 'important')) {
		e.style_directive_invalid_modifier(node);
	}

	context.next();
}
