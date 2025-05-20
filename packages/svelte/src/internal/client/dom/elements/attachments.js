/** @import { Effect } from '#client' */
import { block, branch, destroy_effect } from '../../reactivity/effects.js';

// TODO in 6.0 or 7.0, when we remove legacy mode, we can simplify this by
// getting rid of the block/branch stuff and just letting the effect rip.
// see https://github.com/sveltejs/svelte/pull/15962

/**
 * @param {Element} node
 * @param {() => (node: Element) => void} get_fn
 */
export function attach(node, get_fn) {
	/** @type {false | undefined | ((node: Element) => void)} */
	var fn = undefined;

	/** @type {Effect | null} */
	var effect;

	block(() => {
		if (fn !== (fn = get_fn())) {
			if (effect) {
				destroy_effect(effect);
				effect = null;
			}

			if (fn) {
				effect = branch(() => /** @type {(node: Element) => void} */ (fn)(node));
			}
		}
	});
}
