import { render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';
import { untrack } from '../../runtime.js';
import { create_block } from './utils.js';

/**
 * @param {() => Function | null | undefined} get_snippet
 * @param {Node} node
 * @param {(() => any)[]} args
 * @returns {void}
 */
export function snippet(get_snippet, node, ...args) {
	const block = create_block();

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
