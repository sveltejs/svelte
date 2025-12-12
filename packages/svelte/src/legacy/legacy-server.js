/** @import { SvelteComponent } from '../index.js' */
import { asClassComponent as as_class_component, createClassComponent } from './legacy-client.js';
import { render } from '../internal/server/index.js';
import { async_mode_flag } from '../internal/flags/index.js';
import * as w from '../internal/server/warnings.js';

// By having this as a separate entry point for server environments, we save the client bundle from having to include the server runtime

export { createClassComponent };

/** @typedef {{ head: string, html: string, css: { code: string, map: null }}} LegacyRenderResult */

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
	/** @type {(props?: {}, opts?: { $$slots?: {}; context?: Map<any, any>; }) => LegacyRenderResult & PromiseLike<LegacyRenderResult> } */
	const _render = (props, { context } = {}) => {
		// @ts-expect-error the typings are off, but this will work if the component is compiled in SSR mode
		const result = render(component, { props, context });

		const munged = Object.defineProperties(
			/** @type {LegacyRenderResult & PromiseLike<LegacyRenderResult>} */ ({}),
			{
				css: {
					value: { code: '', map: null }
				},
				head: {
					get: () => result.head
				},
				html: {
					get: () => result.body
				},
				then: {
					/**
					 * this is not type-safe, but honestly it's the best I can do right now, and it's a straightforward function.
					 *
					 * @template TResult1
					 * @template [TResult2=never]
					 * @param { (value: LegacyRenderResult) => TResult1 } onfulfilled
					 * @param { (reason: unknown) => TResult2 } onrejected
					 */
					value: (onfulfilled, onrejected) => {
						if (!async_mode_flag) {
							const user_result = onfulfilled({
								css: munged.css,
								head: munged.head,
								html: munged.html
							});
							return Promise.resolve(user_result);
						}

						return result.then((result) => {
							return onfulfilled({
								css: munged.css,
								head: result.head,
								html: result.body
							});
						}, onrejected);
					}
				}
			}
		);

		return munged;
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

const noop = () => {};

// event stuff, no need to worry about it for SSR but needs to be there or it will crash
export {
	noop as handlers,
	noop as createBubbler,
	noop as once,
	noop as preventDefault,
	noop as self,
	noop as stopImmediatePropagation,
	noop as stopPropagation,
	noop as trusted,
	noop as passive,
	noop as nonpassive
};
