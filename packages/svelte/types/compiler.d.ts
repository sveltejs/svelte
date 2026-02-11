/// <reference path="./ambient.d.ts" />
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

export type CssHashGetter = (args: {
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
export type Namespace = 'html' | 'svg' | 'mathml';

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
export type ICompileDiagnostic = {
	code: string;
	message: string;
	stack?: string;
	filename?: string;
	start?: Location;
	end?: Location;
	position?: [number, number];
	frame?: string;
};
export namespace _CSS {
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
export type Options = {
	getLeadingComments?: NonNullable<Parameters<typeof ts>[0]>['getLeadingComments'] | undefined;
	getTrailingComments?: NonNullable<Parameters<typeof ts>[0]>['getTrailingComments'] | undefined;
};

export {};

