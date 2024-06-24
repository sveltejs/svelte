import type { RenderOutput } from '#server';
import type { ComponentProps, Component, SvelteComponent, ComponentType } from 'svelte';

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
				options?: { props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any> }
			]
		: [
				component: Comp extends SvelteComponent<any> ? ComponentType<Comp> : Comp,
				options: { props: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any> }
			]
): RenderOutput;
