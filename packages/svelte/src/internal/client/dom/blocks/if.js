import { EFFECT_TRANSPARENT } from '../../constants.js';
import { hydrate_nodes, hydrating, set_hydrating } from '../hydration.js';
import { remove } from '../reconciler.js';
import { block, branch, pause_effect, resume_effect } from '../../reactivity/effects.js';
import { HYDRATION_END_ELSE } from '../../../../constants.js';

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
	/** @type {import('#client').Effect | null} */
	let consequent_effect = null;

	/** @type {import('#client').Effect | null} */
	let alternate_effect = null;

	/** @type {boolean | null} */
	let condition = null;

	const effect = block(() => {
		if (condition === (condition = !!get_condition())) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			const is_else = anchor.data === HYDRATION_END_ELSE;

			if (condition === is_else) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				remove(hydrate_nodes);
				set_hydrating(false);
				mismatch = true;
			}
		}

		if (condition) {
			if (consequent_effect) {
				resume_effect(consequent_effect);
			} else {
				consequent_effect = branch(() => consequent_fn(anchor));
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
				alternate_effect = branch(() => alternate_fn(anchor));
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
		effect.f |= EFFECT_TRANSPARENT;
	}
}
