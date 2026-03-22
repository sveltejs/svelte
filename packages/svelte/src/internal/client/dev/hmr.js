/** @import { Effect, TemplateNode } from '#client' */
import { FILENAME, HMR } from '../../../constants.js';
import { EFFECT_TRANSPARENT } from '#client/constants';
import { hydrate_node, hydrating } from '../dom/hydration.js';
import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { set, source } from '../reactivity/sources.js';
import { set_should_intro } from '../render.js';
import { active_effect, get } from '../runtime.js';

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {Component} fn
 */
export function hmr(fn) {
	const current = source(fn);

	/**
	 * @param {TemplateNode} anchor
	 * @param {any} props
	 */
	function wrapper(anchor, props) {
		let component = {};
		let instance = {};

		/** @type {Effect} */
		let effect;

		let ran = false;

		block(() => {
			if (component === (component = get(current))) {
				return;
			}

			if (effect) {
				// @ts-ignore
				for (var k in instance) delete instance[k];
				destroy_effect(effect);
			}

			effect = branch(() => {
				// when the component is invalidated, replace it without transitions
				if (ran) set_should_intro(false);

				// preserve getters/setters
				var result =
					// @ts-expect-error
					new.target ? new component(anchor, props) : component(anchor, props);
				// a component is not guaranteed to return something and we can't invoke getOwnPropertyDescriptors on undefined
				if (result) {
					Object.defineProperties(instance, Object.getOwnPropertyDescriptors(result));
				}

				if (ran) set_should_intro(true);
			});

			// Forward the nodes from the inner effect to the outer active effect which would
			// get them if the HMR wrapper wasn't there. Do this inside the block not outside
			// so that HMR updates to the component will also update the nodes on the active effect.
			/** @type {Effect} */ (active_effect).nodes = effect.nodes;
		}, EFFECT_TRANSPARENT);

		ran = true;

		if (hydrating) {
			anchor = hydrate_node;
		}

		return instance;
	}

	// @ts-expect-error
	wrapper[FILENAME] = fn[FILENAME];

	// @ts-ignore
	wrapper[HMR] = {
		fn,
		current,
		update: (/** @type {any} */ incoming) => {
			// This logic ensures that the first version of the component is the one
			// whose update function and therefore block effect is preserved across updates.
			// If we don't do this dance and instead just use `incoming` as the new component
			// and then update, we'll create an ever-growing stack of block effects.

			// Trigger the original block effect
			set(wrapper[HMR].current, incoming[HMR].fn);

			// Replace the incoming source with the original one
			incoming[HMR].current = wrapper[HMR].current;
		}
	};

	return wrapper;
}
