// This should contain all the public interfaces (not all of them are actually importable, check current Svelte for which ones are).

import './ambient.js';

/**
 * @deprecated In Svelte 4, components are classes. In Svelte 5, they are functions.
 * Use `mount` instead to instantiate components.
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
 * Utility type for ensuring backwards compatibility on a type level that if there's a default slot, add 'children' to the props
 */
type Properties<Props, Slots> = Props &
	(Slots extends { default: any }
		? // This is unfortunate because it means "accepts no props" turns into "accepts any prop"
			// but the alternative is non-fixable type errors because of the way TypeScript index
			// signatures work (they will always take precedence and make an impossible-to-satisfy children type).
			Props extends Record<string, never>
			? any
			: { children?: any }
		: {});

/**
 * This was the base class for Svelte components in Svelte 4. Svelte 5+ components
 * are completely different under the hood. For typing, use `Component` instead.
 * To instantiate components, use `mount` instead`.
 * See [breaking changes documentation](https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes) for more info.
 */
export class SvelteComponent<
	Props extends Record<string, any> = Record<string, any>,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> {
	/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
	static element?: typeof HTMLElement;

	[prop: string]: any;
	/**
	 * @deprecated This constructor only exists when using the `asClassComponent` compatibility helper, which
	 * is a stop-gap solution. Migrate towards using `mount` instead. See
	 * https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes for more info.
	 */
	constructor(options: ComponentConstructorOptions<Properties<Props, Slots>>);
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$prop_def: Props; // Without Properties: unnecessary, causes type bugs
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$events_def: Events;
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$slot_def: Slots;
	/**
	 * For type checking capabilities only.
	 * Does not exist at runtime.
	 * ### DO NOT USE!
	 */
	$$bindings?: string;

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

declare const brand: unique symbol;
type Brand<B> = { [brand]: B };
type Branded<T, B> = T & Brand<B>;

/**
 * Internal implementation details that vary between environments
 */
export type ComponentInternals = Branded<{}, 'ComponentInternals'>;

/**
 * Can be used to create strongly typed Svelte components.
 *
 * #### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import type { Component } from 'svelte';
 * export declare const MyComponent: Component<{ foo: string }> {}
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
	Exports extends Record<string, any> = {},
	Bindings extends keyof Props | '' = string
> {
	/**
	 * @param internal An internal object used by Svelte. Do not use or modify.
	 * @param props The props passed to the component.
	 */
	(
		this: void,
		internals: ComponentInternals,
		props: Props
	): {
		/**
		 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
		 * is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
		 * for more info.
		 */
		$on?(type: string, callback: (e: any) => void): () => void;
		/**
		 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
		 * is a stop-gap solution. See https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes
		 * for more info.
		 */
		$set?(props: Partial<Props>): void;
	} & Exports;
	/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
	element?: typeof HTMLElement;
	/** Does not exist at runtime, for typing capabilities only. DO NOT USE */
	z_$$bindings?: Bindings;
}

/**
 * @deprecated Use `Component` instead. See [breaking changes documentation](https://svelte-5-preview.vercel.app/docs/breaking-changes#components-are-no-longer-classes) for more information.
 */
export class SvelteComponentTyped<
	Props extends Record<string, any> = Record<string, any>,
	Events extends Record<string, any> = any,
	Slots extends Record<string, any> = any
> extends SvelteComponent<Props, Events, Slots> {}

/**
 * @deprecated The new `Component` type does not have a dedicated Events type. Use `ComponentProps` instead.
 *
 * @description
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
export type ComponentEvents<Comp extends SvelteComponent> =
	Comp extends SvelteComponent<any, infer Events> ? Events : never;

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
 * const props: ComponentProps<MyComponent> = { foo: 'bar' };
 * ```
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
export type ComponentProps<Comp extends SvelteComponent | Component<any>> =
	Comp extends SvelteComponent<infer Props>
		? Props
		: Comp extends Component<infer Props>
			? Props
			: never;

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
export type ComponentType<Comp extends SvelteComponent = SvelteComponent> = (new (
	options: ComponentConstructorOptions<
		Comp extends SvelteComponent<infer Props> ? Props : Record<string, any>
	>
) => Comp) & {
	/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
	element?: typeof HTMLElement;
};

declare const SnippetReturn: unique symbol;

// Use an interface instead of a type, makes for better intellisense info because the type is named in more situations.
/**
 * The type of a `#snippet` block. You can use it to (for example) express that your component expects a snippet of a certain type:
 * ```ts
 * let { banner }: { banner: Snippet<[{ text: string }]> } = $props();
 * ```
 * You can only call a snippet through the `{@render ...}` tag.
 *
 * https://svelte-5-preview.vercel.app/docs/snippets
 *
 * @template Parameters the parameters that the snippet expects (if any) as a tuple.
 */
export interface Snippet<Parameters extends unknown[] = []> {
	(
		this: void,
		// this conditional allows tuples but not arrays. Arrays would indicate a
		// rest parameter type, which is not supported. If rest parameters are added
		// in the future, the condition can be removed.
		...args: number extends Parameters['length'] ? never : Parameters
	): typeof SnippetReturn & {
		_: 'functions passed to {@render ...} tags must use the `Snippet` type imported from "svelte"';
	};
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

export * from './index-client.js';
