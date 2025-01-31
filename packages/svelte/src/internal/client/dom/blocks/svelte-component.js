/** @import { TemplateNode, Dom, Effect } from '#client' */
import { EFFECT_TRANSPARENT } from '../../constants.js';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { active_effect } from '../../runtime.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { should_defer_append } from '../operations.js';
import { add_boundary_callback, find_boundary } from './boundary.js';

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

	var boundary = find_boundary(active_effect);

	function commit() {
		if (effect) {
			pause_effect(effect);
			effect = null;
		}

		if (offscreen_fragment) {
			anchor.before(offscreen_fragment);
			offscreen_fragment = null;
		}

		effect = pending_effect;
	}

	block(() => {
		if (component === (component = get_component())) return;

		if (component) {
			var defer = boundary !== null && should_defer_append();
			var target = anchor;

			if (defer) {
				offscreen_fragment = document.createDocumentFragment();
				offscreen_fragment.append((target = document.createComment('')));
			}

			pending_effect = branch(() => render_fn(anchor, component));

			if (defer) {
				add_boundary_callback(boundary, commit);
			} else {
				commit();
			}
		}
	}, EFFECT_TRANSPARENT);

	if (hydrating) {
		anchor = hydrate_node;
	}
}
