// This should contain all the public interfaces (not all of them are actually importable, check current Svelte for which ones are).
// Once we convert to JSDoc make it a d.ts file.

import type {
	ComponentConstructorOptions,
	SvelteComponent,
	SvelteComponentTyped
} from '../legacy/public.js';

// For Svelte 6 we can think about only exporting these from svelte/legacy
export { SvelteComponent, SvelteComponentTyped, ComponentConstructorOptions };

/**
 * Base interface for Svelte components.
 *
 * Can be used to create strongly typed Svelte components.
 *
 * #### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import type { Component } from "svelte";
 * export type MyComponent = Component<{foo: string}>
 * ```
 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
 * to provide intellisense and to use the component like this in a Svelte file
 * with TypeScript:
 * ```svelte
 * <script lang="ts">
 * 	import { MyComponent } from "component-library";
 * </script>
 * <MyComponent foo={'bar'} />
 * ```
 */
export interface Component<
	Props extends Record<string, any> = {},
	Exports extends Record<string, any> | undefined = undefined,
	Events extends Record<string, any> = {},
	Slots extends Record<string, any> = {}
> {
	/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
	element?: typeof HTMLElement;

	/**
	 * ## DO NOT USE THIS
	 * This only exists for typing purposes and has no runtime value.
	 */
	z_$$(
		props: Props,
		events: Events,
		slots: Slots
	): Exports extends undefined ? Props | undefined : Exports & Partial<Props>;
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
export type ComponentEvents<Comp extends Component<any, any, any, any> | SvelteComponent> =
	Comp extends SvelteComponent<any, infer Events>
		? Events
		: Comp extends Component<any, any, infer Events, any>
		? Events
		: never;

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
export type ComponentProps<Comp extends Component<any, any, any, any> | SvelteComponent> =
	Comp extends SvelteComponent<infer Props>
		? Props
		: Comp extends Component<infer Props, any, any, any>
		? Props
		: never;

/**
 * Convenience type to get the type of a Svelte component. Not necessary when using the `Component` type,
 * but useful when using the deprecated `SvelteComponent` type and for example in combination with
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
export type ComponentType<Comp extends Component<any, any, any, any> | SvelteComponent> =
	Comp extends SvelteComponent
		? (new (
				options: ComponentConstructorOptions<
					Comp extends SvelteComponent<infer Props> ? Props : Record<string, any>
				>
		  ) => Comp) & {
				/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
				element?: typeof HTMLElement;
		  }
		: Comp;

interface DispatchOptions {
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

export * from './main-client.js';
import './ambient.js';
