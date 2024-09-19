/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { visit_component } from './shared/component.js';
import * as e from '../../../errors.js';
import * as w from '../../../warnings.js';
import { filename } from '../../../state.js';

/**
 * @param {AST.SvelteSelf} node
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

	if (context.state.analysis.runes) {
		const name = filename === '(unknown)' ? 'Self' : context.state.analysis.name;
		const basename =
			filename === '(unknown)'
				? 'Self.svelte'
				: /** @type {string} */ (filename.split(/[/\\]/).pop());

		w.svelte_self_deprecated(node, name, basename);
	}

	visit_component(node, context);
}
