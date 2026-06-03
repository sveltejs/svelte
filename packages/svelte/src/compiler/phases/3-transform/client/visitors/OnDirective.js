/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_event, build_event_handler } from './shared/events.js';

const modifiers = /** @type {const} */ ([
	'stopPropagation',
	'stopImmediatePropagation',
	'preventDefault',
	'self',
	'trusted',
	'once'
]);

/**
 * @param {AST.OnDirective} node
 * @param {ComponentContext} context
 */
export function OnDirective(node, context) {
	if (!node.expression) {
		context.state.analysis.needs_props = true;
	}

	let handler = build_event_handler(node.expression, node.metadata.expression, context);

	for (const modifier of modifiers) {
		if (node.modifiers.includes(modifier)) {
			handler = b.call('$.' + modifier, handler);
		}
	}

	const capture = node.modifiers.includes('capture');
	const passive =
		node.modifiers.includes('passive') ||
		(node.modifiers.includes('nonpassive') ? false : undefined);

	return build_event(context, node.name, handler, capture, passive, false);
}
