import { IS_ELSEIF } from '../../constants.js';
import { hydrate_nodes, hydrate_block_anchor, hydrating, set_hydrating } from '../hydration.js';
import { remove } from '../reconciler.js';
import {
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect
} from '../../reactivity/effects.js';

/**
 * @param {Comment} anchor
 * @param {() => boolean} get_condition
 * @param {(anchor: Node) => import('#client').Dom} consequent_fn
 * @param {null | ((anchor: Node) => import('#client').Dom)} [alternate_fn]
 * @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
 * @returns {void}
 */
export function if_block(
	anchor,
	get_condition,
	consequent_fn,
	alternate_fn = null,
	elseif = false
) {
	hydrate_block_anchor(anchor);

	/** @type {import('#client').Effect | null} */
	let consequent_effect = null;

	/** @type {import('#client').Effect | null} */
	let alternate_effect = null;

	/** @type {boolean | null} */
	let condition = null;

	const if_effect = render_effect(() => {
		if (condition === (condition = !!get_condition())) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			const comment_text = /** @type {Comment} */ (hydrate_nodes?.[0])?.data;

			if (
				!comment_text ||
				(comment_text === 'ssr:if:true' && !condition) ||
				(comment_text === 'ssr:if:false' && condition)
			) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen using when `{#if browser} .. {/if}` in SvelteKit.
				remove(hydrate_nodes);
				set_hydrating(false);
				mismatch = true;
			} else {
				// Remove the ssr:if comment node or else it will confuse the subsequent hydration algorithm
				hydrate_nodes.shift();
			}
		}

		if (condition) {
			if (consequent_effect) {
				resume_effect(consequent_effect);
			} else {
				consequent_effect = render_effect(() => consequent_fn(anchor), true);
			}

			if (alternate_effect) {
				pause_effect(alternate_effect, () => {
					alternate_effect = null;
				});
			}
		} else {
			if (alternate_effect) {
				resume_effect(alternate_effect);
			} else if (alternate_fn) {
				alternate_effect = render_effect(() => alternate_fn(anchor), true);
			}

			if (consequent_effect) {
				pause_effect(consequent_effect, () => {
					consequent_effect = null;
				});
			}
		}

		if (mismatch) {
			// continue in hydration mode
			set_hydrating(true);
		}
	});

	if (elseif) {
		if_effect.f |= IS_ELSEIF;
	}

	if_effect.ondestroy = () => {
		// TODO why is this not automatic? this should be children of `if_effect`
		if (consequent_effect) {
			destroy_effect(consequent_effect);
		}

		if (alternate_effect) {
			destroy_effect(alternate_effect);
		}
	};
}
