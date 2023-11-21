// This should contain all the public interfaces (not all of them are actually importable, check current Svelte for which ones are).

/**
 * @deprecated Svelte components were classes in Svelte 4. In Svelte 5, thy are not anymore.
 * Use `mount` or `createRoot` instead to instantiate components.
 * See [breaking changes](https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes)
 * for more info.
 */
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
 * Can be used to create strongly typed Svelte components.
 *
 * #### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import { SvelteComponent } from "svelte";
 * export class MyComponent extends SvelteComponent<{foo: string}> {}
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
 *
 * This was the base class for Svelte components in Svelte 4. Svelte 5+ components
 * are completely different under the hood. You should only use this type for typing,
 * not actually instantiate components with `new` - use `mount` or `createRoot` instead.
 * See [breaking changes](https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes)
 * for more info.
 */
export class SvelteComponent<
	Props extends Record<string, any> = any,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> {
	[prop: string]: any;

	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	constructor(props: Props);
	/**
	 * @deprecated This constructor only exists when using the `asClassComponent` compatibility helper, which
	 * is a stop-gap solution. Migrate towards using `mount` or `createRoot` instead. See
	 * https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes for more info.
	 */
	constructor(options: ComponentConstructorOptions<Props>);
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 * */
	$$prop_def: Props;
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 *
	 * */
	$$events_def: Events;
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 *
	 * */
	$$slot_def: Slots;

	/**
	 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
	 * is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
	 * for more info.
	 */
	$destroy(): void;

	/**
	 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
	 * is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
	 * for more info.
	 */
	$on<K extends Extract<keyof Events, string>>(
		type: K,
		callback: (e: Events[K]) => void
	): () => void;

	/**
	 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
	 * is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
	 * for more info.
	 */
	$set(props: Partial<Props>): void;
}

/**
 * @deprecated Use `SvelteComponent` instead. See TODO for more information.
 */
export class SvelteComponentTyped<
	Props extends Record<string, any> = any,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> extends SvelteComponent<Props, Events, Slots> {}

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
export type ComponentEvents<Comp extends SvelteComponent> = Comp extends SvelteComponent<
	any,
	infer Events
>
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
export type ComponentProps<Comp extends SvelteComponent> = Comp extends SvelteComponent<infer Props>
	? Props
	: never;

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
export type ComponentType<Comp extends SvelteComponent> = (new (
	options: ComponentConstructorOptions<
		Comp extends SvelteComponent<infer Props> ? Props : Record<string, any>
	>
) => Comp) & {
	/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
	element?: typeof HTMLElement;
};

declare const SnippetReturn: unique symbol;

/**
 * The type of a `#snippet` block. You can use it to (for example) express that your component expects a snippet of a certain type:
 * ```ts
 * let { banner } = $props<{ banner: Snippet<{ text: string }> }>();
 * ```
 * You can only call a snippet through the `{@render ...}` tag.
 */
export interface Snippet<T = void> {
	(arg: T): typeof SnippetReturn;
}

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
