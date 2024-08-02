/** @import { OnDirective } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { build_event } from './shared/element.js';

/**
 * @param {OnDirective} node
 * @param {ComponentContext} context
 */
export function OnDirective(node, context) {
	build_event(
		node.name,
		node.modifiers,
		node.expression,
		null,
		node.metadata.expression,
		context,
		true
	);
}
