/** @import { Source, Effect } from '#client' */
import { FILENAME, HMR } from '../../../constants.js';
import { EFFECT_TRANSPARENT } from '../constants.js';
import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { source } from '../reactivity/sources.js';
import { set_should_intro } from '../render.js';
import { get } from '../runtime.js';

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {Component} original
 * @param {() => Source<Component>} get_source
 */
export function hmr(original, get_source) {
	/**
	 * @param {Comment} anchor
	 * @param {any} props
	 */
	function wrapper(anchor, props) {
		let instance = {};

		/** @type {Effect} */
		let effect;

		let ran = false;

		block(() => {
			const source = get_source();
			const component = get(source);
			console.log({ source, component });

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
	}

	// @ts-expect-error
	wrapper[FILENAME] = original[FILENAME];

	// @ts-expect-error
	wrapper[HMR] = {
		original,
		source: source(original)
	};

	console.dir(wrapper);

	return wrapper;
}
