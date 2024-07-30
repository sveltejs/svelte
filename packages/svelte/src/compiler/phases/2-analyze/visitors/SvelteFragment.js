/** @import { SvelteFragment } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { validate_slot_attribute } from './shared/attribute.js';

/**
 * @param {SvelteFragment} node
 * @param {Context} context
 */
export function SvelteFragment(node, context) {
	const parent = context.path.at(-2);
	if (parent?.type !== 'Component' && parent?.type !== 'SvelteComponent') {
		e.svelte_fragment_invalid_placement(node);
	}

	for (const attribute of node.attributes) {
		if (attribute.type === 'Attribute') {
			if (attribute.name === 'slot') {
				validate_slot_attribute(context, attribute);
			}
		} else if (attribute.type !== 'LetDirective') {
			e.svelte_fragment_invalid_attribute(attribute);
		}
	}

	context.next({ ...context.state, parent_element: null });
}
