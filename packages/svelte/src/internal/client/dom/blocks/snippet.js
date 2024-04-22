import { EFFECT_TRANSPARENT } from '../../constants.js';
import { branch, block, destroy_effect } from '../../reactivity/effects.js';

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

	/** @type {import('#client').Effect | null} */
	var snippet_effect;

	block(() => {
		if (snippet === (snippet = get_snippet())) return;

		if (snippet_effect) {
			destroy_effect(snippet_effect);
			snippet_effect = null;
		}

		if (snippet) {
			snippet_effect = branch(() => /** @type {SnippetFn} */ (snippet)(node, ...args));
		}
	}, EFFECT_TRANSPARENT);
}
