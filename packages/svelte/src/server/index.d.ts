import type { Csp, RenderOutput } from './public.js';
import type { ComponentProps, Component, SvelteComponent, ComponentType } from 'svelte';

export type { Csp, RenderOutput, SyncRenderOutput, Sha256Source } from './public.js';

/**
 * Prevents `T` from being inferred from the value it annotates (like the built-in `NoInfer`, which requires TypeScript 5.4)
 */
type NoInferProps<T> = [T][T extends any ? 0 : never];

/**
 * Only available on the server and when compiling with the `server` option.
 * Takes a component and returns an object with `body` and `head` properties on it, which you can use to populate the HTML when server-rendering your app.
 */
export function render<
	Comp extends SvelteComponent<any> | Component<any>,
	Props extends ComponentProps<Comp> = ComponentProps<Comp>
>(
	...args: {} extends Props
		? [
				component: Comp extends SvelteComponent<any> ? ComponentType<Comp> : Comp,
				options?: {
					props?: NoInferProps<Props>;
					context?: Map<any, any>;
					idPrefix?: string;
					csp?: Csp;
					transformError?: (error: unknown) => unknown | Promise<unknown>;
				}
			]
		: [
				component: Comp extends SvelteComponent<any> ? ComponentType<Comp> : Comp,
				options: {
					props: NoInferProps<Props>;
					context?: Map<any, any>;
					idPrefix?: string;
					csp?: Csp;
					transformError?: (error: unknown) => unknown | Promise<unknown>;
				}
			]
): RenderOutput;
