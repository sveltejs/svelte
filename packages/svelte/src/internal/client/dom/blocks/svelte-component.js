import { hydrate_block_anchor } from '../hydration.js';
import { pause_effect, render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';
import { current_effect } from '../../runtime.js';

// TODO this is very similar to `key`, can we deduplicate?

/**
 * @template P
 * @template {(props: P) => void} C
 * @param {Comment} anchor
 * @param {() => C} get_component
 * @param {(component: C) => import('#client').Dom | void} render_fn
 * @returns {void}
 */
export function component(anchor, get_component, render_fn) {
	hydrate_block_anchor(anchor);

	/** @type {C} */
	let component;

	/** @type {import('#client').Effect} */
	let effect;

	/**
	 * Every time `component` changes, we create a new effect. Old effects are
	 * removed from this set when they have fully transitioned out
	 * @type {Set<import('#client').Effect>}
	 */
	let effects = new Set();

	const component_effect = render_effect(() => {
		if (component === (component = get_component())) return;

		if (effect) {
			var e = effect;
			pause_effect(e, () => {
				effects.delete(e);
			});
		}

		if (component) {
			effect = render_effect(() => {
				render_fn(component);

				// `render_fn` doesn't return anything, and we can't reference `effect`
				// yet, so we reference it indirectly as `current_effect`
				const dom = /** @type {import('#client').Effect} */ (current_effect).dom;

				return () => {
					if (dom !== null) remove(dom);
				};
			}, true);

			effects.add(effect);
		}
	});

	component_effect.ondestroy = () => {
		for (const e of effects) {
			if (e.dom) remove(e.dom);
		}
	};
}
