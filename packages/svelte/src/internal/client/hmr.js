import { key } from './render.js';
import { source, set, get } from './runtime.js';

/**
 * @template {any[]} ComponentArgs
 * @template {Record<string | symbol, any> | undefined} ComponentReturn
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
			const accessors = source(/** @type {ComponentReturn} */ ({}));

			key(
				target,
				() => get(component_signal),
				($$anchor) => {
					const current_component = get(component_signal);
					// @ts-ignore
					const new_accessors = current_component($$anchor, ...args);
					set(accessors, new_accessors);
				}
			);

			return new Proxy(
				{},
				{
					get(_, p) {
						return get(accessors)?.[p];
					},
					set(_, p, value) {
						// @ts-ignore (we actually want to crash on undefined, like non HMR code would do)
						get(accessors)[p] = value;
						return true;
					}
				}
			);
		};
	}

	return hot_data.proxy;
}
