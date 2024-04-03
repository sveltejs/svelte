import { UNINITIALIZED } from '../../../../constants.js';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { safe_not_equal } from '../../reactivity/equality.js';

/**
 * @template V
 * @param {Comment} anchor
 * @param {() => V} get_key
 * @param {(anchor: Node) => import('#client').Dom | void} render_fn
 * @returns {void}
 */
export function key_block(anchor, get_key, render_fn) {
	/** @type {V | typeof UNINITIALIZED} */
	let key = UNINITIALIZED;

	/** @type {import('#client').Effect} */
	let effect;

	block(() => {
		if (safe_not_equal(key, (key = get_key()))) {
			if (effect) {
				pause_effect(effect);
			}

			effect = branch(() => render_fn(anchor));
		}
	});
}
