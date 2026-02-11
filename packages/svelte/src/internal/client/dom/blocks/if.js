/** @import { TemplateNode } from '#client' */
import { EFFECT_TRANSPARENT } from '#client/constants';
import {
	hydrate_next,
	hydrating,
	read_hydration_instruction,
	skip_nodes,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { block } from '../../reactivity/effects.js';
import { BranchManager } from './branches.js';
import { HYDRATION_START, HYDRATION_START_ELSE } from '../../../../constants.js';

/**
 * @param {TemplateNode} node
 * @param {(branch: (fn: (anchor: Node) => void, key?: number | false) => void) => void} fn
 * @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
 * @returns {void}
 */
export function if_block(node, fn, elseif = false) {
	if (hydrating) {
		hydrate_next();
	}

	var branches = new BranchManager(node);
	var flags = elseif ? EFFECT_TRANSPARENT : 0;

	/**
	 * @param {number | false} key
	 * @param {null | ((anchor: Node) => void)} fn
	 */
	function update_branch(key, fn) {
		if (hydrating) {
			const data = read_hydration_instruction(node);

			/**
			 * @type {number | false}
			 * "[" = branch 0, "[1" = branch 1, "[2" = branch 2, ..., "[!" = else (false)
			 */
			var hydrated_key;

			if (data === HYDRATION_START) {
				hydrated_key = 0;
			} else if (data === HYDRATION_START_ELSE) {
				hydrated_key = false;
			} else {
				hydrated_key = parseInt(data.substring(1)); // "[1", "[2", etc.
			}

			if (key !== hydrated_key) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				var anchor = skip_nodes();

				set_hydrate_node(anchor);
				branches.anchor = anchor;

				set_hydrating(false);
				branches.ensure(key, fn);
				set_hydrating(true);

				return;
			}
		}

		branches.ensure(key, fn);
	}

	block(() => {
		var has_branch = false;

		fn((fn, key = 0) => {
			has_branch = true;
			update_branch(key, fn);
		});

		if (!has_branch) {
			update_branch(false, null);
		}
	}, flags);
}
