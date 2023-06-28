import { AssignmentExpression, Node, Program } from 'estree';
import { SourceMap } from 'magic-string';

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
	 *  If `true`, exposes the Svelte major version on the global `window` object in the browser.
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
