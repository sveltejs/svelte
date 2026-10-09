import type { UnevalReplacer } from 'devalue';
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
					/**
					 * Customizes how values added to `Warp` instances are serialized. See [`devalue`](https://github.com/sveltejs/devalue#custom-types) for details.
					 * If the render happens inside `withWarp`, this replacer runs before the one passed to `withWarp`.
					 */
					replacer?: UnevalReplacer;
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
					/**
					 * Customizes how values added to `Warp` instances are serialized. See [`devalue`](https://github.com/sveltejs/devalue#custom-types) for details.
					 * If the render happens inside `withWarp`, this replacer runs before the one passed to `withWarp`.
					 */
					replacer?: UnevalReplacer;
				}
			]
): RenderOutput;

/**
 * Only available on the server. Runs `fn` with a context in which `Warp` instances can be used.
 * A `render` call inside `fn` will use the same context, and serialize all the values added to
 * `Warp` instances inside `fn` — whether they were added before or during the render.
 * Only one `render` can happen inside a given `withWarp`.
 */
export function withWarp<T>(
	fn: () => T | Promise<T>,
	options?: {
		/**
		 * Customizes how values added to `Warp` instances are serialized. See [`devalue`](https://github.com/sveltejs/devalue#custom-types) for details.
		 */
		replacer?: UnevalReplacer;
	}
): Promise<T>;
