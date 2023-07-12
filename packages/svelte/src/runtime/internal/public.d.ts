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
 * Type utile pour obtenir les évènements qu'un composant attend. Exemple :
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
 * Type utile pour obtenir les <span class='vo'>[props](/docs/sveltejs#props)</span> qu'un composant attend. Exemple :
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
 * Type utile pour obtenir le type d'un composant Svelte. Pratique par exemple lorsqu'on utilise les
 * composants dynamiques avec `<svelte:component>`.
 *
 * Exemple:
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
	/** La version "web component" du composant. Seulement présent si compilé avec l'option `customElement` */
	element?: typeof HTMLElement;
};

export interface DispatchOptions {
	cancelable?: boolean;
}

export interface EventDispatcher<EventMap extends Record<string, any>> {
	// Implementation notes:
	// - undefined extends X instead of X extends undefined makes this work better with both strict and nonstrict mode
	// - | null | undefined is added for convenience, as they are equivalent for the custom event constructor (both result in a null detail)
	<Type extends keyof EventMap>(
		...args: null extends EventMap[Type]
			? [type: Type, parameter?: EventMap[Type] | null | undefined, options?: DispatchOptions]
			: undefined extends EventMap[Type]
			? [type: Type, parameter?: EventMap[Type] | null | undefined, options?: DispatchOptions]
			: [type: Type, parameter: EventMap[Type], options?: DispatchOptions]
	): boolean;
}
