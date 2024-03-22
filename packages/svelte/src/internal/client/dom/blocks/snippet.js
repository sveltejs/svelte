import { render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';
import { untrack } from '../../runtime.js';

/**
 * @template {(node: import('#client').TemplateNode, ...args: any[]) => import('#client').Dom} SnippetFn
 * @param {() => SnippetFn | null | undefined} get_snippet
 * @param {import('#client').TemplateNode} node
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet(get_snippet, node, ...args) {
	/** @type {SnippetFn | null | undefined} */
	var snippet_fn;

	render_effect(() => {
		if (snippet_fn === (snippet_fn = get_snippet())) return;

		if (snippet_fn) {
			// Untrack so we only rerender when the snippet function itself changes,
			// not when an eagerly-read prop inside the snippet function changes
			var dom = untrack(() => /** @type {SnippetFn} */ (snippet_fn)(node, ...args));
		}

		return () => {
			if (dom !== undefined) {
				remove(dom);
			}
		};
	});
}
