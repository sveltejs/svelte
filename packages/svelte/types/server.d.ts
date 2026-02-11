/// <reference path="./ambient.d.ts" />
import type { Brand, Branded, Component, ComponentConstructorOptions, ComponentEvents, ComponentInternals, ComponentProps, ComponentType, DispatchOptions, EventDispatcher, Fork, Getters, MountOptions, NotFunction, Properties, Snippet, SnippetReturn, SvelteComponent, SvelteComponentTyped, afterUpdate, beforeUpdate, brand, createContext, createEventDispatcher, createRawSnippet, flushSync, fork, getAbortSignal, getAllContexts, getContext, hasContext, hydratable, hydrate, mount, onDestroy, onMount, setContext, settled, tick, unmount, untrack } from './shared';
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
				}
			]
		: [
				component: Comp extends SvelteComponent<any> ? ComponentType<Comp> : Comp,
				options: {
					props: Omit<Props, '$$slots' | '$$events'>;
					context?: Map<any, any>;
					idPrefix?: string;
					csp?: Csp;
				}
			]
): RenderOutput;
export type Csp = { nonce?: string; hash?: boolean };

export type Sha256Source = `sha256-${string}`;

export interface SyncRenderOutput {
	/** HTML that goes into the `<head>` */
	head: string;
	/** @deprecated use `body` instead */
	html: string;
	/** HTML that goes somewhere into the `<body>` */
	body: string;
	hashes: {
		script: Sha256Source[];
	};
}

export type RenderOutput = SyncRenderOutput & PromiseLike<SyncRenderOutput>;
/**
 * @deprecated In Svelte 4, components are classes. In Svelte 5, they are functions.
 * Use `mount` instead to instantiate components.
 * See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)
 * for more info.
 */

/**
 * Utility type for ensuring backwards compatibility on a type level that if there's a default slot, add 'children' to the props
 */


/**
 * Convenience type to get the props the given component expects.
 *
 * Example: Ensure a variable contains the props expected by `MyComponent`:
 *
 * ```ts
 * import type { ComponentProps } from 'svelte';
 * import MyComponent from './MyComponent.svelte';
 *
 * // Errors if these aren't the correct props expected by MyComponent.
 * const props: ComponentProps<typeof MyComponent> = { foo: 'bar' };
 * ```
 *
 * > [!NOTE] In Svelte 4, you would do `ComponentProps<MyComponent>` because `MyComponent` was a class.
 *
 * Example: A generic function that accepts some component and infers the type of its props:
 *
 * ```ts
 * import type { Component, ComponentProps } from 'svelte';
 * import MyComponent from './MyComponent.svelte';
 *
 * function withProps<TComponent extends Component<any>>(
 * 	component: TComponent,
 * 	props: ComponentProps<TComponent>
 * ) {};
 *
 * // Errors if the second argument is not the correct props expected by the component in the first argument.
 * withProps(MyComponent, { foo: 'bar' });
 * ```
 */

/**
 * @deprecated This type is obsolete when working with the new `Component` type.
 *
 * @description
 * Convenience type to get the type of a Svelte component. Useful for example in combination with
 * dynamic components using `<svelte:component>`.
 *
 * Example:
 * ```html
 * <script lang="ts">
 * 	import type { ComponentType, SvelteComponent } from 'svelte';
 * 	import Component1 from './Component1.svelte';
 * 	import Component2 from './Component2.svelte';
 *
 * 	const component: ComponentType = someLogic() ? Component1 : Component2;
 * 	const componentOfCertainSubType: ComponentType<SvelteComponent<{ needsThisProp: string }>> = someLogic() ? Component1 : Component2;
 * </script>
 *
 * <svelte:component this={component} />
 * <svelte:component this={componentOfCertainSubType} needsThisProp="hello" />
 * ```
 */