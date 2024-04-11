import { block, branch, destroy_effect } from '../reactivity/effects.js';
import { set, source as create_source } from '../reactivity/sources.js';
import { set_should_intro } from '../render.js';
import { get } from '../runtime.js';

/**
 * @template {(anchor: Comment, props: any) => any} Component
 * @param {{ components: Map<string, { source: import("#client").Source<Component>; wrapper: null | Component; }>}} hot_data
 * @param {string} key
 * @param {Component} component
 */
export function hmr(hot_data, component, key) {
	var components = (hot_data.components ??= new Map());
	let data = components.get(key);

	if (data === undefined) {
		components.set(
			key,
			(data = {
				source: create_source(component),
				wrapper: null
			})
		);
	} else {
		set(data.source, component);
	}

	return (data.wrapper ??= /** @type {Component} */ (
		(anchor, props) => {
			let instance = {};

			/** @type {import("#client").Effect} */
			let effect;

			block(() => {
				const component = get(data.source);

				if (effect) {
					// @ts-ignore
					for (var k in instance) delete instance[k];
					destroy_effect(effect);
				}

				effect = branch(() => {
					set_should_intro(false);
					Object.assign(instance, component(anchor, props));
					set_should_intro(true);
				});
			});

			return instance;
		}
	));
}
