/** @import { Source, Effect } from '#client' */
import { EFFECT_TRANSPARENT } from '../constants.js';
import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { set_should_intro } from '../render.js';
import { get } from '../runtime.js';

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {Source<Component>} source
 */
export function hmr(source) {
	/**
	 * @param {Comment} anchor
	 * @param {any} props
	 */
	return function (anchor, props) {
		let instance = {};

		/** @type {Effect} */
		let effect;

		let ran = false;

		block(() => {
			const component = get(source);

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
}
