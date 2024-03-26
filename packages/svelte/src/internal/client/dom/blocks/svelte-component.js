import { block, branch, pause_effect } from '../../reactivity/effects.js';

// TODO seems weird that `anchor` is unused here — possible bug?

/**
 * @template P
 * @template {(props: P) => void} C
 * @param {Comment} anchor
 * @param {() => C} get_component
 * @param {(component: C) => import('#client').Dom | void} render_fn
 * @returns {void}
 */
export function component(anchor, get_component, render_fn) {
	/** @type {C} */
	let component;

	/** @type {import('#client').Effect | null} */
	let effect;

	block(() => {
		if (component === (component = get_component())) return;

		if (effect) {
			pause_effect(effect);
			effect = null;
		}

		if (component) {
			effect = branch(() => render_fn(component));
		}
	});
}
