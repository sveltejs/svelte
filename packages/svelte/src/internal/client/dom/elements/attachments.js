/** @import { Effect } from '#client' */
import { block, branch, destroy_effect, effect } from '../../reactivity/effects.js';

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
