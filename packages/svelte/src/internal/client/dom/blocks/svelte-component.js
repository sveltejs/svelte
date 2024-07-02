/** @import { TemplateNode, Dom, Effect } from '#client' */
import { block, branch, pause_effect } from '../../reactivity/effects.js';

/**
 * @template P
 * @template {(props: P) => void} C
 * @param {TemplateNode} anchor
 * @param {() => C} get_component
 * @param {(anchor: TemplateNode, component: C) => Dom | void} render_fn
 * @returns {void}
 */
export function component(anchor, get_component, render_fn) {
	/** @type {C} */
	let component;

	/** @type {Effect | null} */
	let effect;

	block(() => {
		if (component === (component = get_component())) return;

		if (effect) {
			pause_effect(effect);
			effect = null;
		}

		if (component) {
			effect = branch(() => render_fn(anchor, component));
		}
	});
}
