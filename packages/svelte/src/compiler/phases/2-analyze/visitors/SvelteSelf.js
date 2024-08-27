/** @import { SvelteSelf } from '#compiler' */
/** @import { Context } from '../types' */
import { visit_component } from './shared/component.js';
import * as e from '../../../errors.js';

/**
 * @param {SvelteSelf} node
 * @param {Context} context
 */
export function SvelteSelf(node, context) {
	const valid = context.path.some(
		(node) =>
			node.type === 'IfBlock' ||
			node.type === 'EachBlock' ||
			node.type === 'Component' ||
			node.type === 'SnippetBlock'
	);

	if (!valid) {
		e.svelte_self_invalid_placement(node);
	}

	visit_component(node, context);
}
