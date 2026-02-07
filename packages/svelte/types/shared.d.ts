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
export type Properties<Props, Slots> = Props &
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

export const brand: unique symbol;
export type Brand<B> = { [brand]: B };
export type Branded<T, B> = T & Brand<B>;

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

export const SnippetReturn: unique symbol;

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
export type NotFunction<T> = T extends Function ? never : T;
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
export type Getters<T> = {
	[K in keyof T]: () => T[K];
};

export {};

