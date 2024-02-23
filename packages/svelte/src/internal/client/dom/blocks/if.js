import {
	current_hydration_fragment,
	hydrate_block_anchor,
	hydrating,
	set_current_hydration_fragment
} from '../../hydration.js';
import { remove } from '../../reconciler.js';
import { pause_effect, render_effect, resume_effect } from '../../reactivity/computations.js';
import { BRANCH_EFFECT } from '../../constants.js';

/**
 * @param {Comment} anchor_node
 * @param {() => boolean} condition_fn
 * @param {(anchor: Node) => void} consequent_fn
 * @param {null | ((anchor: Node) => void)} alternate_fn
 * @returns {void}
 */
export function if_block(anchor_node, condition_fn, consequent_fn, alternate_fn) {
	hydrate_block_anchor(anchor_node);

	/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
	let mismatch = false;

	/** @type {import('../../types.js').EffectSignal | null} */
	let consequent_effect;

	/** @type {import('../../types.js').EffectSignal | null} */
	let alternate_effect;

	/** @type {boolean | null} */
	let condition = null;

	render_effect(() => {
		if (condition === (condition = !!condition_fn())) return;

		if (hydrating) {
			const comment_text = /** @type {Comment} */ (current_hydration_fragment?.[0])?.data;
			if (
				!comment_text ||
				(comment_text === 'ssr:if:true' && !condition) ||
				(comment_text === 'ssr:if:false' && condition)
			) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen using when `{#if browser} .. {/if}` in SvelteKit.
				remove(current_hydration_fragment);
				set_current_hydration_fragment(null);
				mismatch = true;
			} else {
				// Remove the ssr:if comment node or else it will confuse the subsequent hydration algorithm
				current_hydration_fragment.shift();
			}
		}

		if (condition) {
			if (consequent_effect) {
				resume_effect(consequent_effect);
			} else {
				consequent_effect = render_effect(() => consequent_fn(anchor_node), {}, true);
			}

			if (alternate_effect) {
				pause_effect(alternate_effect, () => {
					alternate_effect = null;
				});
			}
		} else {
			if (alternate_effect) {
				resume_effect(alternate_effect);
			} else {
				alternate_effect = alternate_fn && render_effect(() => alternate_fn(anchor_node), {}, true);
			}

			if (consequent_effect) {
				pause_effect(consequent_effect, () => {
					consequent_effect = null;
				});
			}
		}
	}).f |= BRANCH_EFFECT; // TODO create a primitive for this
}
