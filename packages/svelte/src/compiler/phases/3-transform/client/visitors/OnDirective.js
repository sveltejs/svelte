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
	const handler = node.expression
		? build_event(
				node.name,
				node.modifiers,
				node.expression,
				null,
				node.metadata.expression,
				context
			)
		: b.call(
				'$.event',
				b.literal(node.name),
				context.state.node,
				build_event_handler(node.modifiers, node.expression, null, context)
			);

	const parent = /** @type {SvelteNode} */ (context.path.at(-1));
	const has_action_directive =
		parent.type === 'RegularElement' && parent.attributes.find((a) => a.type === 'UseDirective');
	const statement = b.stmt(has_action_directive ? b.call('$.effect', b.thunk(handler)) : handler);

	// TODO put this logic in the parent visitor?
	if (
		parent.type === 'SvelteDocument' ||
		parent.type === 'SvelteWindow' ||
		parent.type === 'SvelteBody'
	) {
		// These nodes are above the component tree, and its events should run parent first
		context.state.before_init.push(statement);
	} else {
		context.state.after_update.push(statement);
	}
}
