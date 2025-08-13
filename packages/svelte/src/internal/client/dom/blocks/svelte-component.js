/** @import { TemplateNode, Dom, Effect } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
import { EFFECT_TRANSPARENT } from '#client/constants';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { current_batch } from '../../reactivity/batch.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { create_text, should_defer_append } from '../operations.js';

/**
 * @template P
 * @template {(props: P) => void} C
 * @param {TemplateNode} node
 * @param {() => C} get_component
 * @param {(anchor: TemplateNode, component: C) => Dom | void} render_fn
 * @returns {void}
 */
export function component(node, get_component, render_fn) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {C} */
	var component;

	/** @type {Effect | null} */
	var effect;

	/** @type {DocumentFragment | null} */
	var offscreen_fragment = null;

	/** @type {Effect | null} */
	var pending_effect = null;

	function commit() {
		if (effect) {
			pause_effect(effect);
			effect = null;
		}

		if (offscreen_fragment) {
			// remove the anchor
			/** @type {Text} */ (offscreen_fragment.lastChild).remove();

			anchor.before(offscreen_fragment);
			offscreen_fragment = null;
		}

		effect = pending_effect;
		pending_effect = null;
	}

	block(() => {
		if (component === (component = get_component())) return;

		var defer = should_defer_append();

		if (component) {
			var target = anchor;

			if (defer) {
				offscreen_fragment = document.createDocumentFragment();
				offscreen_fragment.append((target = create_text()));
				if (effect) {
					/** @type {Batch} */ (current_batch).skipped_effects.add(effect);
				}
			}
			pending_effect = branch(() => render_fn(target, component));
		}

		if (defer) {
			/** @type {Batch} */ (current_batch).add_callback(commit);
		} else {
			commit();
		}
	}, EFFECT_TRANSPARENT);

	if (hydrating) {
		anchor = hydrate_node;
	}
}
