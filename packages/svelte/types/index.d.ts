declare module 'svelte' {
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
	export type ComponentEvents<Component extends SvelteComponent_1> =
		Component extends SvelteComponent<any, infer Events> ? Events : never;

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
	export type ComponentProps<Component extends SvelteComponent_1> =
		Component extends SvelteComponent<infer Props> ? Props : never;

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
	export type ComponentType<Component extends SvelteComponent = SvelteComponent> = (new (
		options: ComponentConstructorOptions<
			Component extends SvelteComponent<infer Props> ? Props : Record<string, any>
		>
	) => Component) & {
		/** The custom element version of the component. Only present if compiled with the `customElement` compiler option */
		element?: typeof HTMLElement;
	};

	interface DispatchOptions {
		cancelable?: boolean;
	}

	interface EventDispatcher<EventMap extends Record<string, any>> {
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
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * 
	 */
	class SvelteComponent_1<Props extends Record<string, any> = any, Events extends Record<string, any> = any> {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * */
		$$: any;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * */
		$$set: any;
		
		$destroy(): void;
		
		$on<K extends Extract<keyof Events, string>>(type: K, callback: ((e: Events[K]) => void) | null | undefined): () => void;
		
		$set(props: Partial<Props>): void;
	}
	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
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
	 */
	export class SvelteComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any> extends SvelteComponent_1<Props, Events> { [prop: string]: any;
		
		constructor(options: ComponentConstructorOptions<Props>);
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
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
		
		$capture_state(): void;
		
		$inject_state(): void;
	}
	/**
	 * @deprecated Use `SvelteComponent` instead. See PR for more information: https://github.com/sveltejs/svelte/pull/8512
	 * 
	 */
	export class SvelteComponentTyped<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any> extends SvelteComponent<Props, Events, Slots> {
	}
	/**
	 * Schedules a callback to run immediately before the component is updated after any state change.
	 *
	 * The first time the callback runs will be before the initial `onMount`
	 *
	 * https://svelte.dev/docs/svelte#beforeupdate
	 * */
	export function beforeUpdate(fn: () => any): void;
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
	 * Schedules a callback to run immediately after the component has been updated.
	 *
	 * The first time the callback runs will be after the initial `onMount`
	 *
	 * https://svelte.dev/docs/svelte#afterupdate
	 * */
	export function afterUpdate(fn: () => any): void;
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
	 * */
	export function createEventDispatcher<EventMap extends Record<string, any> = any>(): EventDispatcher<EventMap>;
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
	 * Retrieves the context that belongs to the closest parent component with the specified `key`.
	 * Must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#getcontext
	 * */
	export function getContext<T>(key: any): T;
	/**
	 * Retrieves the whole context map that belongs to the closest parent component.
	 * Must be called during component initialisation. Useful, for example, if you
	 * programmatically create a component and want to pass the existing context to it.
	 *
	 * https://svelte.dev/docs/svelte#getallcontexts
	 * */
	export function getAllContexts<T extends Map<any, any> = Map<any, any>>(): T;
	/**
	 * Checks whether a given `key` has been set in the context of a parent component.
	 * Must be called during component initialisation.
	 *
	 * https://svelte.dev/docs/svelte#hascontext
	 * */
	export function hasContext(key: any): boolean;
	export function tick(): Promise<void>;
	/**
	 * Anything except a function
	 */
	type NotFunction<T> = T extends Function ? never : T;
}

declare module 'svelte/compiler' {
	import type { AssignmentExpression, Node, Program } from 'estree';
	import type { SourceMap } from 'magic-string';
	export { walk } from 'estree-walker';
	interface BaseNode {
		start: number;
		end: number;
		type: string;
		children?: TemplateNode[];
		[prop_name: string]: any;
	}

	interface Text extends BaseNode {
		type: 'Text';
		data: string;
	}

	interface MustacheTag extends BaseNode {
		type: 'MustacheTag' | 'RawMustacheTag';
		expression: Node;
	}

	interface Comment extends BaseNode {
		type: 'Comment';
		data: string;
		ignores: string[];
	}

	interface ConstTag extends BaseNode {
		type: 'ConstTag';
		expression: AssignmentExpression;
	}

	interface DebugTag extends BaseNode {
		type: 'DebugTag';
		identifiers: Node[];
	}

	type DirectiveType =
		| 'Action'
		| 'Animation'
		| 'Binding'
		| 'Class'
		| 'StyleDirective'
		| 'EventHandler'
		| 'Let'
		| 'Ref'
		| 'Transition';

	interface BaseDirective extends BaseNode {
		type: DirectiveType;
		name: string;
	}

	interface BaseExpressionDirective extends BaseDirective {
		type: DirectiveType;
		expression: null | Node;
		name: string;
		modifiers: string[];
	}

	interface Element extends BaseNode {
		type:
			| 'InlineComponent'
			| 'SlotTemplate'
			| 'Title'
			| 'Slot'
			| 'Element'
			| 'Head'
			| 'Options'
			| 'Window'
			| 'Document'
			| 'Body';
		attributes: Array<BaseDirective | Attribute | SpreadAttribute>;
		name: string;
	}

	interface Attribute extends BaseNode {
		type: 'Attribute';
		name: string;
		value: any[];
	}

	interface SpreadAttribute extends BaseNode {
		type: 'Spread';
		expression: Node;
	}

	interface Transition extends BaseExpressionDirective {
		type: 'Transition';
		intro: boolean;
		outro: boolean;
	}

	type Directive = BaseDirective | BaseExpressionDirective | Transition;

	type TemplateNode =
		| Text
		| ConstTag
		| DebugTag
		| MustacheTag
		| BaseNode
		| Element
		| Attribute
		| SpreadAttribute
		| Directive
		| Transition
		| Comment;

	interface Script extends BaseNode {
		type: 'Script';
		context: string;
		content: Program;
	}

	interface Style extends BaseNode {
		type: 'Style';
		attributes: any[]; // TODO
		children: any[]; // TODO add CSS node types
		content: {
			start: number;
			end: number;
			styles: string;
		};
	}

	interface Ast {
		html: TemplateNode;
		css?: Style;
		instance?: Script;
		module?: Script;
	}

	interface Warning {
		start?: { line: number; column: number; pos?: number };
		end?: { line: number; column: number };
		pos?: number;
		code: string;
		message: string;
		filename?: string;
		frame?: string;
		toString: () => string;
	}

	export type EnableSourcemap = boolean | { js: boolean; css: boolean };

	export type CssHashGetter = (args: {
		name: string;
		filename: string | undefined;
		css: string;
		hash: (input: string) => string;
	}) => string;

	export interface CompileOptions {
		/**
		 * Sets the name of the resulting JavaScript class (though the compiler will rename it if it would otherwise conflict with other variables in scope).
		 * It will normally be inferred from `filename`
		 *
		 * @default 'Component'
		 */
		name?: string;

		/**
		 * Used for debugging hints and sourcemaps. Your bundler plugin will set it automatically.
		 *
		 * @default null
		 */
		filename?: string;

		/**
		 * If `"dom"`, Svelte emits a JavaScript class for mounting to the DOM.
		 * If `"ssr"`, Svelte emits an object with a `render` method suitable for server-side rendering.
		 * If `false`, no JavaScript or CSS is returned; just metadata.
		 *
		 * @default 'dom'
		 */
		generate?: 'dom' | 'ssr' | false;

		/**
		 * If `"throw"`, Svelte throws when a compilation error occurred.
		 * If `"warn"`, Svelte will treat errors as warnings and add them to the warning report.
		 *
		 * @default 'throw'
		 */
		errorMode?: 'throw' | 'warn';

		/**
		 * If `"strict"`, Svelte returns a variables report with only variables that are not globals nor internals.
		 * If `"full"`, Svelte returns a variables report with all detected variables.
		 * If `false`, no variables report is returned.
		 *
		 * @default 'strict'
		 */
		varsReport?: 'full' | 'strict' | false;

		/**
		 * An initial sourcemap that will be merged into the final output sourcemap.
		 * This is usually the preprocessor sourcemap.
		 *
		 * @default null
		 */
		sourcemap?: object | string;

		/**
		 * If `true`, Svelte generate sourcemaps for components.
		 * Use an object with `js` or `css` for more granular control of sourcemap generation.
		 *
		 * @default true
		 */
		enableSourcemap?: EnableSourcemap;

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
		 * The location of the `svelte` package.
		 * Any imports from `svelte` or `svelte/[module]` will be modified accordingly.
		 *
		 * @default 'svelte'
		 */
		sveltePath?: string;

		/**
		 * If `true`, causes extra code to be added to components that will perform runtime checks and provide debugging information during development.
		 *
		 * @default false
		 */
		dev?: boolean;

		/**
		 * If `true`, getters and setters will be created for the component's props. If `false`, they will only be created for readonly exported values (i.e. those declared with `const`, `class` and `function`). If compiling with `customElement: true` this option defaults to `true`.
		 *
		 * @default false
		 */
		accessors?: boolean;

		/**
		 * If `true`, tells the compiler that you promise not to mutate any objects.
		 * This allows it to be less conservative about checking whether values have changed.
		 *
		 * @default false
		 */
		immutable?: boolean;

		/**
		 * If `true` when generating DOM code, enables the `hydrate: true` runtime option, which allows a component to upgrade existing DOM rather than creating new DOM from scratch.
		 * When generating SSR code, this adds markers to `<head>` elements so that hydration knows which to replace.
		 *
		 * @default false
		 */
		hydratable?: boolean;

		/**
		 * If `true`, generates code that will work in IE9 and IE10, which don't support things like `element.dataset`.
		 *
		 * @default false
		 */
		legacy?: boolean;

		/**
		 * If `true`, tells the compiler to generate a custom element constructor instead of a regular Svelte component.
		 *
		 * @default false
		 */
		customElement?: boolean;

		/**
		 * A `string` that tells Svelte what tag name to register the custom element with.
		 * It must be a lowercase alphanumeric string with at least one hyphen, e.g. `"my-element"`.
		 *
		 * @default null
		 */
		tag?: string;

		/**
		 * - `'injected'` (formerly `true`), styles will be included in the JavaScript class and injected at runtime for the components actually rendered.
		 * - `'external'` (formerly `false`), the CSS will be returned in the `css` field of the compilation result. Most Svelte bundler plugins will set this to `'external'` and use the CSS that is statically generated for better performance, as it will result in smaller JavaScript bundles and the output can be served as cacheable `.css` files.
		 * - `'none'`, styles are completely avoided and no CSS output is generated.
		 */
		css?: 'injected' | 'external' | 'none' | boolean;

		/**
		 * A `number` that tells Svelte to break the loop if it blocks the thread for more than `loopGuardTimeout` ms.
		 * This is useful to prevent infinite loops.
		 * **Only available when `dev: true`**.
		 *
		 * @default 0
		 */
		loopGuardTimeout?: number;

		/**
		 * The namespace of the element; e.g., `"mathml"`, `"svg"`, `"foreign"`.
		 *
		 * @default 'html'
		 */
		namespace?: string;

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
		 *  If `true`, exposes the Svelte major version in the browser by adding it to a `Set` stored in the global `window.__svelte.v`.
		 *
		 * @default true
		 */
		discloseVersion?: boolean;
	}

	interface ParserOptions {
		filename?: string;
		customElement?: boolean;
		css?: 'injected' | 'external' | 'none' | boolean;
	}

	interface Var {
		name: string;
		/** the `bar` in `export { foo as bar }` or `export let bar` */
		export_name?: string;
		/** true if assigned a boolean default value (`export let foo = true`) */
		is_boolean?: boolean;
		injected?: boolean;
		module?: boolean;
		mutated?: boolean;
		reassigned?: boolean;
		referenced?: boolean; // referenced from template scope
		referenced_from_script?: boolean; // referenced from script
		writable?: boolean;

		// used internally, but not exposed
		global?: boolean;
		internal?: boolean; // event handlers, bindings
		initialised?: boolean;
		hoistable?: boolean;
		subscribable?: boolean;
		is_reactive_dependency?: boolean;
		imported?: boolean;
	}

	interface CssResult {
		code: string;
		map: SourceMap;
	}

	/** The returned shape of `compile` from `svelte/compiler` */
	export interface CompileResult {
		/** The resulting JavaScript code from compling the component */
		js: {
			/** Code as a string */
			code: string;
			/** A source map */
			map: any;
		};
		/** The resulting CSS code from compling the component */
		css: CssResult;
		/** The abstract syntax tree representing the structure of the component */
		ast: Ast;
		/**
		 * An array of warning objects that were generated during compilation. Each warning has several properties:
		 * - code is a string identifying the category of warning
		 * - message describes the issue in human-readable terms
		 * - start and end, if the warning relates to a specific location, are objects with line, column and character properties
		 * - frame, if applicable, is a string highlighting the offending code with line numbers
		 * */
		warnings: Warning[];
		/** An array of the component's declarations used by tooling in the ecosystem (like our ESLint plugin) to infer more information */
		vars: Var[];
		/** An object used by the Svelte developer team for diagnosing the compiler. Avoid relying on it to stay the same! */
		stats: {
			timings: {
				total: number;
			};
		};
	}
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

	/**
	 * Utility type to extract the type of a preprocessor from a preprocessor group
	 */
	export interface SveltePreprocessor<
		PreprocessorType extends keyof PreprocessorGroup,
		Options = any
	> {
		(options?: Options): Required<Pick<PreprocessorGroup, PreprocessorType>>;
	}
	/**
	 * `compile` takes your component source code, and turns it into a JavaScript module that exports a class.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-compile
	 * */
	export function compile(source: string, options?: CompileOptions): CompileResult;
	/**
	 * The parse function parses a component, returning only its abstract syntax tree.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-parse
	 * */
	export function parse(template: string, options?: ParserOptions): Ast;
	/**
	 * The preprocess function provides convenient hooks for arbitrarily transforming component source code.
	 * For example, it can be used to convert a <style lang="sass"> block into vanilla CSS.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-preprocess
	 * */
	export function preprocess(source: string, preprocessor: PreprocessorGroup | PreprocessorGroup[], options?: {
		filename?: string | undefined;
	} | undefined): Promise<Processed>;
	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * */
	export const VERSION: string;
}

declare module 'svelte/types/compiler/preprocess' {
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

	/**
	 * Utility type to extract the type of a preprocessor from a preprocessor group
	 */
	export interface SveltePreprocessor<
		PreprocessorType extends keyof PreprocessorGroup,
		Options = any
	> {
		(options?: Options): Required<Pick<PreprocessorGroup, PreprocessorType>>;
	}
}

declare module 'svelte/types/compiler/interfaces' {
	import type { AssignmentExpression, Node, Program } from 'estree';
	import type { SourceMap } from 'magic-string';
	interface BaseNode {
		start: number;
		end: number;
		type: string;
		children?: TemplateNode[];
		[prop_name: string]: any;
	}

	export interface Fragment extends BaseNode {
		type: 'Fragment';
		children: TemplateNode[];
	}

	export interface Text extends BaseNode {
		type: 'Text';
		data: string;
	}

	export interface MustacheTag extends BaseNode {
		type: 'MustacheTag' | 'RawMustacheTag';
		expression: Node;
	}

	export interface Comment extends BaseNode {
		type: 'Comment';
		data: string;
		ignores: string[];
	}

	export interface ConstTag extends BaseNode {
		type: 'ConstTag';
		expression: AssignmentExpression;
	}

	interface DebugTag extends BaseNode {
		type: 'DebugTag';
		identifiers: Node[];
	}

	export type DirectiveType =
		| 'Action'
		| 'Animation'
		| 'Binding'
		| 'Class'
		| 'StyleDirective'
		| 'EventHandler'
		| 'Let'
		| 'Ref'
		| 'Transition';

	export interface BaseDirective extends BaseNode {
		type: DirectiveType;
		name: string;
	}

	interface BaseExpressionDirective extends BaseDirective {
		type: DirectiveType;
		expression: null | Node;
		name: string;
		modifiers: string[];
	}

	export interface Element extends BaseNode {
		type:
			| 'InlineComponent'
			| 'SlotTemplate'
			| 'Title'
			| 'Slot'
			| 'Element'
			| 'Head'
			| 'Options'
			| 'Window'
			| 'Document'
			| 'Body';
		attributes: Array<BaseDirective | Attribute | SpreadAttribute>;
		name: string;
	}

	export interface Attribute extends BaseNode {
		type: 'Attribute';
		name: string;
		value: any[];
	}

	export interface SpreadAttribute extends BaseNode {
		type: 'Spread';
		expression: Node;
	}

	export interface Transition extends BaseExpressionDirective {
		type: 'Transition';
		intro: boolean;
		outro: boolean;
	}

	export type Directive = BaseDirective | BaseExpressionDirective | Transition;

	export type TemplateNode =
		| Text
		| ConstTag
		| DebugTag
		| MustacheTag
		| BaseNode
		| Element
		| Attribute
		| SpreadAttribute
		| Directive
		| Transition
		| Comment;

	export interface Parser {
		readonly template: string;
		readonly filename?: string;

		index: number;
		stack: Node[];

		html: Node;
		css: Node;
		js: Node;
		meta_tags: {};
	}

	export interface Script extends BaseNode {
		type: 'Script';
		context: string;
		content: Program;
	}

	export interface Style extends BaseNode {
		type: 'Style';
		attributes: any[]; // TODO
		children: any[]; // TODO add CSS node types
		content: {
			start: number;
			end: number;
			styles: string;
		};
	}

	export interface Ast {
		html: TemplateNode;
		css?: Style;
		instance?: Script;
		module?: Script;
	}

	export interface Warning {
		start?: { line: number; column: number; pos?: number };
		end?: { line: number; column: number };
		pos?: number;
		code: string;
		message: string;
		filename?: string;
		frame?: string;
		toString: () => string;
	}

	export type EnableSourcemap = boolean | { js: boolean; css: boolean };

	export type CssHashGetter = (args: {
		name: string;
		filename: string | undefined;
		css: string;
		hash: (input: string) => string;
	}) => string;

	export interface CompileOptions {
		/**
		 * Sets the name of the resulting JavaScript class (though the compiler will rename it if it would otherwise conflict with other variables in scope).
		 * It will normally be inferred from `filename`
		 *
		 * @default 'Component'
		 */
		name?: string;

		/**
		 * Used for debugging hints and sourcemaps. Your bundler plugin will set it automatically.
		 *
		 * @default null
		 */
		filename?: string;

		/**
		 * If `"dom"`, Svelte emits a JavaScript class for mounting to the DOM.
		 * If `"ssr"`, Svelte emits an object with a `render` method suitable for server-side rendering.
		 * If `false`, no JavaScript or CSS is returned; just metadata.
		 *
		 * @default 'dom'
		 */
		generate?: 'dom' | 'ssr' | false;

		/**
		 * If `"throw"`, Svelte throws when a compilation error occurred.
		 * If `"warn"`, Svelte will treat errors as warnings and add them to the warning report.
		 *
		 * @default 'throw'
		 */
		errorMode?: 'throw' | 'warn';

		/**
		 * If `"strict"`, Svelte returns a variables report with only variables that are not globals nor internals.
		 * If `"full"`, Svelte returns a variables report with all detected variables.
		 * If `false`, no variables report is returned.
		 *
		 * @default 'strict'
		 */
		varsReport?: 'full' | 'strict' | false;

		/**
		 * An initial sourcemap that will be merged into the final output sourcemap.
		 * This is usually the preprocessor sourcemap.
		 *
		 * @default null
		 */
		sourcemap?: object | string;

		/**
		 * If `true`, Svelte generate sourcemaps for components.
		 * Use an object with `js` or `css` for more granular control of sourcemap generation.
		 *
		 * @default true
		 */
		enableSourcemap?: EnableSourcemap;

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
		 * The location of the `svelte` package.
		 * Any imports from `svelte` or `svelte/[module]` will be modified accordingly.
		 *
		 * @default 'svelte'
		 */
		sveltePath?: string;

		/**
		 * If `true`, causes extra code to be added to components that will perform runtime checks and provide debugging information during development.
		 *
		 * @default false
		 */
		dev?: boolean;

		/**
		 * If `true`, getters and setters will be created for the component's props. If `false`, they will only be created for readonly exported values (i.e. those declared with `const`, `class` and `function`). If compiling with `customElement: true` this option defaults to `true`.
		 *
		 * @default false
		 */
		accessors?: boolean;

		/**
		 * If `true`, tells the compiler that you promise not to mutate any objects.
		 * This allows it to be less conservative about checking whether values have changed.
		 *
		 * @default false
		 */
		immutable?: boolean;

		/**
		 * If `true` when generating DOM code, enables the `hydrate: true` runtime option, which allows a component to upgrade existing DOM rather than creating new DOM from scratch.
		 * When generating SSR code, this adds markers to `<head>` elements so that hydration knows which to replace.
		 *
		 * @default false
		 */
		hydratable?: boolean;

		/**
		 * If `true`, generates code that will work in IE9 and IE10, which don't support things like `element.dataset`.
		 *
		 * @default false
		 */
		legacy?: boolean;

		/**
		 * If `true`, tells the compiler to generate a custom element constructor instead of a regular Svelte component.
		 *
		 * @default false
		 */
		customElement?: boolean;

		/**
		 * A `string` that tells Svelte what tag name to register the custom element with.
		 * It must be a lowercase alphanumeric string with at least one hyphen, e.g. `"my-element"`.
		 *
		 * @default null
		 */
		tag?: string;

		/**
		 * - `'injected'` (formerly `true`), styles will be included in the JavaScript class and injected at runtime for the components actually rendered.
		 * - `'external'` (formerly `false`), the CSS will be returned in the `css` field of the compilation result. Most Svelte bundler plugins will set this to `'external'` and use the CSS that is statically generated for better performance, as it will result in smaller JavaScript bundles and the output can be served as cacheable `.css` files.
		 * - `'none'`, styles are completely avoided and no CSS output is generated.
		 */
		css?: 'injected' | 'external' | 'none' | boolean;

		/**
		 * A `number` that tells Svelte to break the loop if it blocks the thread for more than `loopGuardTimeout` ms.
		 * This is useful to prevent infinite loops.
		 * **Only available when `dev: true`**.
		 *
		 * @default 0
		 */
		loopGuardTimeout?: number;

		/**
		 * The namespace of the element; e.g., `"mathml"`, `"svg"`, `"foreign"`.
		 *
		 * @default 'html'
		 */
		namespace?: string;

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
		 *  If `true`, exposes the Svelte major version in the browser by adding it to a `Set` stored in the global `window.__svelte.v`.
		 *
		 * @default true
		 */
		discloseVersion?: boolean;
	}

	export interface ParserOptions {
		filename?: string;
		customElement?: boolean;
		css?: 'injected' | 'external' | 'none' | boolean;
	}

	export interface Visitor {
		enter: (node: Node) => void;
		leave?: (node: Node) => void;
	}

	export interface AppendTarget {
		slots: Record<string, string>;
		slot_stack: string[];
	}

	export interface Var {
		name: string;
		/** the `bar` in `export { foo as bar }` or `export let bar` */
		export_name?: string;
		/** true if assigned a boolean default value (`export let foo = true`) */
		is_boolean?: boolean;
		injected?: boolean;
		module?: boolean;
		mutated?: boolean;
		reassigned?: boolean;
		referenced?: boolean; // referenced from template scope
		referenced_from_script?: boolean; // referenced from script
		writable?: boolean;

		// used internally, but not exposed
		global?: boolean;
		internal?: boolean; // event handlers, bindings
		initialised?: boolean;
		hoistable?: boolean;
		subscribable?: boolean;
		is_reactive_dependency?: boolean;
		imported?: boolean;
	}

	export interface CssResult {
		code: string;
		map: SourceMap;
	}

	/** The returned shape of `compile` from `svelte/compiler` */
	export interface CompileResult {
		/** The resulting JavaScript code from compling the component */
		js: {
			/** Code as a string */
			code: string;
			/** A source map */
			map: any;
		};
		/** The resulting CSS code from compling the component */
		css: CssResult;
		/** The abstract syntax tree representing the structure of the component */
		ast: Ast;
		/**
		 * An array of warning objects that were generated during compilation. Each warning has several properties:
		 * - code is a string identifying the category of warning
		 * - message describes the issue in human-readable terms
		 * - start and end, if the warning relates to a specific location, are objects with line, column and character properties
		 * - frame, if applicable, is a string highlighting the offending code with line numbers
		 * */
		warnings: Warning[];
		/** An array of the component's declarations used by tooling in the ecosystem (like our ESLint plugin) to infer more information */
		vars: Var[];
		/** An object used by the Svelte developer team for diagnosing the compiler. Avoid relying on it to stay the same! */
		stats: {
			timings: {
				total: number;
			};
		};
	}
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
	 * `Action<HTMLDivElement>` and `Action<HTMLDivElement, undefined>` both signal that the action accepts no parameters.
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
}

declare module 'svelte/easing' {
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
	export function linear(x: any): any;
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
		subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
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
	/** Cleanup logic callback. */
	type Invalidator<T> = (value?: T) => void;
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
		subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
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
	/** Cleanup logic callback. */
	type Invalidator<T> = (value?: T) => void;

	/** One or more `Readable`s. */
	type Stores =
		| Readable<any>
		| [Readable<any>, ...Array<Readable<any>>]
		| Array<Readable<any>>;

	/** One or more values from `Readable` stores. */
	type StoresValues<T> = T extends Readable<infer U>
		? U
		: { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };
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
		fallback?: ((node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig) | undefined;
	}): [(node: any, params: CrossfadeParams & {
		key: any;
	}) => () => TransitionConfig, (node: any, params: CrossfadeParams & {
		key: any;
	}) => () => TransitionConfig];
}declare module '*.svelte' {
	export { SvelteComponent as default } from 'svelte';
}

//# sourceMappingURL=index.d.ts.map