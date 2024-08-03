/** @import { OnDirective, SvelteNode } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_event } from './shared/element.js';
import { build_event_handler } from './shared/utils.js';

/**
 * @param {OnDirective} node
 * @param {ComponentContext} context
 */
export function OnDirective(node, context) {
	return node.expression
		? build_event(node.name, node.modifiers, node.expression, node.metadata.expression, context)
		: b.call(
				'$.event',
				b.literal(node.name),
				context.state.node,
				build_event_handler(node.modifiers, node.expression, null, context)
			);
}
