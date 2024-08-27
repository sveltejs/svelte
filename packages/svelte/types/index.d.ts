declare module 'svelte' {
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
		recover?: boolean;
		sync?: boolean;
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
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * */
	export function onMount<T>(fn: () => NotFunction<T> | Promise<NotFunction<T>> | (() => any)): void;
	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * */
	export function onDestroy(fn: () => any): void;
	/**
	 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
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
	 *  loaded: never; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * https://svelte.dev/docs/svelte#createeventdispatcher
	 * @deprecated Use callback props and/or the `$host()` rune instead — see https://svelte-5-preview.vercel.app/docs/deprecations#createeventdispatcher
	 * */
	export function createEventDispatcher<EventMap extends Record<string, any> = any>(): EventDispatcher<EventMap>;
	/**
	 * Schedules a callback to run immediately before the component is updated after any state change.
	 *
	 * The first time the callback runs will be before the initial `onMount`.
	 *
	 * In runes mode use `$effect.pre` instead.
	 *
	 * https://svelte.dev/docs/svelte#beforeupdate
	 * @deprecated Use `$effect.pre` instead — see https://svelte-5-preview.vercel.app/docs/deprecations#beforeupdate-and-afterupdate
	 * */
	export function beforeUpdate(fn: () => void): void;
	/**
	 * Schedules a callback to run immediately after the component has been updated.
	 *
	 * The first time the callback runs will be after the initial `onMount`.
	 *
	 * In runes mode use `$effect` instead.
	 *
	 * https://svelte.dev/docs/svelte#afterupdate
	 * @deprecated Use `$effect` instead — see https://svelte-5-preview.vercel.app/docs/deprecations#beforeupdate-and-afterupdate
	 * */
	export function afterUpdate(fn: () => void): void;
	/**
	 * Synchronously flushes any pending state changes and those that result from it.
	 * */
	export function flushSync(fn?: (() => void) | undefined): void;
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
	 * Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
	 * Transitions will play during the initial render unless the `intro` option is set to `false`.
	 *
	 * */
	export function mount<Props extends Record<string, any>, Exports extends Record<string, any>>(component: ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>, options: {} extends Props ? {
		target: Document | Element | ShadowRoot;
		anchor?: Node;
		props?: Props;
		events?: Record<string, (e: any) => any>;
		context?: Map<any, any>;
		intro?: boolean;
	} : {
		target: Document | Element | ShadowRoot;
		props: Props;
		anchor?: Node;
		events?: Record<string, (e: any) => any>;
		context?: Map<any, any>;
		intro?: boolean;
	}): Exports;
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
	 * */
	export function unmount(component: Record<string, any>): void;
	/**
	 * Returns a promise that resolves once any pending state changes have been applied.
	 * */
	export function tick(): Promise<void>;
	/**
	 * Use `untrack` to prevent something from being treated as an `$effect`/`$derived` dependency.
	 *
	 * https://svelte-5-preview.vercel.app/docs/functions#untrack
	 * */
	export function untrack<T>(fn: () => T): T;
	/**
	 * Retrieves the context that belongs to the closest parent component with the specified `key`.
	 * Must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#getcontext
	 * */
	export function getContext<T>(key: any): T;
	/**
	 * Associates an arbitrary `context` object with the current component and the specified `key`
	 * and returns that object. The context is then available to children of the component
	 * (including slotted content) with `getContext`.
	 *
	 * Like lifecycle functions, this must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#setcontext
	 * */
	export function setContext<T>(key: any, context: T): T;
	/**
	 * Checks whether a given `key` has been set in the context of a parent component.
	 * Must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#hascontext
	 * */
	export function hasContext(key: any): boolean;
	/**
	 * Retrieves the whole context map that belongs to the closest parent component.
	 * Must be called during component initialisation. Useful, for example, if you
	 * programmatically create a component and want to pass the existing context to it.
	 *
	 * https://svelte.dev/docs/svelte#getallcontexts
	 * */
	export function getAllContexts<T extends Map<any, any> = Map<any, any>>(): T;
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
	 *
	 * Docs: https://svelte.dev/docs/svelte-action
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
	 * `Action<HTMLDivElement>` and `Action<HTMLDiveElement, undefined>` both signal that the action accepts no parameters.
	 *
	 * You can return an object with methods `update` and `destroy` from the function and type which additional attributes and events it has.
	 * See interface `ActionReturn` for more details.
	 *
	 * Docs: https://svelte.dev/docs/svelte-action
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
	 * https://svelte.dev/docs/svelte-animate#flip
	 * */
	export function flip(node: Element, { from, to }: {
		from: DOMRect;
		to: DOMRect;
	}, params?: FlipParams): AnimationConfig;

	export {};
}

declare module 'svelte/compiler' {
	import type { AssignmentExpression, ClassDeclaration, Expression, FunctionDeclaration, Identifier, ImportDeclaration, ArrayExpression, MemberExpression, ObjectExpression, Pattern, Node, VariableDeclarator, ArrowFunctionExpression, VariableDeclaration, FunctionExpression, Program, ChainExpression, SimpleCallExpression } from 'estree';
	import type { SourceMap } from 'magic-string';
	import type { Location } from 'locate-character';
	/**
	 * `compile` converts your `.svelte` source code into a JavaScript module that exports a component
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-compile
	 * @param source The component source code
	 * @param options The compiler options
	 * */
	export function compile(source: string, options: CompileOptions): CompileResult;
	/**
	 * `compileModule` takes your JavaScript source code containing runes, and turns it into a JavaScript module.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-compile
	 * @param source The component source code
	 * */
	export function compileModule(source: string, options: ModuleCompileOptions): CompileResult;
	/**
	 * The parse function parses a component, returning only its abstract syntax tree.
	 *
	 * The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
	 * `modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-parse
	 * */
	export function parse(source: string, options: {
		filename?: string;
		modern: true;
	}): Root;
	/**
	 * The parse function parses a component, returning only its abstract syntax tree.
	 *
	 * The `modern` option (`false` by default in Svelte 5) makes the parser return a modern AST instead of the legacy AST.
	 * `modern` will become `true` by default in Svelte 6, and the option will be removed in Svelte 7.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-parse
	 * */
	export function parse(source: string, options?: {
		filename?: string;
		modern?: false;
	} | undefined): LegacyRoot;
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
		 * It defaults to returning `svelte-${hash(css)}`.
		 *
		 * @default undefined
		 */
		cssHash?: CssHashGetter;
		/**
		 * If `true`, your HTML comments will be preserved during server-side rendering. By default, they are stripped out.
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
	}

	type DeclarationKind =
		| 'var'
		| 'let'
		| 'const'
		| 'function'
		| 'import'
		| 'param'
		| 'rest_param'
		| 'synthetic';

	interface Binding {
		node: Identifier;
		/**
		 * - `normal`: A variable that is not in any way special
		 * - `prop`: A normal prop (possibly reassigned or mutated)
		 * - `bindable_prop`: A prop one can `bind:` to (possibly reassigned or mutated)
		 * - `rest_prop`: A rest prop
		 * - `state`: A state variable
		 * - `derived`: A derived variable
		 * - `each`: An each block parameter
		 * - `snippet`: A snippet parameter
		 * - `store_sub`: A $store value
		 * - `legacy_reactive`: A `$:` declaration
		 * - `template`: A binding declared in the template, e.g. in an `await` block or `const` tag
		 */
		kind:
			| 'normal'
			| 'prop'
			| 'bindable_prop'
			| 'rest_prop'
			| 'state'
			| 'raw_state'
			| 'derived'
			| 'each'
			| 'snippet'
			| 'store_sub'
			| 'legacy_reactive'
			| 'template';
		declaration_kind: DeclarationKind;
		/**
		 * What the value was initialized with.
		 * For destructured props such as `let { foo = 'bar' } = $props()` this is `'bar'` and not `$props()`
		 */
		initial:
			| null
			| Expression
			| FunctionDeclaration
			| ClassDeclaration
			| ImportDeclaration
			| EachBlock;
		is_called: boolean;
		references: { node: Identifier; path: SvelteNode[] }[];
		mutated: boolean;
		reassigned: boolean;
		/** `true` if mutated _or_ reassigned */
		updated: boolean;
		scope: Scope;
		/** For `legacy_reactive`: its reactive dependencies */
		legacy_dependencies: Binding[];
		/** Legacy props: the `class` in `{ export klass as class}`. $props(): The `class` in { class: klass } = $props() */
		prop_alias: string | null;
		/** Additional metadata, varies per binding type */
		metadata: {
			/** `true` if is (inside) a rest parameter */
			inside_rest?: boolean;
		} | null;
	}

	interface ExpressionMetadata {
		/** All the bindings that are referenced inside this expression */
		dependencies: Set<Binding>;
		/** True if the expression references state directly, or _might_ (via member/call expressions) */
		has_state: boolean;
		/** True if the expression involves a call expression (often, it will need to be wrapped in a derived) */
		has_call: boolean;
	}
	/**
	 * The preprocess function provides convenient hooks for arbitrarily transforming component source code.
	 * For example, it can be used to convert a <style lang="sass"> block into vanilla CSS.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-preprocess
	 * */
	export function preprocess(source: string, preprocessor: PreprocessorGroup | PreprocessorGroup[], options?: {
		filename?: string;
	} | undefined): Promise<Processed>;
	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * */
	export const VERSION: string;
	/**
	 * Does a best-effort migration of Svelte code towards using runes, event attributes and render tags.
	 * May throw an error if the code is too complex to migrate automatically.
	 *
	 * */
	export function migrate(source: string): {
		code: string;
	};
	interface BaseNode_1 {
		type: string;
		start: number;
		end: number;
	}

	interface BaseElement_1 extends BaseNode_1 {
		name: string;
		attributes: Array<LegacyAttributeLike>;
		children: Array<LegacyElementLike>;
	}

	interface LegacyRoot extends BaseNode_1 {
		html: LegacySvelteNode;
		css?: any;
		instance?: any;
		module?: any;
	}

	interface LegacyAction extends BaseNode_1 {
		type: 'Action';
		/** The 'x' in `use:x` */
		name: string;
		/** The 'y' in `use:x={y}` */
		expression: null | Expression;
	}

	interface LegacyAnimation extends BaseNode_1 {
		type: 'Animation';
		/** The 'x' in `animate:x` */
		name: string;
		/** The y in `animate:x={y}` */
		expression: null | Expression;
	}

	interface LegacyBinding extends BaseNode_1 {
		type: 'Binding';
		/** The 'x' in `bind:x` */
		name: string;
		/** The y in `bind:x={y}` */
		expression: Identifier | MemberExpression;
	}

	interface LegacyBody extends BaseElement_1 {
		type: 'Body';
		name: 'svelte:body';
	}

	interface LegacyAttribute extends BaseNode_1 {
		type: 'Attribute';
		name: string;
		value: true | Array<Text | LegacyMustacheTag | LegacyAttributeShorthand>;
	}

	interface LegacyAttributeShorthand extends BaseNode_1 {
		type: 'AttributeShorthand';
		expression: Expression;
	}

	interface LegacyLet extends BaseNode_1 {
		type: 'Let';
		/** The 'x' in `let:x` */
		name: string;
		/** The 'y' in `let:x={y}` */
		expression: null | Identifier | ArrayExpression | ObjectExpression;
	}

	interface LegacyCatchBlock extends BaseNode_1 {
		type: 'CatchBlock';
		children: LegacySvelteNode[];
		skip: boolean;
	}

	interface LegacyClass extends BaseNode_1 {
		type: 'Class';
		/** The 'x' in `class:x` */
		name: 'class';
		/** The 'y' in `class:x={y}`, or the `x` in `class:x` */
		expression: Expression;
	}

	interface LegacyDocument extends BaseElement_1 {
		type: 'Document';
	}

	interface LegacyElement {
		type: 'Element';
	}

	interface LegacyEventHandler extends BaseNode_1 {
		type: 'EventHandler';
		/** The 'x' in `on:x` */
		name: string;
		/** The 'y' in `on:x={y}` */
		expression: null | Expression;
		modifiers: string[];
	}

	interface LegacyHead extends BaseElement_1 {
		type: 'Head';
	}

	interface LegacyInlineComponent extends BaseElement_1 {
		type: 'InlineComponent';
		/** Set if this is a `<svelte:component>` */
		expression?: Expression;
	}

	interface LegacyMustacheTag extends BaseNode_1 {
		type: 'MustacheTag';
		expression: Expression;
	}

	interface LegacyOptions {
		type: 'Options';
		name: 'svelte:options';
		attributes: Array<any>;
	}

	interface LegacyPendingBlock extends BaseNode_1 {
		type: 'PendingBlock';
		children: LegacySvelteNode[];
		skip: boolean;
	}

	interface LegacyRawMustacheTag extends BaseNode_1 {
		type: 'RawMustacheTag';
		expression: Expression;
	}

	interface LegacySpread extends BaseNode_1 {
		type: 'Spread';
		expression: Expression;
	}

	interface LegacySlot extends BaseElement_1 {
		type: 'Slot';
	}

	interface LegacySlotTemplate extends BaseElement_1 {
		type: 'SlotTemplate';
	}

	interface LegacyThenBlock extends BaseNode_1 {
		type: 'ThenBlock';
		children: LegacySvelteNode[];
		skip: boolean;
	}

	interface LegacyTitle extends BaseElement_1 {
		type: 'Title';
		name: 'title';
	}

	interface LegacyConstTag extends BaseNode_1 {
		type: 'ConstTag';
		expression: AssignmentExpression;
	}

	interface LegacyTransition extends BaseNode_1 {
		type: 'Transition';
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

	/** A `style:` directive */
	interface LegacyStyleDirective extends BaseNode_1 {
		type: 'StyleDirective';
		/** The 'x' in `style:x` */
		name: string;
		/** The 'y' in `style:x={y}` */
		value: true | Array<ExpressionTag | Text>;
		modifiers: Array<'important'>;
	}

	interface LegacyWindow extends BaseElement_1 {
		type: 'Window';
	}

	interface LegacyComment extends BaseNode_1 {
		type: 'Comment';
		/** the contents of the comment */
		data: string;
		/** any svelte-ignore directives — <!-- svelte-ignore a b c --> would result in ['a', 'b', 'c'] */
		ignores: string[];
	}

	type LegacyDirective =
		| LegacyAnimation
		| LegacyBinding
		| LegacyClass
		| LegacyLet
		| LegacyEventHandler
		| LegacyStyleDirective
		| LegacyTransition
		| LegacyAction;

	type LegacyAttributeLike = LegacyAttribute | LegacySpread | LegacyDirective;

	type LegacyElementLike =
		| LegacyBody
		| LegacyCatchBlock
		| LegacyComment
		| LegacyDocument
		| LegacyElement
		| LegacyHead
		| LegacyInlineComponent
		| LegacyMustacheTag
		| LegacyOptions
		| LegacyPendingBlock
		| LegacyRawMustacheTag
		| LegacySlot
		| LegacySlotTemplate
		| LegacyThenBlock
		| LegacyTitle
		| LegacyWindow;

	interface LegacyStyle extends BaseNode_1 {
		type: 'Style';
		attributes: any[];
		content: {
			start: number;
			end: number;
			styles: string;
		};
		children: any[];
	}

	interface LegacySelector extends BaseNode_1 {
		type: 'Selector';
		children: Array<Css.Combinator | Css.SimpleSelector>;
	}

	type LegacyCssNode = LegacyStyle | LegacySelector;

	type LegacySvelteNode =
		| LegacyConstTag
		| LegacyElementLike
		| LegacyAttributeLike
		| LegacyAttributeShorthand
		| LegacyCssNode
		| Text;
	class Scope {
		
		constructor(root: ScopeRoot, parent: Scope | null, porous: boolean);
		
		root: ScopeRoot;
		/**
		 * The immediate parent scope
		 * */
		parent: Scope | null;
		/**
		 * A map of every identifier declared by this scope, and all the
		 * identifiers that reference it
		 * */
		declarations: Map<string, Binding>;
		/**
		 * A map of declarators to the bindings they declare
		 * */
		declarators: Map<VariableDeclarator | LetDirective, Binding[]>;
		/**
		 * A set of all the names referenced with this scope
		 * — useful for generating unique names
		 * */
		references: Map<string, {
			node: Identifier;
			path: SvelteNode[];
		}[]>;
		/**
		 * The scope depth allows us to determine if a state variable is referenced in its own scope,
		 * which is usually an error. Block statements do not increase this value
		 */
		function_depth: number;
		
		declare(node: Identifier, kind: Binding["kind"], declaration_kind: DeclarationKind, initial?: null | Expression | FunctionDeclaration | ClassDeclaration | ImportDeclaration | EachBlock): Binding;
		child(porous?: boolean): Scope;
		
		generate(preferred_name: string): string;
		
		get(name: string): Binding | null;
		
		get_bindings(node: VariableDeclarator | LetDirective): Binding[];
		
		owner(name: string): Scope | null;
		
		reference(node: Identifier, path: SvelteNode[]): void;
		#private;
	}
	class ScopeRoot {
		
		conflicts: Set<string>;
		
		unique(preferred_name: string): Identifier;
	}
	namespace Css {
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
				comment: Comment | null;
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
			metadata: {
				parent_rule: null | Rule;
				has_local_selectors: boolean;
				/**
				 * `true` if the rule contains a `:global` selector, and therefore everything inside should be unscoped
				 */
				is_global_block: boolean;
			};
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
			metadata: {
				rule: null | Rule;
				used: boolean;
			};
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
			metadata: {
				/**
				 * `true` if the whole selector is unscoped, e.g. `:global(...)` or `:global` or `:global.x`.
				 * Selectors like `:global(...).x` are not considered global, because they still need scoping.
				 */
				is_global: boolean;
				/** `:root`, `:host`, `::view-transition`, or selectors after a `:global` */
				is_global_like: boolean;
				scoped: boolean;
			};
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
	interface BaseNode {
		type: string;
		start: number;
		end: number;
		/** This is set during parsing on elements/components/expressions/text (but not attributes etc) */
		parent: SvelteNode | null;
	}

	interface Fragment {
		type: 'Fragment';
		nodes: Array<Text | Tag | ElementLike | Block | Comment>;
		metadata: {
			/**
			 * Fragments declare their own scopes. A transparent fragment is one whose scope
			 * is not represented by a scope in the resulting JavaScript (e.g. an element scope),
			 * and should therefore delegate to parent scopes when generating unique identifiers
			 */
			transparent: boolean;
			/**
			 * Whether or not we need to traverse into the fragment during mount/hydrate
			 */
			dynamic: boolean;
		};
	}

	/**
	 * - `html`    — the default, for e.g. `<div>` or `<span>`
	 * - `svg`     — for e.g. `<svg>` or `<g>`
	 * - `mathml`  — for e.g. `<math>` or `<mrow>`
	 */
	type Namespace = 'html' | 'svg' | 'mathml';

	interface Root extends BaseNode {
		type: 'Root';
		/**
		 * Inline options provided by `<svelte:options>` — these override options passed to `compile(...)`
		 */
		options: SvelteOptions | null;
		fragment: Fragment;
		/** The parsed `<style>` element, if exists */
		css: Css.StyleSheet | null;
		/** The parsed `<script>` element, if exists */
		instance: Script | null;
		/** The parsed `<script module>` element, if exists */
		module: Script | null;
		metadata: {
			/** Whether the component was parsed with typescript */
			ts: boolean;
		};
	}

	interface SvelteOptions {
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
			shadow?: 'open' | 'none';
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
	interface Text extends BaseNode {
		type: 'Text';
		/** Text with decoded HTML entities */
		data: string;
		/** The original text, with undecoded HTML entities */
		raw: string;
	}

	/** A (possibly reactive) template expression — `{...}` */
	interface ExpressionTag extends BaseNode {
		type: 'ExpressionTag';
		expression: Expression;
		metadata: {
			expression: ExpressionMetadata;
		};
	}

	/** A (possibly reactive) HTML template expression — `{@html ...}` */
	interface HtmlTag extends BaseNode {
		type: 'HtmlTag';
		expression: Expression;
	}

	/** An HTML comment */
	// TODO rename to disambiguate
	interface Comment extends BaseNode {
		type: 'Comment';
		/** the contents of the comment */
		data: string;
	}

	/** A `{@const ...}` tag */
	interface ConstTag extends BaseNode {
		type: 'ConstTag';
		declaration: VariableDeclaration & {
			declarations: [VariableDeclarator & { id: Pattern; init: Expression }];
		};
	}

	/** A `{@debug ...}` tag */
	interface DebugTag extends BaseNode {
		type: 'DebugTag';
		identifiers: Identifier[];
	}

	/** A `{@render foo(...)} tag */
	interface RenderTag extends BaseNode {
		type: 'RenderTag';
		expression: SimpleCallExpression | (ChainExpression & { expression: SimpleCallExpression });
		metadata: {
			dynamic: boolean;
			args_with_call_expression: Set<number>;
		};
	}

	type Tag = ExpressionTag | HtmlTag | ConstTag | DebugTag | RenderTag;

	/** An `animate:` directive */
	interface AnimateDirective extends BaseNode {
		type: 'AnimateDirective';
		/** The 'x' in `animate:x` */
		name: string;
		/** The y in `animate:x={y}` */
		expression: null | Expression;
	}

	/** A `bind:` directive */
	interface BindDirective extends BaseNode {
		type: 'BindDirective';
		/** The 'x' in `bind:x` */
		name: string;
		/** The y in `bind:x={y}` */
		expression: Identifier | MemberExpression;
		metadata: {
			binding_group_name: Identifier;
			parent_each_blocks: EachBlock[];
		};
	}

	/** A `class:` directive */
	interface ClassDirective extends BaseNode {
		type: 'ClassDirective';
		/** The 'x' in `class:x` */
		name: 'class';
		/** The 'y' in `class:x={y}`, or the `x` in `class:x` */
		expression: Expression;
		metadata: {
			expression: ExpressionMetadata;
		};
	}

	/** A `let:` directive */
	interface LetDirective extends BaseNode {
		type: 'LetDirective';
		/** The 'x' in `let:x` */
		name: string;
		/** The 'y' in `let:x={y}` */
		expression: null | Identifier | ArrayExpression | ObjectExpression;
	}

	/** An `on:` directive */
	interface OnDirective extends BaseNode {
		type: 'OnDirective';
		/** The 'x' in `on:x` */
		name: string;
		/** The 'y' in `on:x={y}` */
		expression: null | Expression;
		modifiers: string[]; // TODO specify
		metadata: {
			expression: ExpressionMetadata;
		};
	}

	type DelegatedEvent =
		| {
				hoisted: true;
				function: ArrowFunctionExpression | FunctionExpression | FunctionDeclaration;
		  }
		| { hoisted: false };

	/** A `style:` directive */
	interface StyleDirective extends BaseNode {
		type: 'StyleDirective';
		/** The 'x' in `style:x` */
		name: string;
		/** The 'y' in `style:x={y}` */
		value: true | ExpressionTag | Array<ExpressionTag | Text>;
		modifiers: Array<'important'>;
		metadata: {
			expression: ExpressionMetadata;
		};
	}

	// TODO have separate in/out/transition directives
	/** A `transition:`, `in:` or `out:` directive */
	interface TransitionDirective extends BaseNode {
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
	interface UseDirective extends BaseNode {
		type: 'UseDirective';
		/** The 'x' in `use:x` */
		name: string;
		/** The 'y' in `use:x={y}` */
		expression: null | Expression;
	}

	type Directive =
		| AnimateDirective
		| BindDirective
		| ClassDirective
		| LetDirective
		| OnDirective
		| StyleDirective
		| TransitionDirective
		| UseDirective;

	interface BaseElement extends BaseNode {
		name: string;
		attributes: Array<Attribute | SpreadAttribute | Directive>;
		fragment: Fragment;
	}

	interface Component extends BaseElement {
		type: 'Component';
		metadata: {
			scopes: Record<string, Scope>;
			dynamic: boolean;
		};
	}

	interface TitleElement extends BaseElement {
		type: 'TitleElement';
		name: 'title';
	}

	interface SlotElement extends BaseElement {
		type: 'SlotElement';
		name: 'slot';
	}

	interface RegularElement extends BaseElement {
		type: 'RegularElement';
		metadata: {
			/** `true` if this is an svg element */
			svg: boolean;
			/** `true` if this is a mathml element */
			mathml: boolean;
			/** `true` if contains a SpreadAttribute */
			has_spread: boolean;
			scoped: boolean;
		};
	}

	interface SvelteBody extends BaseElement {
		type: 'SvelteBody';
		name: 'svelte:body';
	}

	interface SvelteComponent extends BaseElement {
		type: 'SvelteComponent';
		name: 'svelte:component';
		expression: Expression;
		metadata: {
			scopes: Record<string, Scope>;
		};
	}

	interface SvelteDocument extends BaseElement {
		type: 'SvelteDocument';
		name: 'svelte:document';
	}

	interface SvelteElement extends BaseElement {
		type: 'SvelteElement';
		name: 'svelte:element';
		tag: Expression;
		metadata: {
			/**
			 * `true` if this is an svg element. The boolean may not be accurate because
			 * the tag is dynamic, but we do our best to infer it from the template.
			 */
			svg: boolean;
			/**
			 * `true` if this is a mathml element. The boolean may not be accurate because
			 * the tag is dynamic, but we do our best to infer it from the template.
			 */
			mathml: boolean;
			scoped: boolean;
		};
	}

	interface SvelteFragment extends BaseElement {
		type: 'SvelteFragment';
		name: 'svelte:fragment';
	}

	interface SvelteHead extends BaseElement {
		type: 'SvelteHead';
		name: 'svelte:head';
	}

	/** This is only an intermediate representation while parsing, it doesn't exist in the final AST */
	interface SvelteOptionsRaw extends BaseElement {
		type: 'SvelteOptions';
		name: 'svelte:options';
	}

	interface SvelteSelf extends BaseElement {
		type: 'SvelteSelf';
		name: 'svelte:self';
		metadata: {
			scopes: Record<string, Scope>;
		};
	}

	interface SvelteWindow extends BaseElement {
		type: 'SvelteWindow';
		name: 'svelte:window';
	}

	type ElementLike =
		| Component
		| TitleElement
		| SlotElement
		| RegularElement
		| SvelteBody
		| SvelteComponent
		| SvelteDocument
		| SvelteElement
		| SvelteFragment
		| SvelteHead
		| SvelteOptionsRaw
		| SvelteSelf
		| SvelteWindow;

	/** An `{#each ...}` block */
	interface EachBlock extends BaseNode {
		type: 'EachBlock';
		expression: Expression;
		context: Pattern;
		body: Fragment;
		fallback?: Fragment;
		index?: string;
		key?: Expression;
		metadata: {
			expression: ExpressionMetadata;
			keyed: boolean;
			contains_group_binding: boolean;
			/** Set if something in the array expression is shadowed within the each block */
			array_name: Identifier | null;
			index: Identifier;
			item: Identifier;
			declarations: Map<string, Binding>;
			/**
			 * Optimization path for each blocks: If the parent isn't a fragment and
			 * it only has a single child, then we can classify the block as being "controlled".
			 * This saves us from creating an extra comment and insertion being faster.
			 */
			is_controlled: boolean;
		};
	}

	/** An `{#if ...}` block */
	interface IfBlock extends BaseNode {
		type: 'IfBlock';
		elseif: boolean;
		test: Expression;
		consequent: Fragment;
		alternate: Fragment | null;
	}

	/** An `{#await ...}` block */
	interface AwaitBlock extends BaseNode {
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

	interface KeyBlock extends BaseNode {
		type: 'KeyBlock';
		expression: Expression;
		fragment: Fragment;
	}

	interface SnippetBlock extends BaseNode {
		type: 'SnippetBlock';
		expression: Identifier;
		parameters: Pattern[];
		body: Fragment;
	}

	type Block = EachBlock | IfBlock | AwaitBlock | KeyBlock | SnippetBlock;

	interface Attribute extends BaseNode {
		type: 'Attribute';
		name: string;
		value: true | ExpressionTag | Array<Text | ExpressionTag>;
		metadata: {
			expression: ExpressionMetadata;
			/** May be set if this is an event attribute */
			delegated: null | DelegatedEvent;
		};
	}

	interface SpreadAttribute extends BaseNode {
		type: 'SpreadAttribute';
		expression: Expression;
		metadata: {
			expression: ExpressionMetadata;
		};
	}

	type TemplateNode =
		| Root
		| Text
		| Tag
		| ElementLike
		| Attribute
		| SpreadAttribute
		| Directive
		| Comment
		| Block;

	type SvelteNode = Node | TemplateNode | Fragment | Css.Node;

	interface Script extends BaseNode {
		type: 'Script';
		context: 'default' | 'module';
		content: Program;
		attributes: Attribute[];
	}
	type ICompileDiagnostic = {
		code: string;
		message: string;
		filename?: string;
		start?: Location;
		end?: Location;
		position?: [number, number];
		frame?: string;
	};

	export {};
}

declare module 'svelte/easing' {
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function linear(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function backInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function backIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function backOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function bounceOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function bounceInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function bounceIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function circInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function circIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function circOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function cubicInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function cubicIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function cubicOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function elasticInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function elasticIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function elasticOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function expoInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function expoIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function expoOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quadInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quadIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quadOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quartInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quartIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quartOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quintInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quintIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function quintOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function sineInOut(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
	export function sineIn(t: number): number;
	/**
	 * https://svelte.dev/docs/svelte-easing
	 * */
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

	export {};
}

declare module 'svelte/motion' {
	export interface Spring<T> extends Readable<T> {
		set: (new_value: T, opts?: SpringUpdateOpts) => Promise<void>;
		update: (fn: Updater<T>, opts?: SpringUpdateOpts) => Promise<void>;
		precision: number;
		damping: number;
		stiffness: number;
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
		hard?: any;
		soft?: string | number | boolean;
	}

	type Updater<T> = (target_value: T, value: T) => T;

	interface TweenedOptions<T> {
		delay?: number;
		duration?: number | ((from: T, to: T) => number);
		easing?: (t: number) => number;
		interpolate?: (a: T, b: T) => (t: number) => T;
	}
	/**
	 * The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.
	 *
	 * https://svelte.dev/docs/svelte-motion#spring
	 * */
	export function spring<T = any>(value?: T | undefined, opts?: SpringOpts | undefined): Spring<T>;
	/**
	 * A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.
	 *
	 * https://svelte.dev/docs/svelte-motion#tweened
	 * */
	export function tweened<T>(value?: T | undefined, defaults?: TweenedOptions<T> | undefined): Tweened<T>;

	export {};
}

declare module 'svelte/reactivity' {
	/** @deprecated Use `SvelteDate` instead */
	function Date_1(): void;
	/** @deprecated Use `SvelteSet` instead */
	function Set_1(): void;
	/** @deprecated Use `SvelteMap` instead */
	function Map_1(): void;
	/** @deprecated Use `SvelteURL` instead */
	function URL_1(): void;
	/** @deprecated Use `SvelteURLSearchParams` instead */
	function URLSearchParams_1(): void;
	export class SvelteDate extends Date {
		
		constructor(...params: any[]);
		#private;
	}
	export class SvelteSet<T> extends Set<T> {
		
		constructor(value?: Iterable<T> | null | undefined);
		
		add(value: T): this;
		#private;
	}
	export class SvelteMap<K, V> extends Map<K, V> {
		
		constructor(value?: Iterable<readonly [K, V]> | null | undefined);
		
		set(key: K, value: V): this;
		#private;
	}
	export class SvelteURL extends URL {
		get searchParams(): SvelteURLSearchParams;
		#private;
	}
	const REPLACE: unique symbol;
	export class SvelteURLSearchParams extends URLSearchParams {
		
		[REPLACE](params: URLSearchParams): void;
		#private;
	}

	export { Date_1 as Date, Set_1 as Set, Map_1 as Map, URL_1 as URL, URLSearchParams_1 as URLSearchParams };
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
					options?: { props?: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any> }
				]
			: [
					component: Comp extends SvelteComponent<any> ? ComponentType<Comp> : Comp,
					options: { props: Omit<Props, '$$slots' | '$$events'>; context?: Map<any, any> }
				]
	): RenderOutput;
	interface RenderOutput {
		/** HTML that goes into the `<head>` */
		head: string;
		/** @deprecated use `body` instead */
		html: string;
		/** HTML that goes somewhere into the `<body>` */
		body: string;
	}

	export {};
}

declare module 'svelte/store' {
	/** Callback to inform of a value updates. */
	type Subscriber<T> = (value: T) => void;

	/** Unsubscribes from value updates. */
	type Unsubscriber = () => void;

	/** Callback to update a value. */
	type Updater<T> = (value: T) => T;

	/**
	 * Start and stop notification callbacks.
	 * This function is called when the first subscriber subscribes.
	 *
	 * @param set Function that sets the value of the store.
	 * @param update Function that sets the value of the store after passing the current value to the update function.
	 * @returns Optionally, a cleanup function that is called when the last remaining
	 * subscriber unsubscribes.
	 */
	type StartStopNotifier<T> = (
		set: (value: T) => void,
		update: (fn: Updater<T>) => void
	) => void | (() => void);

	/** Readable interface for subscribing. */
	interface Readable<T> {
		/**
		 * Subscribe on value changes.
		 * @param run subscription callback
		 * @param invalidate cleanup callback
		 */
		subscribe(this: void, run: Subscriber<T>, invalidate?: () => void): Unsubscriber;
	}

	/** Writable interface for both updating and subscribing. */
	interface Writable<T> extends Readable<T> {
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
	 * https://svelte.dev/docs/svelte-store#readable
	 * @param value initial value
	 * */
	export function readable<T>(value?: T | undefined, start?: StartStopNotifier<T> | undefined): Readable<T>;
	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @param value initial value
	 * */
	export function writable<T>(value?: T | undefined, start?: StartStopNotifier<T> | undefined): Writable<T>;
	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * */
	export function derived<S extends Stores, T>(stores: S, fn: (values: StoresValues<S>, set: (value: T) => void, update: (fn: Updater<T>) => void) => Unsubscriber | void, initial_value?: T | undefined): Readable<T>;
	/**
	 * Derived value store by synchronizing one or more readable stores and
	 * applying an aggregation function over its input values.
	 *
	 * https://svelte.dev/docs/svelte-store#derived
	 * */
	export function derived<S extends Stores, T>(stores: S, fn: (values: StoresValues<S>) => T, initial_value?: T | undefined): Readable<T>;
	/**
	 * Takes a store and returns a new one derived from the old one that is readable.
	 *
	 * https://svelte.dev/docs/svelte-store#readonly
	 * @param store  - store to make readonly
	 * */
	export function readonly<T>(store: Readable<T>): Readable<T>;
	/**
	 * Get the current value from a store by subscribing and immediately unsubscribing.
	 *
	 * https://svelte.dev/docs/svelte-store#get
	 * */
	export function get<T>(store: Readable<T>): T;
	/** One or more `Readable`s. */
	type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;

	/** One or more values from `Readable` stores. */
	type StoresValues<T> =
		T extends Readable<infer U> ? U : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

	export { Subscriber, Unsubscriber, Updater, StartStopNotifier, Readable, Writable };
}

declare module 'svelte/transition' {
	type EasingFunction = (t: number) => number;

	interface TransitionConfig {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		css?: (t: number, u: number) => string;
		tick?: (t: number, u: number) => void;
	}

	interface BlurParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		amount?: number | string;
		opacity?: number;
	}

	interface FadeParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
	}

	interface FlyParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		x?: number | string;
		y?: number | string;
		opacity?: number;
	}

	interface SlideParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		axis?: 'x' | 'y';
	}

	interface ScaleParams {
		delay?: number;
		duration?: number;
		easing?: EasingFunction;
		start?: number;
		opacity?: number;
	}

	interface DrawParams {
		delay?: number;
		speed?: number;
		duration?: number | ((len: number) => number);
		easing?: EasingFunction;
	}

	interface CrossfadeParams {
		delay?: number;
		duration?: number | ((len: number) => number);
		easing?: EasingFunction;
	}
	/**
	 * Animates a `blur` filter alongside an element's opacity.
	 *
	 * https://svelte.dev/docs/svelte-transition#blur
	 * */
	export function blur(node: Element, { delay, duration, easing, amount, opacity }?: BlurParams | undefined): TransitionConfig;
	/**
	 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
	 *
	 * https://svelte.dev/docs/svelte-transition#fade
	 * */
	export function fade(node: Element, { delay, duration, easing }?: FadeParams | undefined): TransitionConfig;
	/**
	 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
	 *
	 * https://svelte.dev/docs/svelte-transition#fly
	 * */
	export function fly(node: Element, { delay, duration, easing, x, y, opacity }?: FlyParams | undefined): TransitionConfig;
	/**
	 * Slides an element in and out.
	 *
	 * https://svelte.dev/docs/svelte-transition#slide
	 * */
	export function slide(node: Element, { delay, duration, easing, axis }?: SlideParams | undefined): TransitionConfig;
	/**
	 * Animates the opacity and scale of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.
	 *
	 * https://svelte.dev/docs/svelte-transition#scale
	 * */
	export function scale(node: Element, { delay, duration, easing, start, opacity }?: ScaleParams | undefined): TransitionConfig;
	/**
	 * Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.
	 *
	 * https://svelte.dev/docs/svelte-transition#draw
	 * */
	export function draw(node: SVGElement & {
		getTotalLength(): number;
	}, { delay, speed, duration, easing }?: DrawParams | undefined): TransitionConfig;
	/**
	 * The `crossfade` function creates a pair of [transitions](https://svelte.dev/docs#template-syntax-element-directives-transition-fn) called `send` and `receive`. When an element is 'sent', it looks for a corresponding element being 'received', and generates a transition that transforms the element to its counterpart's position and fades it out. When an element is 'received', the reverse happens. If there is no counterpart, the `fallback` transition is used.
	 *
	 * https://svelte.dev/docs/svelte-transition#crossfade
	 * */
	export function crossfade({ fallback, ...defaults }: CrossfadeParams & {
		fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
	}): [(node: any, params: CrossfadeParams & {
		key: any;
	}) => () => TransitionConfig, (node: any, params: CrossfadeParams & {
		key: any;
	}) => () => TransitionConfig];

	export { EasingFunction, TransitionConfig, BlurParams, FadeParams, FlyParams, SlideParams, ScaleParams, DrawParams, CrossfadeParams };
}

declare module 'svelte/events' {
	/**
	 * Attaches an event handler to an element and returns a function that removes the handler. Using this
	 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
	 * (with attributes like `onclick`), which use event delegation for performance reasons
	 *
	 * */
	export function on<Element extends HTMLElement, Type extends keyof HTMLElementEventMap>(element: Element, type: Type, handler: (this: Element, event: HTMLElementEventMap[Type]) => any, options?: AddEventListenerOptions | undefined): () => void;
	/**
	 * Attaches an event handler to an element and returns a function that removes the handler. Using this
	 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
	 * (with attributes like `onclick`), which use event delegation for performance reasons
	 *
	 * */
	export function on(element: EventTarget, type: string, handler: EventListener, options?: AddEventListenerOptions | undefined): () => void;

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
		 * It defaults to returning `svelte-${hash(css)}`.
		 *
		 * @default undefined
		 */
		cssHash?: CssHashGetter;
		/**
		 * If `true`, your HTML comments will be preserved during server-side rendering. By default, they are stripped out.
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
	import { SvelteComponent, Component, type ComponentConstructorOptions } from 'svelte'

	// Support using the component as both a class and function during the transition period
	// prettier-ignore
	interface ComponentType {
		(
			...args: Parameters<Component<Record<string, any>>>
		): ReturnType<Component<Record<string, any>, Record<string, any>>>
		new (o: ComponentConstructorOptions): SvelteComponent
	}
	const Comp: ComponentType;
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
 * https://svelte-5-preview.vercel.app/docs/runes#$state
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

	/** The things that `structuredClone` can handle — https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm */
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
				: T extends Array<infer U>
					? Array<Snapshot<U>>
					: T extends object
						? T extends { [key: string]: any }
							? { [K in keyof T]: Snapshot<T[K]> }
							: never
						: never;

	/**
	 * Declares state that is _not_ made deeply reactive — instead of mutating it,
	 * you must reassign it.
	 *
	 * Example:
	 * ```ts
	 * <script>
	 *   let items = $state.raw([0]);
	 *
	 *   const addItem = () => {
	 *     items = [...items, items.length];
	 *   };
	 * </script>
	 *
	 * <button on:click={addItem}>
	 *   {items.join(', ')}
	 * </button>
	 * ```
	 *
	 * https://svelte-5-preview.vercel.app/docs/runes#$state-raw
	 *
	 * @param initial The initial value
	 */
	export function raw<T>(initial: T): T;
	export function raw<T>(): T | undefined;
	/**
	 * To take a static snapshot of a deeply reactive `$state` proxy, use `$state.snapshot`:
	 *
	 * Example:
	 * ```ts
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
	 * https://svelte-5-preview.vercel.app/docs/runes#$state.snapshot
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
 * https://svelte-5-preview.vercel.app/docs/runes#$derived
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
	 * https://svelte-5-preview.vercel.app/docs/runes#$derived-by
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
 * Does not run during server side rendering.
 *
 * https://svelte-5-preview.vercel.app/docs/runes#$effect
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
	 * Does not run during server side rendering.
	 *
	 * https://svelte-5-preview.vercel.app/docs/runes#$effect-pre
	 * @param fn The function to execute
	 */
	export function pre(fn: () => void | (() => void)): void;

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
	 * https://svelte-5-preview.vercel.app/docs/runes#$effect-tracking
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
	 *	    $effect(() => {
	 *				console.log(count);
	 *			})
	 *
	 *      return () => {
	 *        console.log('effect root cleanup');
	 * 			}
	 *   });
	 * </script>
	 *
	 * <button onclick={() => cleanup()}>cleanup</button>
	 * ```
	 *
	 * https://svelte-5-preview.vercel.app/docs/runes#$effect-root
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
}

/**
 * Declares the props that a component accepts. Example:
 *
 * ```ts
 * let { optionalProp = 42, requiredProp, bindableProp = $bindable() }: { optionalProp?: number; requiredProps: string; bindableProp: boolean } = $props();
 * ```
 *
 * https://svelte-5-preview.vercel.app/docs/runes#$props
 */
declare function $props(): any;

/**
 * Declares a prop as bindable, meaning the parent component can use `bind:propName={value}` to bind to it.
 *
 * ```ts
 * let { propName = $bindable() }: { propName: boolean } = $props();
 * ```
 *
 * https://svelte-5-preview.vercel.app/docs/runes#$bindable
 */
declare function $bindable<T>(fallback?: T): T;

/**
 * Inspects one or more values whenever they, or the properties they contain, change. Example:
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
 * https://svelte-5-preview.vercel.app/docs/runes#$inspect
 */
declare function $inspect<T extends any[]>(
	...values: T
): { with: (fn: (type: 'init' | 'update', ...values: T) => void) => void };

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
 * https://svelte-5-preview.vercel.app/docs/runes#$host
 */
declare function $host<El extends HTMLElement = HTMLElement>(): El;

//# sourceMappingURL=index.d.ts.map