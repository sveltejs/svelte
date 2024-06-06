import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { set_should_intro } from '../render.js';
import { get } from '../runtime.js';
import { check_target } from './legacy.js';

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {import("#client").Source<Component>} source
 */
export function hmr(source) {
	/**
	 * @param {Comment} anchor
	 * @param {any} props
	 */
	return function (anchor, props) {
		let instance = {};

		/** @type {import("#client").Effect} */
		let effect;

		block(() => {
			const component = get(source);

			if (effect) {
				// @ts-ignore
				for (var k in instance) delete instance[k];
				destroy_effect(effect);
			}

			effect = branch(() => {
				set_should_intro(false);
				// preserve getters/setters
				Object.defineProperties(
					instance,
					Object.getOwnPropertyDescriptors(
						// @ts-expect-error
						new.target ? new component(anchor, props) : component(anchor, props)
					)
				);
				set_should_intro(true);
			});
		});

		return instance;
	};
}
