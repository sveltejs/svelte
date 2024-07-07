/** @import { TemplateNode } from '#client' */
import { EFFECT_TRANSPARENT } from '../../constants.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { block, branch, pause_effect, resume_effect } from '../../reactivity/effects.js';

/**
 * @param {TemplateNode} anchor
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
	if (hydrating) {
		hydrate_next();
	}

	/** @type {import('#client').Effect | null} */
	var consequent_effect = null;

	/** @type {import('#client').Effect | null} */
	var alternate_effect = null;

	/** @type {boolean | null} */
	var condition = null;

	var flags = elseif ? EFFECT_TRANSPARENT : 0;

	block(() => {
		if (condition === (condition = !!get_condition())) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			const is_else = /** @type {Comment} */ (anchor).data === '#if!';

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

// TODO share this logic with each.js — revert to `[` and `]`
function remove_nodes() {
	var depth = 0;
	var node = hydrate_node;

	while (node.nodeType !== 8 || (depth === 0 && /** @type {Comment} */ (node).data !== '/if')) {
		if (node.nodeType === 8) {
			var data = /** @type {Comment} */ (node).data;
			if (data === '#if' || data === '#if!') {
				depth += 1;
			} else if (data === '/if') {
				depth -= 1;
			}
		}

		var next = /** @type {TemplateNode} */ (node.nextSibling);
		node.remove();
		node = next;
	}

	return node;
}
