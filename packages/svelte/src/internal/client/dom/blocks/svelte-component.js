import { hydrate_block_anchor } from '../hydration.js';
import { pause_effect, render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';
import { create_block } from './utils.js';

// TODO this is very similar to `key`, can we deduplicate?

/**
 * @template P
 * @template {(props: P) => void} C
 * @param {Comment} anchor
 * @param {() => C} get_component
 * @param {(component: C) => void} render_fn
 * @returns {void}
 */
export function component(anchor, get_component, render_fn) {
	const block = create_block();

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

	const component_effect = render_effect(
		() => {
			if (component === (component = get_component())) return;

			if (effect) {
				var e = effect;
				pause_effect(e, () => {
					effects.delete(e);
				});
			}

			if (component) {
				effect = render_effect(
					() => {
						render_fn(component);

						const dom = block.d;

						return () => {
							if (dom !== null) {
								remove(dom);
							}
						};
					},
					block,
					true,
					true
				);

				// @ts-expect-error TODO tidy up
				effect.d = block.d;

				effects.add(effect);
			}
		},
		block,
		false
	);

	component_effect.ondestroy = () => {
		for (const e of effects) {
			// @ts-expect-error TODO tidy up. ondestroy should be totally unnecessary
			if (e.d) remove(e.d);
		}
	};
}
