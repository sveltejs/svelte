/** @import { LetDirective } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';

/**
 * @param {LetDirective} node
 * @param {Context} context
 */
export function LetDirective(node, context) {
	const parent = context.path.at(-1);

	if (
		parent === undefined ||
		(parent.type !== 'Component' &&
			parent.type !== 'RegularElement' &&
			parent.type !== 'SlotElement' &&
			parent.type !== 'SvelteElement' &&
			parent.type !== 'SvelteComponent' &&
			parent.type !== 'SvelteSelf' &&
			parent.type !== 'SvelteFragment')
	) {
		e.let_directive_invalid_placement(node);
	}
}
