/** @import { OnDirective, SvelteNode } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_event, build_event_handler } from './shared/events.js';

/**
 * @param {OnDirective} node
 * @param {ComponentContext} context
 */
export function OnDirective(node, context) {
	if (!node.expression) {
		context.state.analysis.needs_props = true;
	}

	let handler = build_event_handler(
		node.modifiers,
		node.expression,
		node.metadata.expression,
		context
	);

	return b.call('$.event', b.literal(node.name), context.state.node, handler);
}
