import { UNINITIALIZED } from '../../constants.js';
import { hydrate_block_anchor } from '../hydration.js';
import { remove } from '../reconciler.js';
import { pause_effect, render_effect } from '../../reactivity/effects.js';
import { safe_not_equal } from '../../reactivity/equality.js';
import { create_block } from './utils.js';

/**
 * @template V
 * @param {Comment} anchor
 * @param {() => V} get_key
 * @param {(anchor: Node) => void} render_fn
 * @returns {void}
 */
export function key_block(anchor, get_key, render_fn) {
	const block = create_block();

	hydrate_block_anchor(anchor);

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

	const key_effect = render_effect(
		() => {
			if (safe_not_equal(key, (key = get_key()))) {
				if (effect) {
					var e = effect;
					pause_effect(e, () => {
						effects.delete(e);
					});
				}

				effect = render_effect(
					() => {
						render_fn(anchor);

						const dom = block.d;

						return () => {
							if (dom !== null) {
								remove(dom);
							}
						};
					},
					block,
					true,
					true
				);

				// @ts-expect-error TODO tidy up
				effect.d = block.d;

				effects.add(effect);
			}
		},
		block,
		false
	);

	key_effect.ondestroy = () => {
		for (const e of effects) {
			// @ts-expect-error TODO tidy up. ondestroy should be totally unnecessary
			if (e.d) remove(e.d);
		}
	};
}
