import { UNINITIALIZED } from '../../constants.js';
import { remove } from '../reconciler.js';
import { pause_effect, render_effect } from '../../reactivity/effects.js';
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

	/**
	 * Every time `key` changes, we create a new effect. Old effects are
	 * removed from this set when they have fully transitioned out
	 * @type {Set<import('#client').Effect>}
	 */
	let effects = new Set();

	const key_effect = render_effect(() => {
		if (safe_not_equal(key, (key = get_key()))) {
			if (effect) {
				var e = effect;
				pause_effect(e, () => {
					effects.delete(e);
				});
			}

			effect = render_effect(() => {
				const dom = render_fn(anchor);

				return () => {
					if (dom !== undefined) {
						remove(dom);
					}
				};
			}, true);

			effects.add(effect);
		}
	});

	key_effect.ondestroy = () => {
		for (const e of effects) {
			if (e.dom) remove(e.dom);
		}
	};
}
