/** @import { Effect, TemplateNode } from '#client' */
import {
	hydrate_next,
	hydrating,
	read_hydration_instruction,
	set_hydrate_node,
	set_hydrating,
	skip_nodes
} from '../hydration.js';
import { block } from '../../reactivity/effects.js';
import { HYDRATION_START } from '../../../../constants.js';
import { BranchManager } from './branches.js';

/**
 * @param {TemplateNode} node
 * @param {(branch: (fn: (anchor: Node) => void, index: number) => void) => void} fn
 * @returns {void}
 */
export function switch_block(node, fn) {
	if (hydrating) {
		hydrate_next();
	}

	var branches = new BranchManager(node);

	/**
	 * @param {number} index,
	 * @param {null | ((anchor: Node) => void)} fn
	 */
	function update_branch(index, fn) {
		if (hydrating) {
			const hydration_tag = read_hydration_instruction(node);
			const hydration_index = Number(hydration_tag.slice(HYDRATION_START.length));

			if (index !== hydration_index) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#switch browser}...{/switch}`, for example
				var anchor = skip_nodes();

				set_hydrate_node(anchor);
				branches.anchor = anchor;

				set_hydrating(false);
				branches.ensure(index, fn);
				set_hydrating(true);

				return;
			}
		}

		branches.ensure(index, fn);
	}

	block(() => {
		var has_branch = false;

		fn((fn, index) => {
			has_branch = true;
			update_branch(index, fn);
		});

		if (!has_branch) {
			update_branch(-1, null);
		}
	});
}
