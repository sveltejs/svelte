/** @import { Effect, TemplateNode } from '#client' */
import { EFFECT_TRANSPARENT } from '../../constants.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	remove_nodes,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { block, branch, pause_effect, resume_effect } from '../../reactivity/effects.js';
import { HYDRATION_START_ELSE } from '../../../../constants.js';
import { noop } from '../../../shared/utils.js';



/**
 * @param {TemplateNode} node
 * @param {[() => boolean, (anchor: Node) => void, Effect?][]} conditions
 * @returns {void}
 */
export function if_block(node, ...conditions) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {Effect | null | undefined} */
	var current_effect = null;

	/** @type {number | null} */
	var current_index = null;

	block(() => {
		const previous_index = current_index;
		const previous_effect = current_effect;
		if (current_index === (current_index = conditions.findIndex(c => c[0]()))) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			// TODO
			const is_else = -5; // /** @type {Comment} */ (anchor).data === HYDRATION_START_ELSE;

			if (current_index !== is_else) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				anchor = remove_nodes();

				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
			}
		}

		if (current_index < 0) {
			current_effect = null;
		} else {
			current_effect = conditions[current_index][2];
			if (current_effect) {
				resume_effect(current_effect);
			} else {
				const fn = conditions[current_index]?.[1];
				if (fn) {
					let target_anchor = anchor;
					if (previous_index != null
						&& previous_index > current_index
						&& previous_effect && previous_effect.nodes_start) {
						target_anchor = previous_effect.nodes_start;
					}				
					current_effect = branch(() => fn(target_anchor));
				}
			}
		}

		if (previous_effect && previous_index!=null) {
			if (previous_effect.transitions) {
				conditions[previous_index][2] = previous_effect;
			}
			pause_effect(previous_effect, () => {
				delete conditions[previous_index][2];
			});
		}
		if (mismatch) {
			// continue in hydration mode
			set_hydrating(true);
		}
	});

	if (hydrating) {
		anchor = hydrate_node;
	}
}


/**
 * @param {TemplateNode} node
 * @param {() => boolean} get_condition
 * @param {(anchor: Node) => void} consequent_fn
 * @param {null | ((anchor: Node) => void)} [alternate_fn]
 * @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
 * @returns {void}
 */
export function if_block_old(node, get_condition, consequent_fn, alternate_fn = null, elseif = false) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {Effect | null} */
	var consequent_effect = null;

	/** @type {Effect | null} */
	var alternate_effect = null;

	/** @type {boolean | null} */
	var condition = null;

	var flags = elseif ? EFFECT_TRANSPARENT : 0;

	block(() => {
		if (condition === (condition = !!get_condition())) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			const is_else = /** @type {Comment} */ (anchor).data === HYDRATION_START_ELSE;

			if (condition === is_else) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				anchor = remove_nodes();

				set_hydrate_node(anchor);
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
	}, flags);

	if (hydrating) {
		anchor = hydrate_node;
	}
}
