/** @import { Effect, TemplateNode } from '#client' */
import { EFFECT_TRANSPARENT } from '#client/constants';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	read_hydration_instruction,
	remove_nodes,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { block, branch, pause_effect, resume_effect } from '../../reactivity/effects.js';
import { HYDRATION_START, HYDRATION_START_ELSE, UNINITIALIZED } from '../../../../constants.js';

/**
 * @param {TemplateNode} node
 * @param {(branch: (fn: (anchor: Node, elseif?: [number,number]) => void, flag?: boolean) => void) => void} fn
 * @param {[number,number]} [elseif]
 * @returns {void}
 */
export function if_block(node, fn, [root_index, hydrate_index] = [0, 0]) {
	if (hydrating && root_index === 0) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {Effect | null} */
	var consequent_effect = null;

	/** @type {Effect | null} */
	var alternate_effect = null;

	/** @type {UNINITIALIZED | boolean | null} */
	var condition = UNINITIALIZED;

	var flags = root_index > 0 ? EFFECT_TRANSPARENT : 0;

	var has_branch = false;

	const set_branch = (
		/** @type {(anchor: Node, elseif?: [number,number]) => void} */ fn,
		flag = true
	) => {
		has_branch = true;
		update_branch(flag, fn);
	};

	const update_branch = (
		/** @type {boolean | null} */ new_condition,
		/** @type {null | ((anchor: Node, elseif?: [number,number]) => void)} */ fn
	) => {
		if (condition === (condition = new_condition)) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating && hydrate_index !== -1) {
			if (root_index === 0) {
				const data = read_hydration_instruction(anchor);

				if (data === HYDRATION_START) {
					hydrate_index = 0;
				} else if (data === HYDRATION_START_ELSE) {
					hydrate_index = Infinity;
				} else {
					hydrate_index = parseInt(data.substring(1));
					if (hydrate_index !== hydrate_index) {
						// if hydrate_index is NaN
						// we set an invalid index to force mismatch
						hydrate_index = condition ? Infinity : -1;
					}
				}
			}
			const is_else = hydrate_index > root_index;

			if (!!condition === is_else) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				anchor = remove_nodes();

				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
				hydrate_index = -1; // ignore hydration in next else if
			}
		}

		if (condition) {
			if (consequent_effect) {
				resume_effect(consequent_effect);
			} else if (fn) {
				consequent_effect = branch(() => fn(anchor));
			}

			if (alternate_effect) {
				pause_effect(alternate_effect, () => {
					alternate_effect = null;
				});
			}
		} else {
			if (alternate_effect) {
				resume_effect(alternate_effect);
			} else if (fn) {
				alternate_effect = branch(() => fn(anchor, [root_index + 1, hydrate_index]));
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
	};

	block(() => {
		has_branch = false;
		fn(set_branch);
		if (!has_branch) {
			update_branch(null, null);
		}
	}, flags);

	if (hydrating) {
		anchor = hydrate_node;
	}
}
