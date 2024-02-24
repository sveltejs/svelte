import { hydrate_block_anchor } from '../../hydration.js';
import { pause_effect, render_effect } from '../../reactivity/effects.js';

/**
 * @template {Record<string, any>} P
 * @template {(node: Node, props: P) => void} C
 * @param {Comment} anchor_node
 * @param {() => C} component_fn
 * @param {(component: C) => void} render_fn
 * @returns {void}
 */
export function component(anchor_node, component_fn, render_fn) {
	hydrate_block_anchor(anchor_node);

	/** @type {C | null} */
	let Component = null;

	/** @type {import('#client').Effect | null} */
	let effect = null;

	render_effect(() => {
		if (Component === (Component = component_fn() ?? null)) return;

		if (effect) {
			const e = effect;
			pause_effect(effect, () => {
				if (e === effect) effect = null;
			});
		}

		if (Component) {
			effect = render_effect(() => render_fn(/** @type {C} */ (Component)), true);
		}
	});
}
