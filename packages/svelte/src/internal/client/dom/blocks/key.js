/** @import { Effect, TemplateNode } from '#client' */
import { UNINITIALIZED } from '../../../../constants.js';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { not_equal, safe_not_equal } from '../../reactivity/equality.js';
import { active_effect, suspended } from '../../runtime.js';
import { is_runes } from '../../context.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { add_boundary_callback, find_boundary } from './boundary.js';

/**
 * @template V
 * @param {TemplateNode} node
 * @param {() => V} get_key
 * @param {(anchor: Node) => TemplateNode | void} render_fn
 * @returns {void}
 */
export function key_block(node, get_key, render_fn) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {V | typeof UNINITIALIZED} */
	var key = UNINITIALIZED;

	/** @type {Effect} */
	var effect;

	/** @type {Effect | null} */
	var pending_effect = null;

	/** @type {DocumentFragment | null} */
	var offscreen_fragment = null;

	var boundary = find_boundary(active_effect);

	var changed = is_runes() ? not_equal : safe_not_equal;

	function commit() {
		if (effect) {
			pause_effect(effect);
		}

		if (offscreen_fragment !== null) {
			anchor.before(offscreen_fragment);
			offscreen_fragment = null;
		}

		if (pending_effect !== null) {
			effect = pending_effect;
			pending_effect = null;
		}
	}

	block(() => {
		if (changed(key, (key = get_key()))) {
			var target = anchor;

			if (suspended) {
				offscreen_fragment = document.createDocumentFragment();
				offscreen_fragment.append((target = document.createComment('')));
			}

			pending_effect = branch(() => render_fn(target));

			if (suspended) {
				add_boundary_callback(boundary, commit);
			} else {
				commit();
			}
		}
	});

	if (hydrating) {
		anchor = hydrate_node;
	}
}
