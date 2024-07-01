import { DEV } from 'esm-env';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { empty } from '../operations.js';

/**
 * @template P
 * @template {(props: P) => void} C
 * @param {import('#client').TemplateNode} anchor
 * @param {() => C} get_component
 * @param {(anchor: import('#client').TemplateNode, component: C) => import('#client').Dom | void} render_fn
 * @returns {void}
 */
export function component(anchor, get_component, render_fn) {
	/** @type {C} */
	let component;

	/** @type {import('#client').Effect | null} */
	let effect;

	var component_anchor = anchor;

	// create a dummy anchor for the HMR wrapper, if such there be
	if (DEV) component_anchor = empty();

	block(anchor, 0, () => {
		if (component === (component = get_component())) return;

		if (effect) {
			pause_effect(effect);
			effect = null;
		}

		if (component) {
			if (DEV) anchor.before(component_anchor);
			effect = branch(() => render_fn(component_anchor, component));
		}
	});
}
