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
import { HYDRATION_START_ELSE, UNINITIALIZED } from '../../../../constants.js';
import { active_effect, suspended } from '../../runtime.js';
import { add_boundary_callback, find_boundary } from './boundary.js';

/**
 * @param {TemplateNode} node
 * @param {(branch: (fn: (anchor: Node) => void, flag?: boolean) => void) => void} fn
 * @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
 * @returns {void}
 */
export function if_block(node, fn, elseif = false) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {Effect | null} */
	var consequent_effect = null;

	/** @type {Effect | null} */
	var alternate_effect = null;

	/** @type {UNINITIALIZED | boolean | null} */
	var condition = UNINITIALIZED;

	var flags = elseif ? EFFECT_TRANSPARENT : 0;

	var has_branch = false;

	const set_branch = (/** @type {(anchor: Node) => void} */ fn, flag = true) => {
		has_branch = true;
		update_branch(flag, fn);
	};

	/** @type {DocumentFragment | null} */
	var offscreen_fragment = null;

	/** @type {Effect | null} */
	var pending_effect = null;

	var boundary = find_boundary(active_effect);

	function commit() {
		if (offscreen_fragment !== null) {
			anchor.before(offscreen_fragment);
			offscreen_fragment = null;
		}

		if (pending_effect) {
			if (condition) {
				consequent_effect = pending_effect;
			} else {
				alternate_effect = pending_effect;
			}
		}

		var current_effect = condition ? consequent_effect : alternate_effect;
		var previous_effect = condition ? alternate_effect : consequent_effect;

		if (current_effect !== null) {
			resume_effect(current_effect);
		}

		if (previous_effect !== null) {
			pause_effect(previous_effect, () => {
				if (condition) {
					alternate_effect = null;
				} else {
					consequent_effect = null;
				}
			});
		}

		pending_effect = null;
	}

	const update_branch = (
		/** @type {boolean | null} */ new_condition,
		/** @type {null | ((anchor: Node) => void)} */ fn
	) => {
		if (condition === (condition = new_condition)) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			const is_else = /** @type {Comment} */ (anchor).data === HYDRATION_START_ELSE;

			if (!!condition === is_else) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				anchor = remove_nodes();

				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
			}
		}

		var target = anchor;

		if (suspended) {
			offscreen_fragment = document.createDocumentFragment();
			offscreen_fragment.append((target = document.createComment('')));
		}

		if (condition ? !consequent_effect : !alternate_effect) {
			pending_effect = fn && branch(() => fn(target));
		}

		if (suspended) {
			add_boundary_callback(boundary, commit);
		} else {
			commit();
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
