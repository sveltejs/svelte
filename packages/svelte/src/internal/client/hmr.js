import { key } from './render.js';
import { source, set, get } from './runtime.js';

/**
 * @template {any[]} ComponentArgs
 * @template {Record<string, any> | undefined} ComponentReturn
 * @template {(...args: ComponentArgs) => ComponentReturn} Component
 *
 * @param {{
 *    component_signal: ReturnType<typeof source<Component>>,
 *    proxy?: (...args: ComponentArgs) => ComponentReturn
 * }} hot_data
 * @param {Component} component
 */
export function hmr(hot_data, component) {
	if (hot_data.proxy) {
		set(hot_data.component_signal, component);
	} else {
		const component_signal = (hot_data.component_signal = source(component));

		// @ts-ignore
		hot_data.proxy = function (target, ...args) {
			/** @type {ComponentReturn} */
			let current_accessors;

			key(
				target,
				() => get(component_signal),
				($$anchor) => {
					const current_component = get(component_signal);
					// @ts-ignore
					current_accessors = current_component($$anchor, ...args);
				}
			);

			return new Proxy(
				{},
				{
					get(_, p) {
						// we actually want to crash if no accessors, because no HMR code would crash
						// @ts-ignore
						return current_accessors[p];
					},
					set(_, p, value) {
						// we actually want to crash if no accessors, because no HMR code would crash
						// @ts-ignore
						current_accessors[p] = value;
						return true;
					}
				}
			);
		};
	}

	return hot_data.proxy;
}
