/** @import { Effect, TemplateNode } from '#client' */
import { FILENAME, HMR } from '../../../constants.js';
import { EFFECT_TRANSPARENT } from '#client/constants';
import { hydrate_node, hydrating } from '../dom/hydration.js';
import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { set, source, update } from '../reactivity/sources.js';
import { set_should_intro } from '../render.js';
import { get } from '../runtime.js';

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {Component} original_component
 */
export function hmr(original_component) {
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
			if (component === (component = get(wrapper[HMR].source))) {
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
				Object.defineProperties(
					instance,
					Object.getOwnPropertyDescriptors(
						// @ts-expect-error
						new.target ? new component(anchor, props) : component(anchor, props)
					)
				);

				if (ran) set_should_intro(true);
			});
		}, EFFECT_TRANSPARENT);

		ran = true;

		if (hydrating) {
			anchor = hydrate_node;
		}

		return instance;
	}

	// @ts-expect-error
	wrapper[FILENAME] = original_component[FILENAME];

	// @ts-ignore
	wrapper[HMR] = {
		original: original_component,
		source: source(original_component),
		update: (/** @type {any} */ c) => {
			// This logic ensures that the first version of the component is the one
			// whose update function and therefore block effect is preserved across updates.

			// We do that by first updating the component instance with the latest one
			// (c is the HMR-updated version of the component, already wrapped, so we use c[HMR].original)...
			original_component = wrapper[HMR].original = c[HMR].original;
			// ...then go the other way to tell the latest version to always
			// use the source of the very first version...
			c[HMR].source = wrapper[HMR].source;
			// ...and finally trigger the block effect update
			set(wrapper[HMR].source, original_component);
			// If we don't do this dance and instead just use c as the new component
			// and then update, we'll create an ever-growing stack of block effects.
		}
	};

	return wrapper;
}
