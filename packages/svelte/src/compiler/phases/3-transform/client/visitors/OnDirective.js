/** @import { OnDirective } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { serialize_event } from './shared/element.js';

/**
 * @param {OnDirective} node
 * @param {ComponentContext} context
 */
export function OnDirective(node, context) {
	serialize_event(node, node.metadata.expression, context);
}
