/** @import { Effect } from '#client' */
import { FILENAME, ORIGINAL } from '../../../constants.js';
import { EFFECT_TRANSPARENT } from '../constants.js';
import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { set, source } from '../reactivity/sources.js';
import { set_should_intro } from '../render.js';
import { get } from '../runtime.js';

/**
 * For each original component, store a persistent reference to the HMR wrapper
 * @type {Map<string, {wrapper: any, update: (update: any) => void}>}
 */
const registry = new Map();

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {Component} original
 */
export function hmr(original) {
	let result = registry.get(/** @type {any} */ (original)[FILENAME]);

	if (result) {
		// update the reference to the original component as it's now updated
		result.wrapper[ORIGINAL] = original;
		return result;
	}

	const component_source = source(original);

	/**
	 * @param {Comment} anchor
	 * @param {any} props
	 */
	const wrapper = function (anchor, props) {
		let instance = {};

		/** @type {Effect} */
		let effect;

		let ran = false;

		block(() => {
			const component = get(component_source);

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

		return instance;
	};

	// stash a reference to the original component to avoid adding more and more wrappers per HMR update
	wrapper[ORIGINAL] = original;

	result = {
		wrapper,
		update: (update) => set(component_source, update[ORIGINAL])
	};
	registry.set(/** @type {any} */ (original)[FILENAME], result);

	return result;
}
