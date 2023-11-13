import { asClassComponent as as_class_component, createClassComponent } from './legacy-client.js';
import { render } from '../internal/server/index.js';

// By having this as a separate entry point for server environments, we save the client bundle from having to include the server runtime

export { createClassComponent };

/**
 * Takes the component function and returns a Svelte 4 compatible component constructor.
 *
 * @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
 *
 * @template {Record<string, any>} Props
 * @template {Record<string, any>} Exports
 * @template {Record<string, any>} Events
 * @template {Record<string, any>} Slots
 *
 * @param {import('../main/public.js').Component<Props, Exports, Events, Slots>} component
 * @returns {typeof import('./public.js').SvelteComponent<Props & Exports, Events, Slots>}
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
			html: result.html
		};
	};
	// @ts-expect-error this is present for SSR
	component_constructor.render = _render;

	return component_constructor;
}
