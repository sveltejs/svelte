import type { Csp, RenderOutput } from './public.js';
import type { ComponentProps, Component, SvelteComponent, ComponentType } from 'svelte';

export type { Csp, RenderOutput, SyncRenderOutput, Sha256Source } from './public.js';

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
					props?: Omit<Props, '$$slots' | '$$events'>;
					context?: Map<any, any>;
					idPrefix?: string;
					csp?: Csp;
					transformError?: (error: unknown) => unknown | Promise<unknown>;
				}
			]
		: [
				component: Comp extends SvelteComponent<any> ? ComponentType<Comp> : Comp,
				options: {
					props: Omit<Props, '$$slots' | '$$events'>;
					context?: Map<any, any>;
					idPrefix?: string;
					csp?: Csp;
					transformError?: (error: unknown) => unknown | Promise<unknown>;
				}
			]
): RenderOutput;
