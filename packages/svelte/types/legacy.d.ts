/// <reference path="./ambient.d.ts" />
import type { Brand, Branded, Component, ComponentConstructorOptions, ComponentEvents, ComponentInternals, ComponentProps, ComponentType, DispatchOptions, EventDispatcher, Fork, Getters, MountOptions, NotFunction, Properties, Snippet, SnippetReturn, SvelteComponent, SvelteComponentTyped, afterUpdate, beforeUpdate, brand, createContext, createEventDispatcher, createRawSnippet, flushSync, fork, getAbortSignal, getAllContexts, getContext, hasContext, hydratable, hydrate, mount, onDestroy, onMount, setContext, settled, tick, unmount, untrack } from './shared';
/**
 * Takes the same options as a Svelte 4 component and the component function and returns a Svelte 4 compatible component.
 *
 * @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
 *
 * */
export function createClassComponent<Props extends Record<string, any>, Exports extends Record<string, any>, Events extends Record<string, any>, Slots extends Record<string, any>>(options: ComponentConstructorOptions<Props> & {
	component: ComponentType<SvelteComponent<Props, Events, Slots>> | Component<Props>;
}): SvelteComponent<Props, Events, Slots> & Exports;
/**
 * Takes the component function and returns a Svelte 4 compatible component constructor.
 *
 * @deprecated Use this only as a temporary solution to migrate your imperative component code to Svelte 5.
 *
 * */
export function asClassComponent<Props extends Record<string, any>, Exports extends Record<string, any>, Events extends Record<string, any>, Slots extends Record<string, any>>(component: SvelteComponent<Props, Events, Slots> | Component<Props>): ComponentType<SvelteComponent<Props, Events, Slots> & Exports>;
/**
 * Runs the given function once immediately on the server, and works like `$effect.pre` on the client.
 *
 * @deprecated Use this only as a temporary solution to migrate your component code to Svelte 5.
 * */
export function run(fn: () => void | (() => void)): void;
/**
 * Function to mimic the multiple listeners available in svelte 4
 * @deprecated
 * */
export function handlers(...handlers: EventListener[]): EventListener;
/**
 * Function to create a `bubble` function that mimic the behavior of `on:click` without handler available in svelte 4.
 * @deprecated Use this only as a temporary solution to migrate your automatically delegated events in Svelte 5.
 */
export function createBubbler(): (type: string) => (event: Event) => boolean;
/**
 * Support using the component as both a class and function during the transition period
 */
export type LegacyComponentType = {
	new (o: ComponentConstructorOptions): SvelteComponent;
	(...args: Parameters<Component<Record<string, any>>>): ReturnType<Component<Record<string, any>, Record<string, any>>>;
};
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