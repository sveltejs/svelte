import { block, branch, pause_effect } from '../reactivity/effects.js';
import { set, source } from '../reactivity/sources.js';
import { get } from '../runtime.js';

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {{ source: import("#client").Source<Component>; wrapper: Component; }} data
 * @param {Component} component
 */
export function hmr(data, component) {
	if (data.source) {
		set(data.source, component);
	} else {
		data.source = source(component);
	}

	return (data.wrapper ??= /** @type {Component} */ (
		(anchor, props) => {
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
		}
	));
}
