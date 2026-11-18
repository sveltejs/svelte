/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { determine_slot } from '../../../utils/slot.js';

/**
 * @param {AST.LetDirective} node
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

	// an explicit `children` snippet replaces the default slot content, so the `let:`
	// directive would never be provided. if the component has a `slot` attribute, the
	// directive applies to the component itself instead, which is fine
	if (
		(parent.type === 'Component' ||
			parent.type === 'SvelteComponent' ||
			parent.type === 'SvelteSelf') &&
		!determine_slot(parent) &&
		parent.fragment.nodes.some(
			(child) => child.type === 'SnippetBlock' && child.expression.name === 'children'
		)
	) {
		const { expression } = node;
		const pattern =
			expression === null || (expression.type === 'Identifier' && expression.name === node.name)
				? node.name
				: `${node.name}: ${context.state.analysis.source.slice(expression.start, expression.end)}`;

		e.let_directive_snippet_conflict(node, pattern);
	}
}
