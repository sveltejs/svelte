/** @import { Effect, TemplateNode } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
import { EFFECT_TRANSPARENT } from '#client/constants';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	read_hydration_instruction,
	skip_nodes,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { block, branch, pause_effect, resume_effect } from '../../reactivity/effects.js';
import { HYDRATION_START_ELSE, UNINITIALIZED } from '../../../../constants.js';
import { create_text, should_defer_append } from '../operations.js';
import { current_batch } from '../../reactivity/batch.js';
import { BranchManager } from './branches.js';
import { noop } from '../../../shared/utils.js';

// TODO reinstate https://github.com/sveltejs/svelte/pull/15250

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

	/** @type {typeof UNINITIALIZED | boolean | null} */
	var condition = UNINITIALIZED;

	var flags = elseif ? EFFECT_TRANSPARENT : 0;

	var has_branch = false;

	const set_branch = (/** @type {(anchor: Node) => void} */ fn, flag = true) => {
		has_branch = true;
		update_branch(flag, fn);
	};

	var branches = new BranchManager(anchor);

	const update_branch = (
		/** @type {boolean | null} */ new_condition,
		/** @type {null | ((anchor: Node) => void)} */ fn
	) => {
		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			const is_else = read_hydration_instruction(anchor) === HYDRATION_START_ELSE;

			if (!!condition === is_else) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				anchor = skip_nodes();

				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
			}
		}

		branches.ensure(new_condition, fn ?? noop);

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
