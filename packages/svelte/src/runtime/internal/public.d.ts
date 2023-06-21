import { SvelteComponent } from './Component.js';
import { SvelteComponentDev } from './dev.js';

export interface ComponentConstructorOptions<
	Props extends Record<string, any> = Record<string, any>
> {
	target: Element | Document | ShadowRoot;
	anchor?: Element;
	props?: Props;
	context?: Map<any, any>;
	hydrate?: boolean;
	intro?: boolean;
	$$inline?: boolean;
}

/**
 * Convenience type to get the events the given component expects. Example:
 * ```html
 * <script lang="ts">
 *    import type { ComponentEvents } from 'svelte';
 *    import Component from './Component.svelte';
 *
 *    function handleCloseEvent(event: ComponentEvents<Component>['close']) {
 *       console.log(event.detail);
 *    }
 * </script>
 *
 * <Component on:close={handleCloseEvent} />
 * ```
 */
export type ComponentEvents<Component extends SvelteComponent> =
	Component extends SvelteComponentDev<any, infer Events> ? Events : never;

/**
 * Convenience type to get the props the given component expects. Example:
 * ```html
 * <script lang="ts">
 * 	import type { ComponentProps } from 'svelte';
 * 	import Component from './Component.svelte';
 *
 * 	const props: ComponentProps<Component> = { foo: 'bar' }; // Errors if these aren't the correct props
 * </script>
 * ```
 */
export type ComponentProps<Component extends SvelteComponent> =
	Component extends SvelteComponentDev<infer Props> ? Props : never;

/**
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
export type ComponentType<Component extends SvelteComponentDev = SvelteComponentDev> = (new (
	options: ComponentConstructorOptions<
		Component extends SvelteComponentDev<infer Props> ? Props : Record<string, any>
	>
) => Component) & {
	/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
	element?: typeof HTMLElement;
};

export interface DispatchOptions {
	cancelable?: boolean;
}

export interface EventDispatcher<EventMap extends Record<string, any>> {
	// Implementation notes:
	// - undefined extends X instead of X extends undefined makes this work better with both strict and nonstrict mode
	// - [X] extends [never] is needed, X extends never would reduce the whole resulting type to never and not to one of the condition outcomes
	<Type extends keyof EventMap>(
		...args: [EventMap[Type]] extends [never]
			? [type: Type, parameter?: null | undefined, options?: DispatchOptions]
			: null extends EventMap[Type]
			? [type: Type, parameter?: EventMap[Type], options?: DispatchOptions]
			: undefined extends EventMap[Type]
			? [type: Type, parameter?: EventMap[Type], options?: DispatchOptions]
			: [type: Type, parameter: EventMap[Type], options?: DispatchOptions]
	): boolean;
}
