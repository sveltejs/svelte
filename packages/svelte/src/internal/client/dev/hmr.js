import { block, branch, pause_effect } from '../reactivity/effects.js';
import { set, source } from '../reactivity/sources.js';
import { get } from '../runtime.js';

/**
 * @param {{ source: import("#client").Source<(anchor: Comment, props: any) => any>; wrapper: (anchor: Comment, props: any) => any; }} data
 * @param {(anchor: Comment, props: any) => any} component
 */
export function hmr(data, component) {
	if (data.source) {
		set(data.source, component);
	} else {
		data.source = source(component);
	}

	return (data.wrapper ??= (/** @type {Comment} */ anchor, /** @type {any} */ props) => {
		let output;

		/** @type {import("#client").Effect} */
		let effect;

		block(() => {
			const component = get(data.source);

			if (effect) {
				pause_effect(effect);
			}

			effect = branch(() => {
				output = component(anchor, props);
			});
		});

		return output;
	});
}
