/** @import { SvelteComponent } from '../index.js' */
import { asClassComponent as as_class_component, createClassComponent } from './legacy-client.js';
import { render } from '../internal/server/index.js';

// By having this as a separate entry point for server environments, we save the client bundle from having to include the server runtime

export { createClassComponent };

/**
 * Takes a Svelte 5 component and returns a Svelte 4 compatible component constructor.
 *
 * @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template {Record<string, any>} Events
 * @template {Record<string, any>} Slots
 *
 * @param {SvelteComponent<Props, Events, Slots>} component
 * @returns {typeof SvelteComponent<Props, Events, Slots> & Exports}
 */
export function asClassComponent(component) {
	const component_constructor = as_class_component(component);
	/** @type {(props?: {}, opts?: { $$slots?: {}; context?: Map<any, any>; }) => { html: any; css: { code: string; map: any; }; head: string; } } */
	const _render = (props, { context } = {}) => {
		// @ts-expect-error the typings are off, but this will work if the component is compiled in SSR mode
		const result = render(component, { props, context });
		return {
			css: { code: '', map: null },
			head: result.head,
			html: result.body
		};
	};
	// @ts-expect-error this is present for SSR
	component_constructor.render = _render;

	// @ts-ignore
	return component_constructor;
}

/**
 * Runs the given function once immediately on the server, and works like `$effect.pre` on the client.
 *
 * @deprecated Use this only as a temporary solution to migrate your component code to Svelte 5.
 * @param {() => void | (() => void)} fn
 * @returns {void}
 */
export function run(fn) {
	fn();
}
