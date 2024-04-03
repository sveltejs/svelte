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

const snippet_symbol = Symbol.for('svelte.snippet');

/**
 * @param {any} fn
 */
export function add_snippet_symbol(fn) {
	fn[snippet_symbol] = true;
	return fn;
}

/**
 * Returns true if given parameter is a snippet.
 * @param {any} maybeSnippet
 * @returns {maybeSnippet is import('svelte').Snippet}
 */
export function is_snippet(maybeSnippet) {
	return /** @type {any} */ (maybeSnippet)?.[snippet_symbol] === true;
}
