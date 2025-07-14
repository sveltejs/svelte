/** @import { Effect, TemplateNode } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
import { UNINITIALIZED } from '../../../../constants.js';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { not_equal, safe_not_equal } from '../../reactivity/equality.js';
import { is_runes } from '../../context.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { create_text, should_defer_append } from '../operations.js';
import { current_batch } from '../../reactivity/batch.js';

/**
 * @template V
 * @param {TemplateNode} node
 * @param {() => V} get_key
 * @param {(anchor: Node) => TemplateNode | void} render_fn
 * @returns {void}
 */
export function key(node, get_key, render_fn) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {V | typeof UNINITIALIZED} */
	var key = UNINITIALIZED;

	/** @type {Effect} */
	var effect;

	/** @type {Effect} */
	var pending_effect;

	/** @type {DocumentFragment | null} */
	var offscreen_fragment = null;

	var changed = is_runes() ? not_equal : safe_not_equal;

	function commit() {
		if (effect) {
			pause_effect(effect);
		}

		if (offscreen_fragment !== null) {
			// remove the anchor
			/** @type {Text} */ (offscreen_fragment.lastChild).remove();

			anchor.before(offscreen_fragment);
			offscreen_fragment = null;
		}

		effect = pending_effect;
	}

	block(() => {
		if (changed(key, (key = get_key()))) {
			var target = anchor;

			var defer = should_defer_append();

			if (defer) {
				offscreen_fragment = document.createDocumentFragment();
				offscreen_fragment.append((target = create_text()));
			}

			pending_effect = branch(() => render_fn(target));

			if (defer) {
				/** @type {Batch} */ (current_batch).add_callback(commit);
			} else {
				commit();
			}
		}
	});

	if (hydrating) {
		anchor = hydrate_node;
	}
}
