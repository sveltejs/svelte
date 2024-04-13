import { branch, render_effect } from '../../reactivity/effects.js';

/**
 * @template {(node: import('#client').TemplateNode, ...args: any[]) => import('#client').Dom} SnippetFn
 * @param {() => SnippetFn | null | undefined} get_snippet
 * @param {import('#client').TemplateNode} node
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet(get_snippet, node, ...args) {
	/** @type {SnippetFn | null | undefined} */
	var snippet;

	render_effect(() => {
		if (snippet === (snippet = get_snippet())) return;

		if (snippet) {
			branch(() => /** @type {SnippetFn} */ (snippet)(node, ...args));
		}
	});
}
