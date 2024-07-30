/** @import { ConstTag } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { validate_opening_tag } from './shared/utils.js';

/**
 * @param {ConstTag} node
 * @param {Context} context
 */
export function ConstTag(node, context) {
	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '@');
	}

	const parent = context.path.at(-1);
	const grand_parent = context.path.at(-2);

	if (
		parent?.type !== 'Fragment' ||
		(grand_parent?.type !== 'IfBlock' &&
			grand_parent?.type !== 'SvelteFragment' &&
			grand_parent?.type !== 'Component' &&
			grand_parent?.type !== 'SvelteComponent' &&
			grand_parent?.type !== 'EachBlock' &&
			grand_parent?.type !== 'AwaitBlock' &&
			grand_parent?.type !== 'SnippetBlock' &&
			((grand_parent?.type !== 'RegularElement' && grand_parent?.type !== 'SvelteElement') ||
				!grand_parent.attributes.some((a) => a.type === 'Attribute' && a.name === 'slot')))
	) {
		e.const_tag_invalid_placement(node);
	}

	context.next();
}
