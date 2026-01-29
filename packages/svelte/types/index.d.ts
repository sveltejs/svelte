/// <reference types="esrap" />

declare module 'svelte' {
	/**
	 * @deprecated In Svelte 4, components are classes. In Svelte 5, they are functions.
	 * Use `mount` instead to instantiate components.
	 * See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)
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
		recover?: boolean;
		sync?: boolean;
		idPrefix?: string;
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
	 * To instantiate components, use `mount` instead.
	 * See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes) for more info.
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
		 * [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes) for more info.
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
		 * is a stop-gap solution. See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)
		 * for more info.
		 */
		$destroy(): void;

		/**
		 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
		 * is a stop-gap solution. See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)
		 * for more info.
		 */
		$on<K extends Extract<keyof Events, string>>(
			type: K,
			callback: (e: Events[K]) => void
		): () => void;

		/**
		 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
		 * is a stop-gap solution. See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)
		 * for more info.
		 */
		$set(props: Partial<Props>): void;
	}

	const brand: unique symbol;
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
			 * is a stop-gap solution. See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)
			 * for more info.
			 */
			$on?(type: string, callback: (e: any) => void): () => void;
			/**
			 * @deprecated This method only exists when using one of the legacy compatibility helpers, which
			 * is a stop-gap solution. See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes)
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
	 * @deprecated Use `Component` instead. See [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes) for more information.
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
	export type ComponentProps<Comp extends SvelteComponent | Component<any, any>> =
		Comp extends SvelteComponent<infer Props>
			? Props
			: Comp extends Component<infer Props, any>
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

	const SnippetReturn: unique symbol;

	// Use an interface instead of a type, makes for better intellisense info because the type is named in more situations.
	/**
	 * The type of a `#snippet` block. You can use it to (for example) express that your component expects a snippet of a certain type:
	 * ```ts
	 * let { banner }: { banner: Snippet<[{ text: string }]> } = $props();
	 * ```
	 * You can only call a snippet through the `{@render ...}` tag.
	 *
	 * See the [snippet documentation](https://svelte.dev/docs/svelte/snippet) for more info.
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
		): {
			'{@render ...} must be called with a Snippet': "import type { Snippet } from 'svelte'";
		} & typeof SnippetReturn;
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

	/**
	 * Defines the options accepted by the `mount()` function.
	 */
	export type MountOptions<Props extends Record<string, any> = Record<string, any>> = {
		/**
		 * Target element where the component will be mounted.
		 */
		target: Document | Element | ShadowRoot;
		/**
		 * Optional node inside `target`. When specified, it is used to render the component immediately before it.
		 */
		anchor?: Node;
		/**
		 * Allows the specification of events.
		 * @deprecated Use callback props instead.
		 */
		events?: Record<string, (e: any) => any>;
		/**
		 * Can be accessed via `getContext()` at the component level.
		 */
		context?: Map<any, any>;
		/**
		 * Whether or not to play transitions on initial render.
		 * @default true
		 */
		intro?: boolean;
	} & ({} extends Props
		? {
				/**
				 * Component properties.
				 */
				props?: Props;
			}
		: {
				/**
				 * Component properties.
				 */
				props: Props;
			});

	/**
	 * Represents work that is happening off-screen, such as data being preloaded
	 * in anticipation of the user navigating
	 * @since 5.42
	 */
	export interface Fork {
		/**
		 * Commit the fork. The promise will resolve once the state change has been applied
		 */
		commit(): Promise<void>;
		/**
		 * Discard the fork
		 */
		discard(): void;
	}
	/**
	 * Returns an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that aborts when the current [derived](https://svelte.dev/docs/svelte/$derived) or [effect](https://svelte.dev/docs/svelte/$effect) re-runs or is destroyed.
	 *
	 * Must be called while a derived or effect is running.
	 *
	 * ```svelte
	 * <script>
	 * 	import { getAbortSignal } from 'svelte';
	 *
	 * 	let { id } = $props();
	 *
	 * 	async function getData(id) {
	 * 		const response = await fetch(`/items/${id}`, {
	 * 			signal: getAbortSignal()
	 * 		});
	 *
	 * 		return await response.json();
	 * 	}
	 *
	 * 	const data = $derived(await getData(id));
	 * </script>
	 * ```
	 */
	export function getAbortSignal(): AbortSignal;
	/**
	 * `onMount`, like [`$effect`](https://svelte.dev/docs/svelte/$effect), schedules a function to run as soon as the component has been mounted to the DOM.
	 * Unlike `$effect`, the provided function only runs once.
	 *
	 * It must be called during the component's initialisation (but doesn't need to live _inside_ the component;
	 * it can be called from an external module). If a function is returned _synchronously_ from `onMount`,
	 * it will be called when the component is unmounted.
	 *
	 * `onMount` functions do not run during [server-side rendering](https://svelte.dev/docs/svelte/svelte-server#render).
	 *
	 * */
	export function onMount<T>(fn: () => NotFunction<T> | Promise<NotFunction<T>> | (() => any)): void;
	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * */
	export function onDestroy(fn: () => any): void;
	/**
	 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs/svelte/legacy-on#Component-events).
	 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
	 *
	 * Component events created with `createEventDispatcher` create a
	 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
	 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
	 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
	 * property and can contain any type of data.
	 *
	 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
	 * ```ts
	 * const dispatch = createEventDispatcher<{
	 *  loaded: null; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * @deprecated Use callback props and/or the `$host()` rune instead — see [migration guide](https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes-Component-events)
	 * */
	export function createEventDispatcher<EventMap extends Record<string, any> = any>(): EventDispatcher<EventMap>;
	/**
	 * Schedules a callback to run immediately before the component is updated after any state change.
	 *
	 * The first time the callback runs will be before the initial `onMount`.
	 *
	 * In runes mode use `$effect.pre` instead.
	 *
	 * @deprecated Use [`$effect.pre`](https://svelte.dev/docs/svelte/$effect#$effect.pre) instead
	 * */
	export function beforeUpdate(fn: () => void): void;
	/**
	 * Schedules a callback to run immediately after the component has been updated.
	 *
	 * The first time the callback runs will be after the initial `onMount`.
	 *
	 * In runes mode use `$effect` instead.
	 *
	 * @deprecated Use [`$effect`](https://svelte.dev/docs/svelte/$effect) instead
	 * */
	export function afterUpdate(fn: () => void): void;
	export function hydratable<T>(key: string, fn: () => T): T;
	/**
	 * Create a snippet programmatically
	 * */
	export function createRawSnippet<Params extends unknown[]>(fn: (...params: Getters<Params>) => {
		render: () => string;
		setup?: (element: Element) => void | (() => void);
	}): Snippet<Params>;
	/** Anything except a function */
	type NotFunction<T> = T extends Function ? never : T;
	/**
	 * Synchronously flush any pending updates.
	 * Returns void if no callback is provided, otherwise returns the result of calling the callback.
	 * */
	export function flushSync<T = void>(fn?: (() => T) | undefined): T;
	/**
	 * Creates a 'fork', in which state changes are evaluated but not applied to the DOM.
	 * This is useful for speculatively loading data (for example) when you suspect that
	 * the user is about to take some action.
	 *
	 * Frameworks like SvelteKit can use this to preload data when the user touches or
	 * hovers over a link, making any subsequent navigation feel instantaneous.
	 *
	 * The `fn` parameter is a synchronous function that modifies some state. The
	 * state changes will be reverted after the fork is initialised, then reapplied
	 * if and when the fork is eventually committed.
	 *
	 * When it becomes clear that a fork will _not_ be committed (e.g. because the
	 * user navigated elsewhere), it must be discarded to avoid leaking memory.
	 *
	 * @since 5.42
	 */
	export function fork(fn: () => void): Fork;
	/**
	 * Returns a `[get, set]` pair of functions for working with context in a type-safe way.
	 *
	 * `get` will throw an error if no parent component called `set`.
	 *
	 * @since 5.40.0
	 */
	export function createContext<T>(): [() => T, (context: T) => T];
	/**
	 * Retrieves the context that belongs to the closest parent component with the specified `key`.
	 * Must be called during component initialisation.
	 *
	 * [`createContext`](https://svelte.dev/docs/svelte/svelte#createContext) is a type-safe alternative.
	 *
	 * */
	export function getContext<T>(key: any): T;
	/**
	 * Associates an arbitrary `context` object with the current component and the specified `key`
	 * and returns that object. The context is then available to children of the component
	 * (including slotted content) with `getContext`.
	 *
	 * Like lifecycle functions, this must be called during component initialisation.
	 *
	 * [`createContext`](https://svelte.dev/docs/svelte/svelte#createContext) is a type-safe alternative.
	 *
	 * */
	export function setContext<T>(key: any, context: T): T;
	/**
	 * Checks whether a given `key` has been set in the context of a parent component.
	 * Must be called during component initialisation.
	 *
	 * */
	export function hasContext(key: any): boolean;
	/**
	 * Retrieves the whole context map that belongs to the closest parent component.
	 * Must be called during component initialisation. Useful, for example, if you
	 * programmatically create a component and want to pass the existing context to it.
	 *
	 * */
	export function getAllContexts<T extends Map<any, any> = Map<any, any>>(): T;
	/**
	 * Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
	 * Transitions will play during the initial render unless the `intro` option is set to `false`.
	 *
	 * */
	export function mount<Props extends Record<string, any>, Exports extends Record<string, any>>(component: ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>, options: MountOptions<Props>): Exports;
	/**
	 * Hydrates a component on the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component
	 *
	 * */
	export function hydrate<Props extends Record<string, any>, Exports extends Record<string, any>>(component: ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>, options: {} extends Props ? {
		target: Document | Element | ShadowRoot;
		props?: Props;
		events?: Record<string, (e: any) => any>;
		context?: Map<any, any>;
		intro?: boolean;
		recover?: boolean;
	} : {
		target: Document | Element | ShadowRoot;
		props: Props;
		events?: Record<string, (e: any) => any>;
		context?: Map<any, any>;
		intro?: boolean;
		recover?: boolean;
	}): Exports;
	/**
	 * Unmounts a component that was previously mounted using `mount` or `hydrate`.
	 *
	 * Since 5.13.0, if `options.outro` is `true`, [transitions](https://svelte.dev/docs/svelte/transition) will play before the component is removed from the DOM.
	 *
	 * Returns a `Promise` that resolves after transitions have completed if `options.outro` is true, or immediately otherwise (prior to 5.13.0, returns `void`).
	 *
	 * ```js
	 * import { mount, unmount } from 'svelte';
	 * import App from './App.svelte';
	 *
	 * const app = mount(App, { target: document.body });
	 *
	 * // later...
	 * unmount(app, { outro: true });
	 * ```
	 * */
	export function unmount(component: Record<string, any>, options?: {
		outro?: boolean;
	} | undefined): Promise<void>;
	/**
	 * Returns a promise that resolves once any pending state changes have been applied.
	 * */
	export function tick(): Promise<void>;
	/**
	 * Returns a promise that resolves once any state changes, and asynchronous work resulting from them,
	 * have resolved and the DOM has been updated
	 * @since 5.36
	 */
	export function settled(): Promise<void>;
	/**
	 * When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
	 * any state read inside `fn` will not be treated as a dependency.
	 *
	 * ```ts
	 * $effect(() => {
	 *   // this will run when `data` changes, but not when `time` changes
	 *   save(data, {
	 *     timestamp: untrack(() => time)
	 *   });
	 * });
	 * ```
	 * */
	export function untrack<T>(fn: () => T): T;
	type Getters<T> = {
		[K in keyof T]: () => T[K];
	};

	export {};
}

declare module 'svelte/action' {
	/**
	 * Actions can return an object containing the two properties defined in this interface. Both are optional.
	 * - update: An action can have a parameter. This method will be called whenever that parameter changes,
	 *   immediately after Svelte has applied updates to the markup. `ActionReturn` and `ActionReturn<undefined>` both
	 *   mean that the action accepts no parameters.
	 * - destroy: Method that is called after the element is unmounted
	 *
	 * Additionally, you can specify which additional attributes and events the action enables on the applied element.
	 * This applies to TypeScript typings only and has no effect at runtime.
	 *
	 * Example usage:
	 * ```ts
	 * interface Attributes {
	 * 	newprop?: string;
	 * 	'on:event': (e: CustomEvent<boolean>) => void;
	 * }
	 *
	 * export function myAction(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter, Attributes> {
	 * 	// ...
	 * 	return {
	 * 		update: (updatedParameter) => {...},
	 * 		destroy: () => {...}
	 * 	};
	 * }
	 * ```
	 */
	export interface ActionReturn<
		Parameter = undefined,
		Attributes extends Record<string, any> = Record<never, any>
	> {
		update?: (parameter: Parameter) => void;
		destroy?: () => void;
		/**
		 * ### DO NOT USE THIS
		 * This exists solely for type-checking and has no effect at runtime.
		 * Set this through the `Attributes` generic instead.
		 */
		$$_attributes?: Attributes;
	}

	/**
	 * Actions are functions that are called when an element is created.
	 * You can use this interface to type such actions.
	 * The following example defines an action that only works on `<div>` elements
	 * and optionally accepts a parameter which it has a default value for:
	 * ```ts
	 * export const myAction: Action<HTMLDivElement, { someProperty: boolean } | undefined> = (node, param = { someProperty: true }) => {
	 *   // ...
	 * }
	 * ```
	 * `Action<HTMLDivElement>` and `Action<HTMLDivElement, undefined>` both signal that the action accepts no parameters.
	 *
	 * You can return an object with methods `update` and `destroy` from the function and type which additional attributes and events it has.
	 * See interface `ActionReturn` for more details.
	 */
	export interface Action<
		Element = HTMLElement,
		Parameter = undefined,
		Attributes extends Record<string, any> = Record<never, any>
	> {
		<Node extends Element>(
			...args: undefined extends Parameter
				? [node: Node, parameter?: Parameter]
				: [node: Node, parameter: Parameter]
		): void | ActionReturn<Parameter, Attributes>;
	}

	// Implementation notes:
	// - undefined extends X instead of X extends undefined makes this work better with both strict and nonstrict mode

	export {};
}

declare module 'svelte/animate' {
	// todo: same as Transition, should it be shared?
	export interface AnimationConfig {
		delay?: number;
		duration?: number;
		easing?: (t: number) => number;
		css?: (t: number, u: number) => string;
		tick?: (t: number, u: number) => void;
	}

	export interface FlipParams {
		delay?: number;
		duration?: number | ((len: number) => number);
		easing?: (t: number) => number;
	}
	/**
	 * The flip function calculates the start and end position of an element and animates between them, translating the x and y values.
	 * `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).
	 *
	 * */
	export function flip(node: Element, { from, to }: {
		from: DOMRect;
		to: DOMRect;
	}, params?: FlipParams): AnimationConfig;

	export {};
}

declare module 'svelte/attachments' {
	/**
	 * An [attachment](https://svelte.dev/docs/svelte/@attach) is a function that runs when an element is mounted
	 * to the DOM, and optionally returns a function that is called when the element is later removed.
	 *
	 * It can be attached to an element with an `{@attach ...}` tag, or by spreading an object containing
	 * a property created with [`createAttachmentKey`](https://svelte.dev/docs/svelte/svelte-attachments#createAttachmentKey).
	 */
	export interface Attachment<T extends EventTarget = Element> {
		(element: T): void | (() => void);
	}
	/**
	 * Creates an object key that will be recognised as an attachment when the object is spread onto an element,
	 * as a programmatic alternative to using `{@attach ...}`. This can be useful for library authors, though
	 * is generally not needed when building an app.
	 *
	 * ```svelte
	 * <script>
	 * 	import { createAttachmentKey } from 'svelte/attachments';
	 *
	 * 	const props = {
	 * 		class: 'cool',
	 * 		onclick: () => alert('clicked'),
	 * 		[createAttachmentKey()]: (node) => {
	 * 			node.textContent = 'attached!';
	 * 		}
	 * 	};
	 * </script>
	 *
	 * <button {...props}>click me</button>
	 * ```
	 * @since 5.29
	 */
	export function createAttachmentKey(): symbol;
	/**
	 * Converts an [action](https://svelte.dev/docs/svelte/use) into an [attachment](https://svelte.dev/docs/svelte/@attach) keeping the same behavior.
	 * It's useful if you want to start using attachments on components but you have actions provided by a library.
	 *
	 * Note that the second argument, if provided, must be a function that _returns_ the argument to the
	 * action function, not the argument itself.
	 *
	 * ```svelte
	 * <!-- with an action -->
	 * <div use:foo={bar}>...</div>
	 *
	 * <!-- with an attachment -->
	 * <div {@attach fromAction(foo, () => bar)}>...</div>
	 * ```
	 * */
	export function fromAction<E extends EventTarget, T extends unknown>(action: Action<E, T> | ((element: E, arg: T) => void | ActionReturn<T>), fn: () => T): Attachment<E>;
	/**
	 * Converts an [action](https://svelte.dev/docs/svelte/use) into an [attachment](https://svelte.dev/docs/svelte/@attach) keeping the same behavior.
	 * It's useful if you want to start using attachments on components but you have actions provided by a library.
	 *
	 * Note that the second argument, if provided, must be a function that _returns_ the argument to the
	 * action function, not the argument itself.
	 *
	 * ```svelte
	 * <!-- with an action -->
	 * <div use:foo={bar}>...</div>
	 *
	 * <!-- with an attachment -->
	 * <div {@attach fromAction(foo, () => bar)}>...</div>
	 * ```
	 * */
	export function fromAction<E extends EventTarget>(action: Action<E, void> | ((element: E) => void | ActionReturn<void>)): Attachment<E>;
	/**
	 * Actions can return an object containing the two properties defined in this interface. Both are optional.
	 * - update: An action can have a parameter. This method will be called whenever that parameter changes,
	 *   immediately after Svelte has applied updates to the markup. `ActionReturn` and `ActionReturn<undefined>` both
	 *   mean that the action accepts no parameters.
	 * - destroy: Method that is called after the element is unmounted
	 *
	 * Additionally, you can specify which additional attributes and events the action enables on the applied element.
	 * This applies to TypeScript typings only and has no effect at runtime.
	 *
	 * Example usage:
	 * ```ts
	 * interface Attributes {
	 * 	newprop?: string;
	 * 	'on:event': (e: CustomEvent<boolean>) => void;
	 * }
	 *
	 * export function myAction(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter, Attributes> {
	 * 	// ...
	 * 	return {
	 * 		update: (updatedParameter) => {...},
	 * 		destroy: () => {...}
	 * 	};
	 * }
	 * ```
	 */
	interface ActionReturn<
		Parameter = undefined,
		Attributes extends Record<string, any> = Record<never, any>
	> {
		update?: (parameter: Parameter) => void;
		destroy?: () => void;
		/**
		 * ### DO NOT USE THIS
		 * This exists solely for type-checking and has no effect at runtime.
		 * Set this through the `Attributes` generic instead.
		 */
		$$_attributes?: Attributes;
	}

	/**
	 * Actions are functions that are called when an element is created.
	 * You can use this interface to type such actions.
	 * The following example defines an action that only works on `<div>` elements
	 * and optionally accepts a parameter which it has a default value for:
	 * ```ts
	 * export const myAction: Action<HTMLDivElement, { someProperty: boolean } | undefined> = (node, param = { someProperty: true }) => {
	 *   // ...
	 * }
	 * ```
	 * `Action<HTMLDivElement>` and `Action<HTMLDivElement, undefined>` both signal that the action accepts no parameters.
	 *
	 * You can return an object with methods `update` and `destroy` from the function and type which additional attributes and events it has.
	 * See interface `ActionReturn` for more details.
	 */
	interface Action<
		Element = HTMLElement,
		Parameter = undefined,
		Attributes extends Record<string, any> = Record<never, any>
	> {
		<Node extends Element>(
			...args: undefined extends Parameter
				? [node: Node, parameter?: Parameter]
				: [node: Node, parameter: Parameter]
		): void | ActionReturn<Parameter, Attributes>;
	}

	// Implementation notes:
	// - undefined extends X instead of X extends undefined makes this work better with both strict and nonstrict mode

	export {};
}

declare module 'svelte/compiler' {
	import type { SourceMap } from 'magic-string';
	import type { ArrayExpression, ArrowFunctionExpression, VariableDeclaration, VariableDeclarator, Expression, Identifier, MemberExpression, Node, ObjectExpression, Pattern, Program, ChainExpression, SimpleCallExpression, SequenceExpression, SourceLocation } from 'estree';
	import type { Location } from 'locate-character';
	import type { default as ts } from 'esrap/languages/ts';
	/**
	 * `compile` converts your `.svelte` source code into a JavaScript module that exports a component
	 *
	 * @param source The component source code
	 * @param options The compiler options
	 * */
	export function compile(source: string, options: CompileOptions): CompileResult;
	/**
	 * `compileModule` takes your JavaScript source code containing runes, and turns it into a JavaScript module.
	 *
	 * @param source The component source code
	 * */
	export function compileModule(source: string, options: ModuleCompileOptions): CompileResult;
	/**
	 * The parse function parses a component, returning only its abstract syntax tree.
	 *
	 * The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
	 * `modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
	 *
	 * */
	export function parse(source: string, options: {
		filename?: string;
		modern: true;
		loose?: boolean;
	}): AST.Root;
	/**
	 * The parse function parses a component, returning only its abstract syntax tree.
	 *
	 * The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
	 * `modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
	 *
	 * */
	export function parse(source: string, options?: {
		filename?: string;
		modern?: false;
		loose?: boolean;
	} | undefined): Record<string, any>;
	/**
	 * The parseCss function parses a CSS stylesheet, returning its abstract syntax tree.
	 *
	 * @param source The CSS source code
	 * */
	export function parseCss(source: string): Omit<AST.CSS.StyleSheet, "attributes" | "content">;
	/**
	 * @deprecated Replace this with `import { walk } from 'estree-walker'`
	 * */
	export function walk(): never;
	/**
	 * The result of a preprocessor run. If the preprocessor does not return a result, it is assumed that the code is unchanged.
	 */
	export interface Processed {
		/**
		 * The new code
		 */
		code: string;
		/**
		 * A source map mapping back to the original code
		 */
		map?: string | object; // we are opaque with the type here to avoid dependency on the remapping module for our public types.
		/**
		 * A list of additional files to watch for changes
		 */
		dependencies?: string[];
		/**
		 * Only for script/style preprocessors: The updated attributes to set on the tag. If undefined, attributes stay unchanged.
		 */
		attributes?: Record<string, string | boolean>;
		toString?: () => string;
	}

	/**
	 * A markup preprocessor that takes a string of code and returns a processed version.
	 */
	export type MarkupPreprocessor = (options: {
		/**
		 * The whole Svelte file content
		 */
		content: string;
		/**
		 * The filename of the Svelte file
		 */
		filename?: string;
	}) => Processed | void | Promise<Processed | void>;

	/**
	 * A script/style preprocessor that takes a string of code and returns a processed version.
	 */
	export type Preprocessor = (options: {
		/**
		 * The script/style tag content
		 */
		content: string;
		/**
		 * The attributes on the script/style tag
		 */
		attributes: Record<string, string | boolean>;
		/**
		 * The whole Svelte file content
		 */
		markup: string;
		/**
		 * The filename of the Svelte file
		 */
		filename?: string;
	}) => Processed | void | Promise<Processed | void>;

	/**
	 * A preprocessor group is a set of preprocessors that are applied to a Svelte file.
	 */
	export interface PreprocessorGroup {
		/** Name of the preprocessor. Will be a required option in the next major version */
		name?: string;
		markup?: MarkupPreprocessor;
		style?: Preprocessor;
		script?: Preprocessor;
	}
	/** The return value of `compile` from `svelte/compiler` */
	export interface CompileResult {
		/** The compiled JavaScript */
		js: {
			/** The generated code */
			code: string;
			/** A source map */
			map: SourceMap;
		};
		/** The compiled CSS */
		css: null | {
			/** The generated code */
			code: string;
			/** A source map */
			map: SourceMap;
			/** Whether or not the CSS includes global rules */
			hasGlobal: boolean;
		};
		/**
		 * An array of warning objects that were generated during compilation. Each warning has several properties:
		 * - `code` is a string identifying the category of warning
		 * - `message` describes the issue in human-readable terms
		 * - `start` and `end`, if the warning relates to a specific location, are objects with `line`, `column` and `character` properties
		 */
		warnings: Warning[];
		/**
		 * Metadata about the compiled component
		 */
		metadata: {
			/**
			 * Whether the file was compiled in runes mode, either because of an explicit option or inferred from usage.
			 * For `compileModule`, this is always `true`
			 */
			runes: boolean;
		};
		/** The AST */
		ast: any;
	}

	export interface Warning extends ICompileDiagnostic {}

	export interface CompileError extends ICompileDiagnostic {}

	type CssHashGetter = (args: {
		name: string;
		filename: string;
		css: string;
		hash: (input: string) => string;
	}) => string;

	export interface CompileOptions extends ModuleCompileOptions {
		/**
		 * Sets the name of the resulting JavaScript class (though the compiler will rename it if it would otherwise conflict with other variables in scope).
		 * If unspecified, will be inferred from `filename`
		 */
		name?: string;
		/**
		 * If `true`, tells the compiler to generate a custom element constructor instead of a regular Svelte component.
		 *
		 * @default false
		 */
		customElement?: boolean;
		/**
		 * If `true`, getters and setters will be created for the component's props. If `false`, they will only be created for readonly exported values (i.e. those declared with `const`, `class` and `function`). If compiling with `customElement: true` this option defaults to `true`.
		 *
		 * @default false
		 * @deprecated This will have no effect in runes mode
		 */
		accessors?: boolean;
		/**
		 * The namespace of the element; e.g., `"html"`, `"svg"`, `"mathml"`.
		 *
		 * @default 'html'
		 */
		namespace?: Namespace;
		/**
		 * If `true`, tells the compiler that you promise not to mutate any objects.
		 * This allows it to be less conservative about checking whether values have changed.
		 *
		 * @default false
		 * @deprecated This will have no effect in runes mode
		 */
		immutable?: boolean;
		/**
		 * - `'injected'`: styles will be included in the `head` when using `render(...)`, and injected into the document (if not already present) when the component mounts. For components compiled as custom elements, styles are injected to the shadow root.
		 * - `'external'`: the CSS will only be returned in the `css` field of the compilation result. Most Svelte bundler plugins will set this to `'external'` and use the CSS that is statically generated for better performance, as it will result in smaller JavaScript bundles and the output can be served as cacheable `.css` files.
		 * This is always `'injected'` when compiling with `customElement` mode.
		 */
		css?: 'injected' | 'external';
		/**
		 * A function that takes a `{ hash, css, name, filename }` argument and returns the string that is used as a classname for scoped CSS.
		 * It defaults to returning `svelte-${hash(filename ?? css)}`.
		 *
		 * @default undefined
		 */
		cssHash?: CssHashGetter;
		/**
		 * If `true`, your HTML comments will be preserved in the output. By default, they are stripped out.
		 *
		 * @default false
		 */
		preserveComments?: boolean;
		/**
		 *  If `true`, whitespace inside and between elements is kept as you typed it, rather than removed or collapsed to a single space where possible.
		 *
		 * @default false
		 */
		preserveWhitespace?: boolean;
		/**
		 * Which strategy to use when cloning DOM fragments:
		 *
		 * - `html` populates a `<template>` with `innerHTML` and clones it. This is faster, but cannot be used if your app's [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) includes [`require-trusted-types-for 'script'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/require-trusted-types-for)
		 * - `tree` creates the fragment one element at a time and _then_ clones it. This is slower, but works everywhere
		 *
		 * @default 'html'
		 * @since 5.33
		 */
		fragments?: 'html' | 'tree';
		/**
		 * Set to `true` to force the compiler into runes mode, even if there are no indications of runes usage.
		 * Set to `false` to force the compiler into ignoring runes, even if there are indications of runes usage.
		 * Set to `undefined` (the default) to infer runes mode from the component code.
		 * Is always `true` for JS/TS modules compiled with Svelte.
		 * Will be `true` by default in Svelte 6.
		 * Note that setting this to `true` in your `svelte.config.js` will force runes mode for your entire project, including components in `node_modules`,
		 * which is likely not what you want. If you're using Vite, consider using [dynamicCompileOptions](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#dynamiccompileoptions) instead.
		 * @default undefined
		 */
		runes?: boolean | undefined;
		/**
		 *  If `true`, exposes the Svelte major version in the browser by adding it to a `Set` stored in the global `window.__svelte.v`.
		 *
		 * @default true
		 */
		discloseVersion?: boolean;
		/**
		 * @deprecated Use these only as a temporary solution before migrating your code
		 */
		compatibility?: {
			/**
			 * Applies a transformation so that the default export of Svelte files can still be instantiated the same way as in Svelte 4 —
			 * as a class when compiling for the browser (as though using `createClassComponent(MyComponent, {...})` from `svelte/legacy`)
			 * or as an object with a `.render(...)` method when compiling for the server
			 * @default 5
			 */
			componentApi?: 4 | 5;
		};
		/**
		 * An initial sourcemap that will be merged into the final output sourcemap.
		 * This is usually the preprocessor sourcemap.
		 *
		 * @default null
		 */
		sourcemap?: object | string;
		/**
		 * Used for your JavaScript sourcemap.
		 *
		 * @default null
		 */
		outputFilename?: string;
		/**
		 * Used for your CSS sourcemap.
		 *
		 * @default null
		 */
		cssOutputFilename?: string;
		/**
		 * If `true`, compiles components with hot reloading support.
		 *
		 * @default false
		 */
		hmr?: boolean;
		/**
		 * If `true`, returns the modern version of the AST.
		 * Will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
		 *
		 * @default false
		 */
		modernAst?: boolean;
	}

	export interface ModuleCompileOptions {
		/**
		 * If `true`, causes extra code to be added that will perform runtime checks and provide debugging information during development.
		 *
		 * @default false
		 */
		dev?: boolean;
		/**
		 * If `"client"`, Svelte emits code designed to run in the browser.
		 * If `"server"`, Svelte emits code suitable for server-side rendering.
		 * If `false`, nothing is generated. Useful for tooling that is only interested in warnings.
		 *
		 * @default 'client'
		 */
		generate?: 'client' | 'server' | false;
		/**
		 * Used for debugging hints and sourcemaps. Your bundler plugin will set it automatically.
		 */
		filename?: string;
		/**
		 * Used for ensuring filenames don't leak filesystem information. Your bundler plugin will set it automatically.
		 * @default process.cwd() on node-like environments, undefined elsewhere
		 */
		rootDir?: string;
		/**
		 * A function that gets a `Warning` as an argument and returns a boolean.
		 * Use this to filter out warnings. Return `true` to keep the warning, `false` to discard it.
		 */
		warningFilter?: (warning: Warning) => boolean;
		/**
		 * Experimental options
		 * @since 5.36
		 */
		experimental?: {
			/**
			 * Allow `await` keyword in deriveds, template expressions, and the top level of components
			 * @since 5.36
			 */
			async?: boolean;
		};
	}
	/**
	 * - `html`    — the default, for e.g. `<div>` or `<span>`
	 * - `svg`     — for e.g. `<svg>` or `<g>`
	 * - `mathml`  — for e.g. `<math>` or `<mrow>`
	 */
	type Namespace = 'html' | 'svg' | 'mathml';

	export namespace AST {
		export interface BaseNode {
			type: string;
			start: number;
			end: number;
		}

		export interface Fragment {
			type: 'Fragment';
			nodes: Array<Text | Tag | ElementLike | Block | Comment>;
		}

		export interface Root extends BaseNode {
			type: 'Root';
			/**
			 * Inline options provided by `<svelte:options>` — these override options passed to `compile(...)`
			 */
			options: SvelteOptions | null;
			fragment: Fragment;
			/** The parsed `<style>` element, if exists */
			css: AST.CSS.StyleSheet | null;
			/** The parsed `<script>` element, if exists */
			instance: Script | null;
			/** The parsed `<script module>` element, if exists */
			module: Script | null;
			/** Comments found in <script> and {expressions} */
			comments: JSComment[];
		}

		export interface SvelteOptions {
			// start/end info (needed for warnings and for our Prettier plugin)
			start: number;
			end: number;
			// options
			runes?: boolean;
			immutable?: boolean;
			accessors?: boolean;
			preserveWhitespace?: boolean;
			namespace?: Namespace;
			css?: 'injected';
			customElement?: {
				tag?: string;
				shadow?: 'open' | 'none' | ObjectExpression | undefined;
				props?: Record<
					string,
					{
						attribute?: string;
						reflect?: boolean;
						type?: 'Array' | 'Boolean' | 'Number' | 'Object' | 'String';
					}
				>;
				/**
				 * Is of type
				 * ```ts
				 * (ceClass: new () => HTMLElement) => new () => HTMLElement
				 * ```
				 */
				extend?: ArrowFunctionExpression | Identifier;
			};
			attributes: Attribute[];
		}

		/** Static text */
		export interface Text extends BaseNode {
			type: 'Text';
			/** Text with decoded HTML entities */
			data: string;
			/** The original text, with undecoded HTML entities */
			raw: string;
		}

		/** A (possibly reactive) template expression — `{...}` */
		export interface ExpressionTag extends BaseNode {
			type: 'ExpressionTag';
			expression: Expression;
		}

		/** A (possibly reactive) HTML template expression — `{@html ...}` */
		export interface HtmlTag extends BaseNode {
			type: 'HtmlTag';
			expression: Expression;
		}

		/** An HTML comment */
		// TODO rename to disambiguate
		export interface Comment extends BaseNode {
			type: 'Comment';
			/** the contents of the comment */
			data: string;
		}

		/** A `{@const ...}` tag */
		export interface ConstTag extends BaseNode {
			type: 'ConstTag';
			declaration: VariableDeclaration & {
				declarations: [VariableDeclarator & { id: Pattern; init: Expression }];
			};
		}

		/** A `{@debug ...}` tag */
		export interface DebugTag extends BaseNode {
			type: 'DebugTag';
			identifiers: Identifier[];
		}

		/** A `{@render foo(...)} tag */
		export interface RenderTag extends BaseNode {
			type: 'RenderTag';
			expression: SimpleCallExpression | (ChainExpression & { expression: SimpleCallExpression });
		}

		/** A `{@attach foo(...)} tag */
		export interface AttachTag extends BaseNode {
			type: 'AttachTag';
			expression: Expression;
		}

		/** An `animate:` directive */
		export interface AnimateDirective extends BaseAttribute {
			type: 'AnimateDirective';
			/** The 'x' in `animate:x` */
			name: string;
			/** The y in `animate:x={y}` */
			expression: null | Expression;
		}

		/** A `bind:` directive */
		export interface BindDirective extends BaseAttribute {
			type: 'BindDirective';
			/** The 'x' in `bind:x` */
			name: string;
			/** The y in `bind:x={y}` */
			expression: Identifier | MemberExpression | SequenceExpression;
		}

		/** A `class:` directive */
		export interface ClassDirective extends BaseAttribute {
			type: 'ClassDirective';
			/** The 'x' in `class:x` */
			name: 'class';
			/** The 'y' in `class:x={y}`, or the `x` in `class:x` */
			expression: Expression;
		}

		/** A `let:` directive */
		export interface LetDirective extends BaseAttribute {
			type: 'LetDirective';
			/** The 'x' in `let:x` */
			name: string;
			/** The 'y' in `let:x={y}` */
			expression: null | Identifier | ArrayExpression | ObjectExpression;
		}

		/** An `on:` directive */
		export interface OnDirective extends BaseAttribute {
			type: 'OnDirective';
			/** The 'x' in `on:x` */
			name: string;
			/** The 'y' in `on:x={y}` */
			expression: null | Expression;
			modifiers: Array<
				| 'capture'
				| 'nonpassive'
				| 'once'
				| 'passive'
				| 'preventDefault'
				| 'self'
				| 'stopImmediatePropagation'
				| 'stopPropagation'
				| 'trusted'
			>;
		}

		/** A `style:` directive */
		export interface StyleDirective extends BaseAttribute {
			type: 'StyleDirective';
			/** The 'x' in `style:x` */
			name: string;
			/** The 'y' in `style:x={y}` */
			value: true | ExpressionTag | Array<ExpressionTag | Text>;
			modifiers: Array<'important'>;
		}

		// TODO have separate in/out/transition directives
		/** A `transition:`, `in:` or `out:` directive */
		export interface TransitionDirective extends BaseAttribute {
			type: 'TransitionDirective';
			/** The 'x' in `transition:x` */
			name: string;
			/** The 'y' in `transition:x={y}` */
			expression: null | Expression;
			modifiers: Array<'local' | 'global'>;
			/** True if this is a `transition:` or `in:` directive */
			intro: boolean;
			/** True if this is a `transition:` or `out:` directive */
			outro: boolean;
		}

		/** A `use:` directive */
		export interface UseDirective extends BaseAttribute {
			type: 'UseDirective';
			/** The 'x' in `use:x` */
			name: string;
			/** The 'y' in `use:x={y}` */
			expression: null | Expression;
		}

		export interface BaseElement extends BaseNode {
			name: string;
			name_loc: SourceLocation;
			attributes: Array<Attribute | SpreadAttribute | Directive | AttachTag>;
			fragment: Fragment;
		}

		export interface Component extends BaseElement {
			type: 'Component';
		}

		export interface TitleElement extends BaseElement {
			type: 'TitleElement';
			name: 'title';
		}

		export interface SlotElement extends BaseElement {
			type: 'SlotElement';
			name: 'slot';
		}

		export interface RegularElement extends BaseElement {
			type: 'RegularElement';
		}

		export interface SvelteBody extends BaseElement {
			type: 'SvelteBody';
			name: 'svelte:body';
		}

		export interface SvelteComponent extends BaseElement {
			type: 'SvelteComponent';
			name: 'svelte:component';
			expression: Expression;
		}

		export interface SvelteDocument extends BaseElement {
			type: 'SvelteDocument';
			name: 'svelte:document';
		}

		export interface SvelteElement extends BaseElement {
			type: 'SvelteElement';
			name: 'svelte:element';
			tag: Expression;
		}

		export interface SvelteFragment extends BaseElement {
			type: 'SvelteFragment';
			name: 'svelte:fragment';
		}

		export interface SvelteBoundary extends BaseElement {
			type: 'SvelteBoundary';
			name: 'svelte:boundary';
		}

		export interface SvelteHead extends BaseElement {
			type: 'SvelteHead';
			name: 'svelte:head';
		}

		/** This is only an intermediate representation while parsing, it doesn't exist in the final AST */
		export interface SvelteOptionsRaw extends BaseElement {
			type: 'SvelteOptions';
			name: 'svelte:options';
		}

		export interface SvelteSelf extends BaseElement {
			type: 'SvelteSelf';
			name: 'svelte:self';
		}

		export interface SvelteWindow extends BaseElement {
			type: 'SvelteWindow';
			name: 'svelte:window';
		}

		/** An `{#each ...}` block */
		export interface EachBlock extends BaseNode {
			type: 'EachBlock';
			expression: Expression;
			/** The `entry` in `{#each item as entry}`. `null` if `as` part is omitted */
			context: Pattern | null;
			body: Fragment;
			fallback?: Fragment;
			index?: string;
			key?: Expression;
		}

		/** An `{#if ...}` block */
		export interface IfBlock extends BaseNode {
			type: 'IfBlock';
			elseif: boolean;
			test: Expression;
			consequent: Fragment;
			alternate: Fragment | null;
		}

		/** An `{#await ...}` block */
		export interface AwaitBlock extends BaseNode {
			type: 'AwaitBlock';
			expression: Expression;
			// TODO can/should we move these inside the ThenBlock and CatchBlock?
			/** The resolved value inside the `then` block */
			value: Pattern | null;
			/** The rejection reason inside the `catch` block */
			error: Pattern | null;
			pending: Fragment | null;
			then: Fragment | null;
			catch: Fragment | null;
		}

		export interface KeyBlock extends BaseNode {
			type: 'KeyBlock';
			expression: Expression;
			fragment: Fragment;
		}

		export interface SnippetBlock extends BaseNode {
			type: 'SnippetBlock';
			expression: Identifier;
			parameters: Pattern[];
			typeParams?: string;
			body: Fragment;
		}

		export interface BaseAttribute extends BaseNode {
			name: string;
			name_loc: SourceLocation | null;
		}

		export interface Attribute extends BaseAttribute {
			type: 'Attribute';
			/**
			 * Quoted/string values are represented by an array, even if they contain a single expression like `"{x}"`
			 */
			value: true | ExpressionTag | Array<Text | ExpressionTag>;
		}

		export interface SpreadAttribute extends BaseNode {
			type: 'SpreadAttribute';
			expression: Expression;
		}

		export interface Script extends BaseNode {
			type: 'Script';
			context: 'default' | 'module';
			content: Program;
			attributes: Attribute[];
		}

		export interface JSComment {
			type: 'Line' | 'Block';
			value: string;
			start: number;
			end: number;
			loc: {
				start: { line: number; column: number };
				end: { line: number; column: number };
			};
		}

		export type AttributeLike = Attribute | SpreadAttribute | Directive;

		export type Directive =
			| AST.AnimateDirective
			| AST.BindDirective
			| AST.ClassDirective
			| AST.LetDirective
			| AST.OnDirective
			| AST.StyleDirective
			| AST.TransitionDirective
			| AST.UseDirective;

		export type Block =
			| AST.EachBlock
			| AST.IfBlock
			| AST.AwaitBlock
			| AST.KeyBlock
			| AST.SnippetBlock;

		export type ElementLike =
			| AST.Component
			| AST.TitleElement
			| AST.SlotElement
			| AST.RegularElement
			| AST.SvelteBody
			| AST.SvelteBoundary
			| AST.SvelteComponent
			| AST.SvelteDocument
			| AST.SvelteElement
			| AST.SvelteFragment
			| AST.SvelteHead
			| AST.SvelteOptionsRaw
			| AST.SvelteSelf
			| AST.SvelteWindow
			| AST.SvelteBoundary;

		export type Tag =
			| AST.AttachTag
			| AST.ConstTag
			| AST.DebugTag
			| AST.ExpressionTag
			| AST.HtmlTag
			| AST.RenderTag;

		export type TemplateNode =
			| AST.Root
			| AST.Text
			| Tag
			| ElementLike
			| AST.Attribute
			| AST.SpreadAttribute
			| Directive
			| AST.AttachTag
			| AST.Comment
			| Block;

		export type SvelteNode = Node | TemplateNode | AST.Fragment | _CSS.Node | Script;

		export type { _CSS as CSS };
	}
	/**
	 * The preprocess function provides convenient hooks for arbitrarily transforming component source code.
	 * For example, it can be used to convert a `<style lang="sass">` block into vanilla CSS.
	 *
	 * */
	export function preprocess(source: string, preprocessor: PreprocessorGroup | PreprocessorGroup[], options?: {
		filename?: string;
	} | undefined): Promise<Processed>;
	/**
	 * `print` converts a Svelte AST node back into Svelte source code.
	 * It is primarily intended for tools that parse and transform components using the compiler’s modern AST representation.
	 *
	 * `print(ast)` requires an AST node produced by parse with modern: true, or any sub-node within that modern AST.
	 * The result contains the generated source and a corresponding source map.
	 * The output is valid Svelte, but formatting details such as whitespace or quoting may differ from the original.
	 * */
	export function print(ast: AST.SvelteNode, options?: Options | undefined): {
		code: string;
		map: any;
	};
	/**
	 * The current version, as set in package.json.
	 * */
	export const VERSION: string;
	/**
	 * Does a best-effort migration of Svelte code towards using runes, event attributes and render tags.
	 * May throw an error if the code is too complex to migrate automatically.
	 *
	 * */
	export function migrate(source: string, { filename, use_ts }?: {
		filename?: string;
		use_ts?: boolean;
	} | undefined): {
		code: string;
	};
	type ICompileDiagnostic = {
		code: string;
		message: string;
		stack?: string;
		filename?: string;
		start?: Location;
		end?: Location;
		position?: [number, number];
		frame?: string;
	};
	namespace _CSS {
		export interface BaseNode {
			start: number;
			end: number;
		}

		export interface StyleSheet extends BaseNode {
			type: 'StyleSheet';
			attributes: any[]; // TODO
			children: Array<Atrule | Rule>;
			content: {
				start: number;
				end: number;
				styles: string;
				/** Possible comment atop the style tag */
				comment: AST.Comment | null;
			};
		}

		export interface Atrule extends BaseNode {
			type: 'Atrule';
			name: string;
			prelude: string;
			block: Block | null;
		}

		export interface Rule extends BaseNode {
			type: 'Rule';
			prelude: SelectorList;
			block: Block;
		}

		/**
		 * A list of selectors, e.g. `a, b, c {}`
		 */
		export interface SelectorList extends BaseNode {
			type: 'SelectorList';
			/**
			 * The `a`, `b` and `c` in `a, b, c {}`
			 */
			children: ComplexSelector[];
		}

		/**
		 * A complex selector, e.g. `a b c {}`
		 */
		export interface ComplexSelector extends BaseNode {
			type: 'ComplexSelector';
			/**
			 * The `a`, `b` and `c` in `a b c {}`
			 */
			children: RelativeSelector[];
		}

		/**
		 * A relative selector, e.g the `a` and `> b` in `a > b {}`
		 */
		export interface RelativeSelector extends BaseNode {
			type: 'RelativeSelector';
			/**
			 * In `a > b`, `> b` forms one relative selector, and `>` is the combinator. `null` for the first selector.
			 */
			combinator: null | Combinator;
			/**
			 * The `b:is(...)` in `> b:is(...)`
			 */
			selectors: SimpleSelector[];
		}

		export interface TypeSelector extends BaseNode {
			type: 'TypeSelector';
			name: string;
		}

		export interface IdSelector extends BaseNode {
			type: 'IdSelector';
			name: string;
		}

		export interface ClassSelector extends BaseNode {
			type: 'ClassSelector';
			name: string;
		}

		export interface AttributeSelector extends BaseNode {
			type: 'AttributeSelector';
			name: string;
			matcher: string | null;
			value: string | null;
			flags: string | null;
		}

		export interface PseudoElementSelector extends BaseNode {
			type: 'PseudoElementSelector';
			name: string;
		}

		export interface PseudoClassSelector extends BaseNode {
			type: 'PseudoClassSelector';
			name: string;
			args: SelectorList | null;
		}

		export interface Percentage extends BaseNode {
			type: 'Percentage';
			value: string;
		}

		export interface NestingSelector extends BaseNode {
			type: 'NestingSelector';
			name: '&';
		}

		export interface Nth extends BaseNode {
			type: 'Nth';
			value: string;
		}

		export type SimpleSelector =
			| TypeSelector
			| IdSelector
			| ClassSelector
			| AttributeSelector
			| PseudoElementSelector
			| PseudoClassSelector
			| Percentage
			| Nth
			| NestingSelector;

		export interface Combinator extends BaseNode {
			type: 'Combinator';
			name: string;
		}

		export interface Block extends BaseNode {
			type: 'Block';
			children: Array<Declaration | Rule | Atrule>;
		}

		export interface Declaration extends BaseNode {
			type: 'Declaration';
			property: string;
			value: string;
		}

		// for zimmerframe
		export type Node =
			| StyleSheet
			| Rule
			| Atrule
			| SelectorList
			| Block
			| ComplexSelector
			| RelativeSelector
			| Combinator
			| SimpleSelector
			| Declaration;
	}
	type Options = {
		getLeadingComments?: NonNullable<Parameters<typeof ts>[0]>['getLeadingComments'] | undefined;
		getTrailingComments?: NonNullable<Parameters<typeof ts>[0]>['getTrailingComments'] | undefined;
	};

	export {};
}

declare module 'svelte/easing' {
	export function linear(t: number): number;

	export function backInOut(t: number): number;

	export function backIn(t: number): number;

	export function backOut(t: number): number;

	export function bounceOut(t: number): number;

	export function bounceInOut(t: number): number;

	export function bounceIn(t: number): number;

	export function circInOut(t: number): number;

	export function circIn(t: number): number;

	export function circOut(t: number): number;

	export function cubicInOut(t: number): number;

	export function cubicIn(t: number): number;

	export function cubicOut(t: number): number;

	export function elasticInOut(t: number): number;

	export function elasticIn(t: number): number;

	export function elasticOut(t: number): number;

	export function expoInOut(t: number): number;

	export function expoIn(t: number): number;

	export function expoOut(t: number): number;

	export function quadInOut(t: number): number;

	export function quadIn(t: number): number;

	export function quadOut(t: number): number;

	export function quartInOut(t: number): number;

	export function quartIn(t: number): number;

	export function quartOut(t: number): number;

	export function quintInOut(t: number): number;

	export function quintIn(t: number): number;

	export function quintOut(t: number): number;

	export function sineInOut(t: number): number;

	export function sineIn(t: number): number;

	export function sineOut(t: number): number;

	export {};
}

declare module 'svelte/legacy' {
	import type { ComponentConstructorOptions, SvelteComponent, ComponentType, Component } from 'svelte';
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
	 * Substitute for the `trusted` event modifier
	 * @deprecated
	 * */
	export function trusted(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
	/**
	 * Substitute for the `self` event modifier
	 * @deprecated
	 * */
	export function self(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
	/**
	 * Substitute for the `stopPropagation` event modifier
	 * @deprecated
	 * */
	export function stopPropagation(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
	/**
	 * Substitute for the `once` event modifier
	 * @deprecated
	 * */
	export function once(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
	/**
	 * Substitute for the `stopImmediatePropagation` event modifier
	 * @deprecated
	 * */
	export function stopImmediatePropagation(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
	/**
	 * Substitute for the `preventDefault` event modifier
	 * @deprecated
	 * */
	export function preventDefault(fn: (event: Event, ...args: Array<unknown>) => void): (event: Event, ...args: unknown[]) => void;
	/**
	 * Substitute for the `passive` event modifier, implemented as an action
	 * @deprecated
	 * */
	export function passive(node: HTMLElement, [event, handler]: [event: string, handler: () => EventListener]): void;
	/**
	 * Substitute for the `nonpassive` event modifier, implemented as an action
	 * @deprecated
	 * */
	export function nonpassive(node: HTMLElement, [event, handler]: [event: string, handler: () => EventListener]): void;

	export {};
}

declare module 'svelte/motion' {
	import type { MediaQuery } from 'svelte/reactivity';
	// TODO we do declaration merging here in order to not have a breaking change (renaming the Spring interface)
	// this means both the Spring class and the Spring interface are merged into one with some things only
	// existing on one side. In Svelte 6, remove the type definition and move the jsdoc onto the class in spring.js

	export interface Spring<T> extends Readable<T> {
		set(new_value: T, opts?: SpringUpdateOpts): Promise<void>;
		/**
		 * @deprecated Only exists on the legacy `spring` store, not the `Spring` class
		 */
		update: (fn: Updater<T>, opts?: SpringUpdateOpts) => Promise<void>;
		/**
		 * @deprecated Only exists on the legacy `spring` store, not the `Spring` class
		 */
		subscribe(fn: (value: T) => void): Unsubscriber;
		precision: number;
		damping: number;
		stiffness: number;
	}

	/**
	 * A wrapper for a value that behaves in a spring-like fashion. Changes to `spring.target` will cause `spring.current` to
	 * move towards it over time, taking account of the `spring.stiffness` and `spring.damping` parameters.
	 *
	 * ```svelte
	 * <script>
	 * 	import { Spring } from 'svelte/motion';
	 *
	 * 	const spring = new Spring(0);
	 * </script>
	 *
	 * <input type="range" bind:value={spring.target} />
	 * <input type="range" bind:value={spring.current} disabled />
	 * ```
	 * @since 5.8.0
	 */
	export class Spring<T> {
		constructor(value: T, options?: SpringOpts);

		/**
		 * Create a spring whose value is bound to the return value of `fn`. This must be called
		 * inside an effect root (for example, during component initialisation).
		 *
		 * ```svelte
		 * <script>
		 * 	import { Spring } from 'svelte/motion';
		 *
		 * 	let { number } = $props();
		 *
		 * 	const spring = Spring.of(() => number);
		 * </script>
		 * ```
		 */
		static of<U>(fn: () => U, options?: SpringOpts): Spring<U>;

		/**
		 * Sets `spring.target` to `value` and returns a `Promise` that resolves if and when `spring.current` catches up to it.
		 *
		 * If `options.instant` is `true`, `spring.current` immediately matches `spring.target`.
		 *
		 * If `options.preserveMomentum` is provided, the spring will continue on its current trajectory for
		 * the specified number of milliseconds. This is useful for things like 'fling' gestures.
		 */
		set(value: T, options?: SpringUpdateOpts): Promise<void>;

		damping: number;
		precision: number;
		stiffness: number;
		/**
		 * The end value of the spring.
		 * This property only exists on the `Spring` class, not the legacy `spring` store.
		 */
		target: T;
		/**
		 * The current value of the spring.
		 * This property only exists on the `Spring` class, not the legacy `spring` store.
		 */
		get current(): T;
	}

	export interface Tweened<T> extends Readable<T> {
		set(value: T, opts?: TweenedOptions<T>): Promise<void>;
		update(updater: Updater<T>, opts?: TweenedOptions<T>): Promise<void>;
	}
	/** Callback to inform of a value updates. */
	type Subscriber<T> = (value: T) => void;

	/** Unsubscribes from value updates. */
	type Unsubscriber = () => void;

	/** Readable interface for subscribing. */
	interface Readable<T> {
		/**
		 * Subscribe on value changes.
		 * @param run subscription callback
		 * @param invalidate cleanup callback
		 */
		subscribe(this: void, run: Subscriber<T>, invalidate?: () => void): Unsubscriber;
	}
	interface SpringOpts {
		stiffness?: number;
		damping?: number;
		precision?: number;
	}

	interface SpringUpdateOpts {
		/**
		 * @deprecated Only use this for the spring store; does nothing when set on the Spring class
		 */
		hard?: any;
		/**
		 * @deprecated Only use this for the spring store; does nothing when set on the Spring class
		 */
		soft?: string | number | boolean;
		/**
		 * Only use this for the Spring class; does nothing when set on the spring store
		 */
		instant?: boolean;
		/**
		 * Only use this for the Spring class; does nothing when set on the spring store
		 */
		preserveMomentum?: number;
	}

	type Updater<T> = (target_value: T, value: T) => T;

	interface TweenedOptions<T> {
		delay?: number;
		duration?: number | ((from: T, to: T) => number);
		easing?: (t: number) => number;
		interpolate?: (a: T, b: T) => (t: number) => T;
	}
	/**
	 * A [media query](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery) that matches if the user [prefers reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
	 *
	 * ```svelte
	 * <script>
	 * 	import { prefersReducedMotion } from 'svelte/motion';
	 * 	import { fly } from 'svelte/transition';
	 *
	 * 	let visible = $state(false);
	 * </script>
	 *
	 * <button onclick={() => visible = !visible}>
	 * 	toggle
	 * </button>
	 *
	 * {#if visible}
	 * 	<p transition:fly={{ y: prefersReducedMotion.current ? 0 : 200 }}>
	 * 		flies in, unless the user prefers reduced motion
	 * 	</p>
	 * {/if}
	 * ```
	 * @since 5.7.0
	 */
	export const prefersReducedMotion: MediaQuery;
	/**
	 * The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.
	 *
	 * @deprecated Use [`Spring`](https://svelte.dev/docs/svelte/svelte-motion#Spring) instead
	 * */
	export function spring<T = any>(value?: T | undefined, opts?: SpringOpts | undefined): Spring<T>;
	/**
	 * A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.
	 *
	 * @deprecated Use [`Tween`](https://svelte.dev/docs/svelte/svelte-motion#Tween) instead
	 * */
	export function tweened<T>(value?: T | undefined, defaults?: TweenedOptions<T> | undefined): Tweened<T>;
	/**
	 * A wrapper for a value that tweens smoothly to its target value. Changes to `tween.target` will cause `tween.current` to
	 * move towards it over time, taking account of the `delay`, `duration` and `easing` options.
	 *
	 * ```svelte
	 * <script>
	 * 	import { Tween } from 'svelte/motion';
	 *
	 * 	const tween = new Tween(0);
	 * </script>
	 *
	 * <input type="range" bind:value={tween.target} />
	 * <input type="range" bind:value={tween.current} disabled />
	 * ```
	 * @since 5.8.0
	 */
	export class Tween<T> {
		/**
		 * Create a tween whose value is bound to the return value of `fn`. This must be called
		 * inside an effect root (for example, during component initialisation).
		 *
		 * ```svelte
		 * <script>
		 * 	import { Tween } from 'svelte/motion';
		 *
		 * 	let { number } = $props();
		 *
		 * 	const tween = Tween.of(() => number);
		 * </script>
		 * ```
		 * 
		 */
		static of<U>(fn: () => U, options?: TweenedOptions<U> | undefined): Tween<U>;
		
		constructor(value: T, options?: TweenedOptions<T>);
		/**
		 * Sets `tween.target` to `value` and returns a `Promise` that resolves if and when `tween.current` catches up to it.
		 *
		 * If `options` are provided, they will override the tween's defaults.
		 * */
		set(value: T, options?: TweenedOptions<T> | undefined): Promise<void>;
		get current(): T;
		set target(v: T);
		get target(): T;
		#private;
	}

	export {};
}

declare module 'svelte/reactivity' {
	/**
	 * A reactive version of the built-in [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object.
	 * Reading the date (whether with methods like `date.getTime()` or `date.toString()`, or via things like [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat))
	 * in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
	 * will cause it to be re-evaluated when the value of the date changes.
	 *
	 * ```svelte
	 * <script>
	 * 	import { SvelteDate } from 'svelte/reactivity';
	 *
	 * 	const date = new SvelteDate();
	 *
	 * 	const formatter = new Intl.DateTimeFormat(undefined, {
	 * 	  hour: 'numeric',
	 * 	  minute: 'numeric',
	 * 	  second: 'numeric'
	 * 	});
	 *
	 * 	$effect(() => {
	 * 		const interval = setInterval(() => {
	 * 			date.setTime(Date.now());
	 * 		}, 1000);
	 *
	 * 		return () => {
	 * 			clearInterval(interval);
	 * 		};
	 * 	});
	 * </script>
	 *
	 * <p>The time is {formatter.format(date)}</p>
	 * ```
	 */
	export class SvelteDate extends Date {
		
		constructor(...params: any[]);
		#private;
	}
	/**
	 * A reactive version of the built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) object.
	 * Reading contents of the set (by iterating, or by reading `set.size` or calling `set.has(...)` as in the [example](https://svelte.dev/playground/53438b51194b4882bcc18cddf9f96f15) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
	 * will cause it to be re-evaluated as necessary when the set is updated.
	 *
	 * Note that values in a reactive set are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
	 *
	 * ```svelte
	 * <script>
	 * 	import { SvelteSet } from 'svelte/reactivity';
	 * 	let monkeys = new SvelteSet();
	 *
	 * 	function toggle(monkey) {
	 * 		if (monkeys.has(monkey)) {
	 * 			monkeys.delete(monkey);
	 * 		} else {
	 * 			monkeys.add(monkey);
	 * 		}
	 * 	}
	 * </script>
	 *
	 * {#each ['🙈', '🙉', '🙊'] as monkey}
	 * 	<button onclick={() => toggle(monkey)}>{monkey}</button>
	 * {/each}
	 *
	 * <button onclick={() => monkeys.clear()}>clear</button>
	 *
	 * {#if monkeys.has('🙈')}<p>see no evil</p>{/if}
	 * {#if monkeys.has('🙉')}<p>hear no evil</p>{/if}
	 * {#if monkeys.has('🙊')}<p>speak no evil</p>{/if}
	 * ```
	 *
	 * 
	 */
	export class SvelteSet<T> extends Set<T> {
		
		constructor(value?: Iterable<T> | null | undefined);
		
		add(value: T): this;
		#private;
	}
	/**
	 * A reactive version of the built-in [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object.
	 * Reading contents of the map (by iterating, or by reading `map.size` or calling `map.get(...)` or `map.has(...)` as in the [tic-tac-toe example](https://svelte.dev/playground/0b0ff4aa49c9443f9b47fe5203c78293) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
	 * will cause it to be re-evaluated as necessary when the map is updated.
	 *
	 * Note that values in a reactive map are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
	 *
	 * ```svelte
	 * <script>
	 * 	import { SvelteMap } from 'svelte/reactivity';
	 * 	import { result } from './game.js';
	 *
	 * 	let board = new SvelteMap();
	 * 	let player = $state('x');
	 * 	let winner = $derived(result(board));
	 *
	 * 	function reset() {
	 * 		player = 'x';
	 * 		board.clear();
	 * 	}
	 * </script>
	 *
	 * <div class="board">
	 * 	{#each Array(9), i}
	 * 		<button
	 * 			disabled={board.has(i) || winner}
	 * 			onclick={() => {
	 * 				board.set(i, player);
	 * 				player = player === 'x' ? 'o' : 'x';
	 * 			}}
	 * 		>{board.get(i)}</button>
	 * 	{/each}
	 * </div>
	 *
	 * {#if winner}
	 * 	<p>{winner} wins!</p>
	 * 	<button onclick={reset}>reset</button>
	 * {:else}
	 * 	<p>{player} is next</p>
	 * {/if}
	 * ```
	 *
	 * 
	 */
	export class SvelteMap<K, V> extends Map<K, V> {
		
		constructor(value?: Iterable<readonly [K, V]> | null | undefined);
		
		set(key: K, value: V): this;
		#private;
	}
	/**
	 * A reactive version of the built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) object.
	 * Reading properties of the URL (such as `url.href` or `url.pathname`) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
	 * will cause it to be re-evaluated as necessary when the URL changes.
	 *
	 * The `searchParams` property is an instance of [SvelteURLSearchParams](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteURLSearchParams).
	 *
	 * [Example](https://svelte.dev/playground/5a694758901b448c83dc40dc31c71f2a):
	 *
	 * ```svelte
	 * <script>
	 * 	import { SvelteURL } from 'svelte/reactivity';
	 *
	 * 	const url = new SvelteURL('https://example.com/path');
	 * </script>
	 *
	 * <!-- changes to these... -->
	 * <input bind:value={url.protocol} />
	 * <input bind:value={url.hostname} />
	 * <input bind:value={url.pathname} />
	 *
	 * <hr />
	 *
	 * <!-- will update `href` and vice versa -->
	 * <input bind:value={url.href} size="65" />
	 * ```
	 */
	export class SvelteURL extends URL {
		get searchParams(): SvelteURLSearchParams;
		#private;
	}
	const REPLACE: unique symbol;
	/**
	 * A reactive version of the built-in [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object.
	 * Reading its contents (by iterating, or by calling `params.get(...)` or `params.getAll(...)` as in the [example](https://svelte.dev/playground/b3926c86c5384bab9f2cf993bc08c1c8) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
	 * will cause it to be re-evaluated as necessary when the params are updated.
	 *
	 * ```svelte
	 * <script>
	 * 	import { SvelteURLSearchParams } from 'svelte/reactivity';
	 *
	 * 	const params = new SvelteURLSearchParams('message=hello');
	 *
	 * 	let key = $state('key');
	 * 	let value = $state('value');
	 * </script>
	 *
	 * <input bind:value={key} />
	 * <input bind:value={value} />
	 * <button onclick={() => params.append(key, value)}>append</button>
	 *
	 * <p>?{params.toString()}</p>
	 *
	 * {#each params as [key, value]}
	 * 	<p>{key}: {value}</p>
	 * {/each}
	 * ```
	 */
	export class SvelteURLSearchParams extends URLSearchParams {
		
		[REPLACE](params: URLSearchParams): void;
		#private;
	}
	/**
	 * Creates a media query and provides a `current` property that reflects whether or not it matches.
	 *
	 * Use it carefully — during server-side rendering, there is no way to know what the correct value should be, potentially causing content to change upon hydration.
	 * If you can use the media query in CSS to achieve the same effect, do that.
	 *
	 * ```svelte
	 * <script>
	 * 	import { MediaQuery } from 'svelte/reactivity';
	 *
	 * 	const large = new MediaQuery('min-width: 800px');
	 * </script>
	 *
	 * <h1>{large.current ? 'large screen' : 'small screen'}</h1>
	 * ```
	 * @extends {ReactiveValue<boolean>}
	 * @since 5.7.0
	 */
	export class MediaQuery extends ReactiveValue<boolean> {
		/**
		 * @param query A media query string
		 * @param fallback Fallback value for the server
		 */
		constructor(query: string, fallback?: boolean | undefined);
	}
	/**
	 * Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
	 * It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
	 *
	 * If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
	 * the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
	 *
	 * If `start` returns a cleanup function, it will be called when the effect is destroyed.
	 *
	 * If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
	 * are active, and the returned teardown function will only be called when all effects are destroyed.
	 *
	 * It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
	 *
	 * ```js
	 * import { createSubscriber } from 'svelte/reactivity';
	 * import { on } from 'svelte/events';
	 *
	 * export class MediaQuery {
	 * 	#query;
	 * 	#subscribe;
	 *
	 * 	constructor(query) {
	 * 		this.#query = window.matchMedia(`(${query})`);
	 *
	 * 		this.#subscribe = createSubscriber((update) => {
	 * 			// when the `change` event occurs, re-run any effects that read `this.current`
	 * 			const off = on(this.#query, 'change', update);
	 *
	 * 			// stop listening when all the effects are destroyed
	 * 			return () => off();
	 * 		});
	 * 	}
	 *
	 * 	get current() {
	 * 		// This makes the getter reactive, if read in an effect
	 * 		this.#subscribe();
	 *
	 * 		// Return the current state of the query, whether or not we're in an effect
	 * 		return this.#query.matches;
	 * 	}
	 * }
	 * ```
	 * @since 5.7.0
	 */
	export function createSubscriber(start: (update: () => void) => (() => void) | void): () => void;
	class ReactiveValue<T> {
		
		constructor(fn: () => T, onsubscribe: (update: () => void) => void);
		get current(): T;
		#private;
	}

	export {};
}

declare module 'svelte/reactivity/window' {
	/**
	 * `scrollX.current` is a reactive view of `window.scrollX`. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const scrollX: ReactiveValue<number | undefined>;
	/**
	 * `scrollY.current` is a reactive view of `window.scrollY`. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const scrollY: ReactiveValue<number | undefined>;
	/**
	 * `innerWidth.current` is a reactive view of `window.innerWidth`. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const innerWidth: ReactiveValue<number | undefined>;
	/**
	 * `innerHeight.current` is a reactive view of `window.innerHeight`. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const innerHeight: ReactiveValue<number | undefined>;
	/**
	 * `outerWidth.current` is a reactive view of `window.outerWidth`. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const outerWidth: ReactiveValue<number | undefined>;
	/**
	 * `outerHeight.current` is a reactive view of `window.outerHeight`. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const outerHeight: ReactiveValue<number | undefined>;
	/**
	 * `screenLeft.current` is a reactive view of `window.screenLeft`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const screenLeft: ReactiveValue<number | undefined>;
	/**
	 * `screenTop.current` is a reactive view of `window.screenTop`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const screenTop: ReactiveValue<number | undefined>;
	/**
	 * `online.current` is a reactive view of `navigator.onLine`. On the server it is `undefined`.
	 * @since 5.11.0
	 */
	export const online: ReactiveValue<boolean | undefined>;
	/**
	 * `devicePixelRatio.current` is a reactive view of `window.devicePixelRatio`. On the server it is `undefined`.
	 * Note that behaviour differs between browsers — on Chrome it will respond to the current zoom level,
	 * on Firefox and Safari it won't.
	 * @since 5.11.0
	 */
	export const devicePixelRatio: {
		get current(): number | undefined;
	};
	class ReactiveValue<T> {
		
		constructor(fn: () => T, onsubscribe: (update: () => void) => void);
		get current(): T;
		#private;
	}

	export {};
}

declare module 'svelte/server' {
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
	type Csp = { nonce?: string; hash?: boolean };

	type Sha256Source = `sha256-${string}`;

	interface SyncRenderOutput {
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

	type RenderOutput = SyncRenderOutput & PromiseLike<SyncRenderOutput>;

	export {};
}

declare module 'svelte/store' {
	/** Callback to inform of a value updates. */
	export type Subscriber<T> = (value: T) => void;

	/** Unsubscribes from value updates. */
	export type Unsubscriber = () => void;

	/** Callback to update a value. */
	export type Updater<T> = (value: T) => T;

	/**
	 * Start and stop notification callbacks.
	 * This function is called when the first subscriber subscribes.
	 *
	 * @param set Function that sets the value of the store.
	 * @param update Function that sets the value of the store after passing the current value to the update function.
	 * @returns Optionally, a cleanup function that is called when the last remaining
	 * subscriber unsubscribes.
	 */
	export type StartStopNotifier<T> = (
		set: (value: T) => void,
		update: (fn: Updater<T>) => void
	) => void | (() => void);

	/** Readable interface for subscribing. */
	export interface Readable<T> {
		/**
		 * Subscribe on value changes.
		 * @param run subscription callback
		 * @param invalidate cleanup callback
		 */
		subscribe(this: void, run: Subscriber<T>, invalidate?: () => void): Unsubscriber;
	}

	/** Writable interface for both updating and subscribing. */
	export interface Writable<T> extends Readable<T> {
		/**
		 * Set value and inform subscribers.
		 * @param value to set
		 */
		set(this: void, value: T): void;

		/**
		 * Update value using callback and inform subscribers.
		 * @param updater callback
		 */
		update(this: void, updater: Updater<T>): void;
	}
	export function toStore<V>(get: () => V, set: (v: V) => void): Writable<V>;

	export function toStore<V>(get: () => V): Readable<V>;

	export function fromStore<V>(store: Writable<V>): {
		current: V;
	};

	export function fromStore<V>(store: Readable<V>): {
		readonly current: V;
	};
	/**
	 * Creates a `Readable` store that allows reading by subscription.
	 *
	 * @param value initial value
	 * */
	export function readable<T>(value?: T | undefined, start?: StartStopNotifier<T> | undefined): Readable<T>;
	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * @param value initial value
	 * */
	export function writable<T>(value?: T | undefined, start?: StartStopNotifier<T> | undefined): Writable<T>;
	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * */
	export function derived<S extends Stores, T>(stores: S, fn: (values: StoresValues<S>, set: (value: T) => void, update: (fn: Updater<T>) => void) => Unsubscriber | void, initial_value?: T | undefined): Readable<T>;
	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * */
	export function derived<S extends Stores, T>(stores: S, fn: (values: StoresValues<S>) => T, initial_value?: T | undefined): Readable<T>;
	/**
	 * Takes a store and returns a new one derived from the old one that is readable.
	 *
	 * @param store  - store to make readonly
	 * */
	export function readonly<T>(store: Readable<T>): Readable<T>;
	/**
	 * Get the current value from a store by subscribing and immediately unsubscribing.
	 *
	 * */
	export function get<T>(store: Readable<T>): T;
	/** One or more `Readable`s. */
	type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;

	/** One or more values from `Readable` stores. */
	type StoresValues<T> =
		T extends Readable<infer U> ? U : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

	export {};
}

declare module 'svelte/transition' {
	export type EasingFunction = (t: number) => number;

	export interface TransitionConfig {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		css?: (t: number, u: number) => string;
		tick?: (t: number, u: number) => void;
	}

	export interface BlurParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		amount?: number | string;
		opacity?: number;
	}

	export interface FadeParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
	}

	export interface FlyParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		x?: number | string;
		y?: number | string;
		opacity?: number;
	}

	export interface SlideParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		axis?: 'x' | 'y';
	}

	export interface ScaleParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		start?: number;
		opacity?: number;
	}

	export interface DrawParams {
		delay?: number;
		speed?: number;
		duration?: number | ((len: number) => number);
		easing?: EasingFunction;
	}

	export interface CrossfadeParams {
		delay?: number;
		duration?: number | ((len: number) => number);
		easing?: EasingFunction;
	}
	/**
	 * Animates a `blur` filter alongside an element's opacity.
	 *
	 * */
	export function blur(node: Element, { delay, duration, easing, amount, opacity }?: BlurParams | undefined): TransitionConfig;
	/**
	 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
	 *
	 * */
	export function fade(node: Element, { delay, duration, easing }?: FadeParams | undefined): TransitionConfig;
	/**
	 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
	 *
	 * */
	export function fly(node: Element, { delay, duration, easing, x, y, opacity }?: FlyParams | undefined): TransitionConfig;
	/**
	 * Slides an element in and out.
	 *
	 * */
	export function slide(node: Element, { delay, duration, easing, axis }?: SlideParams | undefined): TransitionConfig;
	/**
	 * Animates the opacity and scale of an element. `in` transitions animate from the provided values, passed as parameters, to an element's current (default) values. `out` transitions animate from an element's default values to the provided values.
	 *
	 * */
	export function scale(node: Element, { delay, duration, easing, start, opacity }?: ScaleParams | undefined): TransitionConfig;
	/**
	 * Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.
	 *
	 * */
	export function draw(node: SVGElement & {
		getTotalLength(): number;
	}, { delay, speed, duration, easing }?: DrawParams | undefined): TransitionConfig;
	/**
	 * The `crossfade` function creates a pair of [transitions](https://svelte.dev/docs/svelte/transition) called `send` and `receive`. When an element is 'sent', it looks for a corresponding element being 'received', and generates a transition that transforms the element to its counterpart's position and fades it out. When an element is 'received', the reverse happens. If there is no counterpart, the `fallback` transition is used.
	 *
	 * */
	export function crossfade({ fallback, ...defaults }: CrossfadeParams & {
		fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
	}): [(node: any, params: CrossfadeParams & {
		key: any;
	}) => () => TransitionConfig, (node: any, params: CrossfadeParams & {
		key: any;
	}) => () => TransitionConfig];

	export {};
}

declare module 'svelte/events' {
	// Once https://github.com/microsoft/TypeScript/issues/59980 is fixed we can put these overloads into the JSDoc comments of the `on` function

	/**
	 * Attaches an event handler to the window and returns a function that removes the handler. Using this
	 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
	 * (with attributes like `onclick`), which use event delegation for performance reasons
	 */
	export function on<Type extends keyof WindowEventMap>(
		window: Window,
		type: Type,
		handler: (this: Window, event: WindowEventMap[Type] & { currentTarget: Window }) => any,
		options?: AddEventListenerOptions | undefined
	): () => void;
	/**
	 * Attaches an event handler to the document and returns a function that removes the handler. Using this
	 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
	 * (with attributes like `onclick`), which use event delegation for performance reasons
	 */
	export function on<Type extends keyof DocumentEventMap>(
		document: Document,
		type: Type,
		handler: (this: Document, event: DocumentEventMap[Type] & { currentTarget: Document }) => any,
		options?: AddEventListenerOptions | undefined
	): () => void;
	/**
	 * Attaches an event handler to an element and returns a function that removes the handler. Using this
	 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
	 * (with attributes like `onclick`), which use event delegation for performance reasons
	 */
	export function on<Element extends HTMLElement, Type extends keyof HTMLElementEventMap>(
		element: Element,
		type: Type,
		handler: (this: Element, event: HTMLElementEventMap[Type] & { currentTarget: Element }) => any,
		options?: AddEventListenerOptions | undefined
	): () => void;
	/**
	 * Attaches an event handler to an element and returns a function that removes the handler. Using this
	 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
	 * (with attributes like `onclick`), which use event delegation for performance reasons
	 */
	export function on<Element extends MediaQueryList, Type extends keyof MediaQueryListEventMap>(
		element: Element,
		type: Type,
		handler: (this: Element, event: MediaQueryListEventMap[Type] & { currentTarget: Element }) => any,
		options?: AddEventListenerOptions | undefined
	): () => void;
	/**
	 * Attaches an event handler to an element and returns a function that removes the handler. Using this
	 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
	 * (with attributes like `onclick`), which use event delegation for performance reasons
	 */
	export function on(
		element: EventTarget,
		type: string,
		handler: EventListener,
		options?: AddEventListenerOptions | undefined
	): () => void;

	export {};
}

declare module 'svelte/types/compiler/preprocess' {
	/** @deprecated import this from 'svelte/preprocess' instead */
	export type MarkupPreprocessor = MarkupPreprocessor_1;
	/** @deprecated import this from 'svelte/preprocess' instead */
	export type Preprocessor = Preprocessor_1;
	/** @deprecated import this from 'svelte/preprocess' instead */
	export type PreprocessorGroup = PreprocessorGroup_1;
	/** @deprecated import this from 'svelte/preprocess' instead */
	export type Processed = Processed_1;
	/** @deprecated import this from 'svelte/preprocess' instead */
	export type SveltePreprocessor<PreprocessorType extends keyof PreprocessorGroup_1, Options = any> = SveltePreprocessor_1<
		PreprocessorType,
		Options
	>;
	/**
	 * The result of a preprocessor run. If the preprocessor does not return a result, it is assumed that the code is unchanged.
	 */
	interface Processed_1 {
		/**
		 * The new code
		 */
		code: string;
		/**
		 * A source map mapping back to the original code
		 */
		map?: string | object; // we are opaque with the type here to avoid dependency on the remapping module for our public types.
		/**
		 * A list of additional files to watch for changes
		 */
		dependencies?: string[];
		/**
		 * Only for script/style preprocessors: The updated attributes to set on the tag. If undefined, attributes stay unchanged.
		 */
		attributes?: Record<string, string | boolean>;
		toString?: () => string;
	}

	/**
	 * A markup preprocessor that takes a string of code and returns a processed version.
	 */
	type MarkupPreprocessor_1 = (options: {
		/**
		 * The whole Svelte file content
		 */
		content: string;
		/**
		 * The filename of the Svelte file
		 */
		filename?: string;
	}) => Processed_1 | void | Promise<Processed_1 | void>;

	/**
	 * A script/style preprocessor that takes a string of code and returns a processed version.
	 */
	type Preprocessor_1 = (options: {
		/**
		 * The script/style tag content
		 */
		content: string;
		/**
		 * The attributes on the script/style tag
		 */
		attributes: Record<string, string | boolean>;
		/**
		 * The whole Svelte file content
		 */
		markup: string;
		/**
		 * The filename of the Svelte file
		 */
		filename?: string;
	}) => Processed_1 | void | Promise<Processed_1 | void>;

	/**
	 * A preprocessor group is a set of preprocessors that are applied to a Svelte file.
	 */
	interface PreprocessorGroup_1 {
		/** Name of the preprocessor. Will be a required option in the next major version */
		name?: string;
		markup?: MarkupPreprocessor_1;
		style?: Preprocessor_1;
		script?: Preprocessor_1;
	}

	/**
	 * @description Utility type to extract the type of a preprocessor from a preprocessor group
	 * @deprecated Create this utility type yourself instead
	 */
	interface SveltePreprocessor_1<
		PreprocessorType extends keyof PreprocessorGroup_1,
		Options = any
	> {
		(options?: Options): Required<Pick<PreprocessorGroup_1, PreprocessorType>>;
	}

	export {};
}

declare module 'svelte/types/compiler/interfaces' {
	import type { Location } from 'locate-character';
	/** @deprecated import this from 'svelte' instead */
	export type CompileOptions = CompileOptions_1;
	/** @deprecated import this from 'svelte' instead */
	export type Warning = Warning_1;
	interface Warning_1 extends ICompileDiagnostic {}

	type CssHashGetter = (args: {
		name: string;
		filename: string;
		css: string;
		hash: (input: string) => string;
	}) => string;

	interface CompileOptions_1 extends ModuleCompileOptions {
		/**
		 * Sets the name of the resulting JavaScript class (though the compiler will rename it if it would otherwise conflict with other variables in scope).
		 * If unspecified, will be inferred from `filename`
		 */
		name?: string;
		/**
		 * If `true`, tells the compiler to generate a custom element constructor instead of a regular Svelte component.
		 *
		 * @default false
		 */
		customElement?: boolean;
		/**
		 * If `true`, getters and setters will be created for the component's props. If `false`, they will only be created for readonly exported values (i.e. those declared with `const`, `class` and `function`). If compiling with `customElement: true` this option defaults to `true`.
		 *
		 * @default false
		 * @deprecated This will have no effect in runes mode
		 */
		accessors?: boolean;
		/**
		 * The namespace of the element; e.g., `"html"`, `"svg"`, `"mathml"`.
		 *
		 * @default 'html'
		 */
		namespace?: Namespace;
		/**
		 * If `true`, tells the compiler that you promise not to mutate any objects.
		 * This allows it to be less conservative about checking whether values have changed.
		 *
		 * @default false
		 * @deprecated This will have no effect in runes mode
		 */
		immutable?: boolean;
		/**
		 * - `'injected'`: styles will be included in the `head` when using `render(...)`, and injected into the document (if not already present) when the component mounts. For components compiled as custom elements, styles are injected to the shadow root.
		 * - `'external'`: the CSS will only be returned in the `css` field of the compilation result. Most Svelte bundler plugins will set this to `'external'` and use the CSS that is statically generated for better performance, as it will result in smaller JavaScript bundles and the output can be served as cacheable `.css` files.
		 * This is always `'injected'` when compiling with `customElement` mode.
		 */
		css?: 'injected' | 'external';
		/**
		 * A function that takes a `{ hash, css, name, filename }` argument and returns the string that is used as a classname for scoped CSS.
		 * It defaults to returning `svelte-${hash(filename ?? css)}`.
		 *
		 * @default undefined
		 */
		cssHash?: CssHashGetter;
		/**
		 * If `true`, your HTML comments will be preserved in the output. By default, they are stripped out.
		 *
		 * @default false
		 */
		preserveComments?: boolean;
		/**
		 *  If `true`, whitespace inside and between elements is kept as you typed it, rather than removed or collapsed to a single space where possible.
		 *
		 * @default false
		 */
		preserveWhitespace?: boolean;
		/**
		 * Which strategy to use when cloning DOM fragments:
		 *
		 * - `html` populates a `<template>` with `innerHTML` and clones it. This is faster, but cannot be used if your app's [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) includes [`require-trusted-types-for 'script'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/require-trusted-types-for)
		 * - `tree` creates the fragment one element at a time and _then_ clones it. This is slower, but works everywhere
		 *
		 * @default 'html'
		 * @since 5.33
		 */
		fragments?: 'html' | 'tree';
		/**
		 * Set to `true` to force the compiler into runes mode, even if there are no indications of runes usage.
		 * Set to `false` to force the compiler into ignoring runes, even if there are indications of runes usage.
		 * Set to `undefined` (the default) to infer runes mode from the component code.
		 * Is always `true` for JS/TS modules compiled with Svelte.
		 * Will be `true` by default in Svelte 6.
		 * Note that setting this to `true` in your `svelte.config.js` will force runes mode for your entire project, including components in `node_modules`,
		 * which is likely not what you want. If you're using Vite, consider using [dynamicCompileOptions](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#dynamiccompileoptions) instead.
		 * @default undefined
		 */
		runes?: boolean | undefined;
		/**
		 *  If `true`, exposes the Svelte major version in the browser by adding it to a `Set` stored in the global `window.__svelte.v`.
		 *
		 * @default true
		 */
		discloseVersion?: boolean;
		/**
		 * @deprecated Use these only as a temporary solution before migrating your code
		 */
		compatibility?: {
			/**
			 * Applies a transformation so that the default export of Svelte files can still be instantiated the same way as in Svelte 4 —
			 * as a class when compiling for the browser (as though using `createClassComponent(MyComponent, {...})` from `svelte/legacy`)
			 * or as an object with a `.render(...)` method when compiling for the server
			 * @default 5
			 */
			componentApi?: 4 | 5;
		};
		/**
		 * An initial sourcemap that will be merged into the final output sourcemap.
		 * This is usually the preprocessor sourcemap.
		 *
		 * @default null
		 */
		sourcemap?: object | string;
		/**
		 * Used for your JavaScript sourcemap.
		 *
		 * @default null
		 */
		outputFilename?: string;
		/**
		 * Used for your CSS sourcemap.
		 *
		 * @default null
		 */
		cssOutputFilename?: string;
		/**
		 * If `true`, compiles components with hot reloading support.
		 *
		 * @default false
		 */
		hmr?: boolean;
		/**
		 * If `true`, returns the modern version of the AST.
		 * Will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
		 *
		 * @default false
		 */
		modernAst?: boolean;
	}

	interface ModuleCompileOptions {
		/**
		 * If `true`, causes extra code to be added that will perform runtime checks and provide debugging information during development.
		 *
		 * @default false
		 */
		dev?: boolean;
		/**
		 * If `"client"`, Svelte emits code designed to run in the browser.
		 * If `"server"`, Svelte emits code suitable for server-side rendering.
		 * If `false`, nothing is generated. Useful for tooling that is only interested in warnings.
		 *
		 * @default 'client'
		 */
		generate?: 'client' | 'server' | false;
		/**
		 * Used for debugging hints and sourcemaps. Your bundler plugin will set it automatically.
		 */
		filename?: string;
		/**
		 * Used for ensuring filenames don't leak filesystem information. Your bundler plugin will set it automatically.
		 * @default process.cwd() on node-like environments, undefined elsewhere
		 */
		rootDir?: string;
		/**
		 * A function that gets a `Warning` as an argument and returns a boolean.
		 * Use this to filter out warnings. Return `true` to keep the warning, `false` to discard it.
		 */
		warningFilter?: (warning: Warning_1) => boolean;
		/**
		 * Experimental options
		 * @since 5.36
		 */
		experimental?: {
			/**
			 * Allow `await` keyword in deriveds, template expressions, and the top level of components
			 * @since 5.36
			 */
			async?: boolean;
		};
	}
	/**
	 * - `html`    — the default, for e.g. `<div>` or `<span>`
	 * - `svg`     — for e.g. `<svg>` or `<g>`
	 * - `mathml`  — for e.g. `<math>` or `<mrow>`
	 */
	type Namespace = 'html' | 'svg' | 'mathml';
	type ICompileDiagnostic = {
		code: string;
		message: string;
		stack?: string;
		filename?: string;
		start?: Location;
		end?: Location;
		position?: [number, number];
		frame?: string;
	};

	export {};
}declare module '*.svelte' {
	// use prettier-ignore for a while because of https://github.com/sveltejs/language-tools/commit/026111228b5814a9109cc4d779d37fb02955fb8b
	// prettier-ignore
	import { SvelteComponent } from 'svelte'
	import { LegacyComponentType } from 'svelte/legacy';
	const Comp: LegacyComponentType;
	type Comp = SvelteComponent;
	export default Comp;
}

/**
 * Declares reactive state.
 *
 * Example:
 * ```ts
 * let count = $state(0);
 * ```
 *
 * https://svelte.dev/docs/svelte/$state
 *
 * @param initial The initial value
 */
declare function $state<T>(initial: T): T;
declare function $state<T>(): T | undefined;

declare namespace $state {
	type Primitive = string | number | boolean | null | undefined;

	type TypedArray =
		| Int8Array
		| Uint8Array
		| Uint8ClampedArray
		| Int16Array
		| Uint16Array
		| Int32Array
		| Uint32Array
		| Float32Array
		| Float64Array
		| BigInt64Array
		| BigUint64Array;

	/** The things that `structuredClone` can handle — https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm */
	export type Cloneable =
		| ArrayBuffer
		| DataView
		| Date
		| Error
		| Map<any, any>
		| RegExp
		| Set<any>
		| TypedArray
		// web APIs
		| Blob
		| CryptoKey
		| DOMException
		| DOMMatrix
		| DOMMatrixReadOnly
		| DOMPoint
		| DOMPointReadOnly
		| DOMQuad
		| DOMRect
		| DOMRectReadOnly
		| File
		| FileList
		| FileSystemDirectoryHandle
		| FileSystemFileHandle
		| FileSystemHandle
		| ImageBitmap
		| ImageData
		| RTCCertificate
		| VideoFrame;

	/** Turn `SvelteDate`, `SvelteMap` and `SvelteSet` into their non-reactive counterparts. (`URL` is uncloneable.) */
	type NonReactive<T> = T extends Date
		? Date
		: T extends Map<infer K, infer V>
			? Map<K, V>
			: T extends Set<infer K>
				? Set<K>
				: T;

	type Snapshot<T> = T extends Primitive
		? T
		: T extends Cloneable
			? NonReactive<T>
			: T extends { toJSON(): infer R }
				? R
				: T extends readonly unknown[]
					? { [K in keyof T]: Snapshot<T[K]> }
					: T extends Array<infer U>
						? Array<Snapshot<U>>
						: T extends object
							? T extends { [key: string]: any }
								? { [K in keyof T]: Snapshot<T[K]> }
								: never
							: never;

	/**
	 * Returns the latest `value`, even if the rest of the UI is suspending
	 * while async work (such as data loading) completes.
	 *
	 * ```svelte
	 * <nav>
	 *   <a href="/" aria-current={$state.eager(pathname) === '/' ? 'page' : null}>home</a>
	 *   <a href="/about" aria-current={$state.eager(pathname) === '/about' ? 'page' : null}>about</a>
	 * </nav>
	 * ```
	 */
	export function eager<T>(value: T): T;
	/**
	 * Declares state that is _not_ made deeply reactive — instead of mutating it,
	 * you must reassign it.
	 *
	 * Example:
	 * ```svelte
	 * <script>
	 *   let items = $state.raw([0]);
	 *
	 *   const addItem = () => {
	 *     items = [...items, items.length];
	 *   };
	 * </script>
	 *
	 * <button onclick={addItem}>
	 *   {items.join(', ')}
	 * </button>
	 * ```
	 *
	 * https://svelte.dev/docs/svelte/$state#$state.raw
	 *
	 * @param initial The initial value
	 */
	export function raw<T>(initial: T): T;
	export function raw<T>(): T | undefined;
	/**
	 * To take a static snapshot of a deeply reactive `$state` proxy, use `$state.snapshot`:
	 *
	 * Example:
	 * ```svelte
	 * <script>
	 *   let counter = $state({ count: 0 });
	 *
	 *   function onclick() {
	 *     // Will log `{ count: ... }` rather than `Proxy { ... }`
	 *     console.log($state.snapshot(counter));
	 *   };
	 * </script>
	 * ```
	 *
	 * https://svelte.dev/docs/svelte/$state#$state.snapshot
	 *
	 * @param state The value to snapshot
	 */
	export function snapshot<T>(state: T): Snapshot<T>;

	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;

	// needed to keep private stuff private
	export {};
}

/**
 * Declares derived state, i.e. one that depends on other state variables.
 * The expression inside `$derived(...)` should be free of side-effects.
 *
 * Example:
 * ```ts
 * let double = $derived(count * 2);
 * ```
 *
 * https://svelte.dev/docs/svelte/$derived
 *
 * @param expression The derived state expression
 */
declare function $derived<T>(expression: T): T;

declare namespace $derived {
	/**
	 * Sometimes you need to create complex derivations that don't fit inside a short expression.
	 * In these cases, you can use `$derived.by` which accepts a function as its argument.
	 *
	 * Example:
	 * ```ts
	 * let total = $derived.by(() => {
	 *   let result = 0;
	 *	 for (const n of numbers) {
	 *	   result += n;
	 *   }
	 *   return result;
	 * });
	 * ```
	 *
	 * https://svelte.dev/docs/svelte/$derived#$derived.by
	 */
	export function by<T>(fn: () => T): T;

	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;

	// needed to keep private stuff private
	export {};
}

/**
 * Runs code when a component is mounted to the DOM, and then whenever its dependencies change, i.e. `$state` or `$derived` values.
 * The timing of the execution is after the DOM has been updated.
 *
 * Example:
 * ```ts
 * $effect(() => console.log('The count is now ' + count));
 * ```
 *
 * If you return a function from the effect, it will be called right before the effect is run again, or when the component is unmounted.
 *
 * Does not run during server-side rendering.
 *
 * https://svelte.dev/docs/svelte/$effect
 * @param fn The function to execute
 */
declare function $effect(fn: () => void | (() => void)): void;

declare namespace $effect {
	/**
	 * Runs code right before a component is mounted to the DOM, and then whenever its dependencies change, i.e. `$state` or `$derived` values.
	 * The timing of the execution is right before the DOM is updated.
	 *
	 * Example:
	 * ```ts
	 * $effect.pre(() => console.log('The count is now ' + count));
	 * ```
	 *
	 * If you return a function from the effect, it will be called right before the effect is run again, or when the component is unmounted.
	 *
	 * Does not run during server-side rendering.
	 *
	 * https://svelte.dev/docs/svelte/$effect#$effect.pre
	 * @param fn The function to execute
	 */
	export function pre(fn: () => void | (() => void)): void;

	/**
	 * Returns the number of promises that are pending in the current boundary, not including child boundaries.
	 *
	 * https://svelte.dev/docs/svelte/$effect#$effect.pending
	 */
	export function pending(): number;

	/**
	 * The `$effect.tracking` rune is an advanced feature that tells you whether or not the code is running inside a tracking context, such as an effect or inside your template.
	 *
	 * Example:
	 * ```svelte
	 * <script>
	 *   console.log('in component setup:', $effect.tracking()); // false
	 *
	 *   $effect(() => {
	 *     console.log('in effect:', $effect.tracking()); // true
	 *   });
	 * </script>
	 *
	 * <p>in template: {$effect.tracking()}</p> <!-- true -->
	 * ```
	 *
	 * This allows you to (for example) add things like subscriptions without causing memory leaks, by putting them in child effects.
	 *
	 * https://svelte.dev/docs/svelte/$effect#$effect.tracking
	 */
	export function tracking(): boolean;

	/**
	 * The `$effect.root` rune is an advanced feature that creates a non-tracked scope that doesn't auto-cleanup. This is useful for
	 * nested effects that you want to manually control. This rune also allows for creation of effects outside of the component
	 * initialisation phase.
	 *
	 * Example:
	 * ```svelte
	 * <script>
	 *   let count = $state(0);
	 *
	 *   const cleanup = $effect.root(() => {
	 *     $effect(() => {
	 *       console.log(count);
	 *     })
	 *
	 *     return () => {
	 *       console.log('effect root cleanup');
	 *     }
	 *   });
	 * </script>
	 *
	 * <button onclick={() => cleanup()}>cleanup</button>
	 * ```
	 *
	 * https://svelte.dev/docs/svelte/$effect#$effect.root
	 */
	export function root(fn: () => void | (() => void)): () => void;

	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;

	// needed to keep private stuff private
	export {};
}

/**
 * Declares the props that a component accepts. Example:
 *
 * ```ts
 * let { optionalProp = 42, requiredProp, bindableProp = $bindable() }: { optionalProp?: number; requiredProps: string; bindableProp: boolean } = $props();
 * ```
 *
 * https://svelte.dev/docs/svelte/$props
 */
declare function $props(): any;

declare namespace $props {
	/**
	 * Generates an ID that is unique to the current component instance. When hydrating a server-rendered component,
	 * the value will be consistent between server and client.
	 *
	 * This is useful for linking elements via attributes like `for` and `aria-labelledby`.
	 * @since 5.20.0
	 */
	export function id(): string;

	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;

	// needed to keep private stuff private
	export {};
}

/**
 * Declares a prop as bindable, meaning the parent component can use `bind:propName={value}` to bind to it.
 *
 * ```ts
 * let { propName = $bindable() }: { propName: boolean } = $props();
 * ```
 *
 * https://svelte.dev/docs/svelte/$bindable
 */
declare function $bindable<T>(fallback?: T): T;

declare namespace $bindable {
	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;

	// needed to keep private stuff private
	export {};
}

/**
 * Inspects one or more values whenever they, or the properties they contain, change. Example:
 *
 * ```ts
 * $inspect(someValue, someOtherValue)
 * ```
 *
 * `$inspect` returns a `with` function, which you can invoke with a callback function that
 * will be called with the value and the event type (`'init'` or `'update'`) on every change.
 * By default, the values will be logged to the console.
 *
 * ```ts
 * $inspect(x).with(console.trace);
 * $inspect(x, y).with(() => { debugger; });
 * ```
 *
 * https://svelte.dev/docs/svelte/$inspect
 */
declare function $inspect<T extends any[]>(
	...values: T
): { with: (fn: (type: 'init' | 'update', ...values: T) => void) => void };

declare namespace $inspect {
	/**
	 * Tracks which reactive state changes caused an effect to re-run. Must be the first
	 * statement of a function body. Example:
	 *
	 * ```svelte
	 * <script>
	 *   let count = $state(0);
	 *
	 *   $effect(() => {
	 *     $inspect.trace('my effect');
	 *
	 *     count;
	 *   });
	 * </script>
	 */
	export function trace(name?: string): void;

	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;

	// needed to keep private stuff private
	export {};
}

/**
 * Retrieves the `this` reference of the custom element that contains this component. Example:
 *
 * ```svelte
 * <svelte:options customElement="my-element" />
 *
 * <script>
 * 	function greet(greeting) {
 * 		$host().dispatchEvent(new CustomEvent('greeting', { detail: greeting }))
 * 	}
 * </script>
 *
 * <button onclick={() => greet('hello')}>say hello</button>
 * ```
 *
 * Only available inside custom element components, and only on the client-side.
 *
 * https://svelte.dev/docs/svelte/$host
 */
declare function $host<El extends HTMLElement = HTMLElement>(): El;

declare namespace $host {
	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;

	// needed to keep private stuff private
	export {};
}

//# sourceMappingURL=index.d.ts.map
