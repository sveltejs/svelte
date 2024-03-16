import { SNIPPET_BLOCK } from '../../constants.js';
import { render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';
import { current_block, untrack } from '../../runtime.js';

/**
 * @param {() => Function | null | undefined} get_snippet
 * @param {Node} node
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet(get_snippet, node, ...args) {
	/** @type {import('#client').SnippetBlock} */
	const block = {
		// dom
		d: null,
		// parent
		p: /** @type {import('#client').Block} */ (current_block),
		// effect
		e: null,
		// transition
		r: null,
		// type
		t: SNIPPET_BLOCK
	};

	render_effect(() => {
		// Only rerender when the snippet function itself changes,
		// not when an eagerly-read prop inside the snippet function changes
		const snippet = get_snippet();
		if (snippet) {
			untrack(() => snippet(node, ...args));
		}
		return () => {
			if (block.d !== null) {
				remove(block.d);
			}
		};
	}, block);
}
