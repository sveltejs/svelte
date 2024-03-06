import type {
	AssignmentExpression,
	ClassDeclaration,
	Expression,
	FunctionDeclaration,
	Identifier,
	ImportDeclaration
} from 'estree';
import type { Location } from 'locate-character';
import type { SourceMap } from 'magic-string';
import type { Context } from 'zimmerframe';
import type { Scope } from '../phases/scope.js';
import * as Css from './css.js';
import type { EachBlock, Namespace, SvelteNode } from './template.js';

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
}

export interface Warning {
	start?: Location;
	end?: Location;
	// TODO there was pos: number in Svelte 4 - do we want to add it back?
	code: string;
	message: string;
	filename?: string;
}

export interface CompileError extends Error {
	code: string;
	filename?: string;
	position?: [number, number];
	start?: Location;
	end?: Location;
}

export type CssHashGetter = (args: {
	name: string;
	filename: string | undefined;
	css: string;
	hash: (input: string) => string;
}) => string;

export interface OptimizeOptions {
	hydrate?: boolean;
}

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
	 */
	accessors?: boolean;
	/**
	 * The namespace of the element; e.g., `"html"`, `"svg"`, `"foreign"`.
	 *
	 * @default 'html'
	 */
	namespace?: Namespace;
	/**
	 * If `true`, tells the compiler that you promise not to mutate any objects.
	 * This allows it to be less conservative about checking whether values have changed.
	 *
	 * @default false
	 */
	immutable?: boolean;
	/**
	 * - `'injected'`: styles will be included in the JavaScript class and injected at runtime for the components actually rendered.
	 * - `'external'`: the CSS will be returned in the `css` field of the compilation result. Most Svelte bundler plugins will set this to `'external'` and use the CSS that is statically generated for better performance, as it will result in smaller JavaScript bundles and the output can be served as cacheable `.css` files.
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
	legacy?: {
		/**
		 * Applies a transformation so that the default export of Svelte files can still be instantiated the same way as in Svelte 4 —
		 * as a class when compiling for the browser (as though using `createClassComponent(MyComponent, {...})` from `svelte/legacy`)
		 * or as an object with a `.render(...)` method when compiling for the server
		 * @default false
		 */
		componentApi?: boolean;
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
}

// The following two somewhat scary looking types ensure that certain types are required but can be undefined still

export type ValidatedModuleCompileOptions = Omit<Required<ModuleCompileOptions>, 'filename'> & {
	filename: ModuleCompileOptions['filename'];
};

export type ValidatedCompileOptions = ValidatedModuleCompileOptions &
	Omit<
		Required<CompileOptions>,
		| keyof ModuleCompileOptions
		| 'name'
		| 'legacy'
		| 'outputFilename'
		| 'cssOutputFilename'
		| 'sourcemap'
		| 'runes'
	> & {
		name: CompileOptions['name'];
		outputFilename: CompileOptions['outputFilename'];
		cssOutputFilename: CompileOptions['cssOutputFilename'];
		sourcemap: CompileOptions['sourcemap'];
		legacy: Required<Required<CompileOptions>['legacy']>;
		runes: CompileOptions['runes'];
	};

export type DeclarationKind =
	| 'var'
	| 'let'
	| 'const'
	| 'function'
	| 'import'
	| 'param'
	| 'rest_param'
	| 'synthetic';

export interface Binding {
	node: Identifier;
	/**
	 * - `normal`: A variable that is not in any way special
	 * - `prop`: A normal prop (possibly mutated)
	 * - `rest_prop`: A rest prop
	 * - `state`: A state variable
	 * - `derived`: A derived variable
	 * - `each`: An each block context variable
	 * - `store_sub`: A $store value
	 * - `legacy_reactive`: A `$:` declaration
	 * - `legacy_reactive_import`: An imported binding that is mutated inside the component
	 */
	kind:
		| 'normal'
		| 'prop'
		| 'rest_prop'
		| 'state'
		| 'frozen_state'
		| 'derived'
		| 'each'
		| 'store_sub'
		| 'legacy_reactive'
		| 'legacy_reactive_import';
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
	scope: Scope;
	/** For `legacy_reactive`: its reactive dependencies */
	legacy_dependencies: Binding[];
	/** Legacy props: the `class` in `{ export klass as class}` */
	prop_alias: string | null;
	/**
	 * If this is set, all references should use this expression instead of the identifier name.
	 * If a function is given, it will be called with the identifier at that location and should return the new expression.
	 */
	expression: Expression | ((id: Identifier) => Expression) | null;
	/** If this is set, all mutations should use this expression */
	mutation: ((assignment: AssignmentExpression, context: Context<any, any>) => Expression) | null;
	/** Additional metadata, varies per binding type */
	metadata: {
		/** `true` if is (inside) a rest parameter */
		inside_rest?: boolean;
	} | null;
}

export * from './template.js';
export { Css };

// TODO this chain is a bit weird
export { ReactiveStatement } from '../phases/types.js';
