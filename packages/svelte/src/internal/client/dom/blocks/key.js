import { UNINITIALIZED, BRANCH_EFFECT } from '../../constants.js';
import { hydrate_block_anchor } from '../../hydration.js';
import { pause_effect, render_effect } from '../../reactivity/computations.js';
import { noop } from '../../../common.js';

/**
 * @template V
 * @param {Comment} anchor_node
 * @param {() => V} get_key
 * @param {(anchor: Node) => void} render_fn
 * @returns {void}
 */
export function key_block(anchor_node, get_key, render_fn) {
	hydrate_block_anchor(anchor_node);

	/** @type {V | typeof UNINITIALIZED} */
	let key = UNINITIALIZED;

	/** @type {import('../../types.js').EffectSignal | null} */
	let effect;

	render_effect(() => {
		if (key === (key = get_key())) return; // TODO do we need safe_not_equal in non-runes mode?

		if (effect) {
			const e = effect;
			pause_effect(e, noop);
		}

		effect = render_effect(() => render_fn(anchor_node), {}, true);
	}).f |= BRANCH_EFFECT;
}
