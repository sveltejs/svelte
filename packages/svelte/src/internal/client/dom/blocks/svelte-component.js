/** @import { TemplateNode, Dom, Effect } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
import { EFFECT_TRANSPARENT } from '#client/constants';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { current_batch } from '../../reactivity/batch.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { should_defer_append } from '../operations.js';

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

	/** @type {Effect | null} */
	var pending_effect = null;

	function commit() {
		if (effect) {
			pause_effect(effect);
			effect = null;
		}

		effect = pending_effect;
		pending_effect = null;
	}

	block(() => {
		if (component === (component = get_component())) return;

		var defer = should_defer_append();

		if (component) {
			if (defer) {
				if (effect) {
					/** @type {Batch} */ (current_batch).skipped_effects.add(effect);
				}
				/** @type {Batch} */ (current_batch).add_callback(() => {
					if (effect) {
						pause_effect(effect);
						effect = null;
					}
					effect = branch(() => render_fn(anchor, component));
				});
			} else {
				pending_effect = branch(() => render_fn(anchor, component));
				commit();
			}
		} else if (defer) {
			/** @type {Batch} */ (current_batch).add_callback(commit);
		} else {
			commit();
		}
	}, EFFECT_TRANSPARENT);

	if (hydrating) {
		anchor = hydrate_node;
	}
}
