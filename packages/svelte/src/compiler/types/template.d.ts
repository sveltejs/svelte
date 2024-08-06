import type { Binding, Css, ExpressionMetadata } from '#compiler';
import type {
	ArrayExpression,
	ArrowFunctionExpression,
	VariableDeclaration,
	VariableDeclarator,
	Expression,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	MemberExpression,
	Node,
	ObjectExpression,
	Pattern,
	Program,
	ChainExpression,
	SimpleCallExpression
} from 'estree';

export interface BaseNode {
	type: string;
	start: number;
	end: number;
	/** This is set during parsing on elements/components/expressions/text (but not attributes etc) */
	parent: SvelteNode | null;
}

export interface Fragment {
	type: 'Fragment';
	nodes: Array<Text | Tag | ElementLike | Block | Comment>;
	/**
	 * Fragments declare their own scopes. A transparent fragment is one whose scope
	 * is not represented by a scope in the resulting JavaScript (e.g. an element scope),
	 * and should therefore delegate to parent scopes when generating unique identifiers
	 */
	transparent: boolean;
}

/**
 * - `html`    — the default, for e.g. `<div>` or `<span>`
 * - `svg`     — for e.g. `<svg>` or `<g>`
 * - `mathml`  — for e.g. `<math>` or `<mrow>`
 * - `foreign` — for other compilation targets than the web, e.g. Svelte Native.
 *               Disallows bindings other than bind:this, disables a11y checks, disables any special attribute handling
 *               (also see https://github.com/sveltejs/svelte/pull/5652)
 */
export type Namespace = 'html' | 'svg' | 'mathml' | 'foreign';

export interface Root extends BaseNode {
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
	/** The parsed `<script context="module">` element, if exists */
	module: Script | null;
	metadata: {
		/** Whether the component was parsed with typescript */
		ts: boolean;
	};
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
		tag: string;
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
	metadata: {
		expression: ExpressionMetadata;
	};
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
export interface BindDirective extends BaseNode {
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
export interface ClassDirective extends BaseNode {
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
export interface LetDirective extends BaseNode {
	type: 'LetDirective';
	/** The 'x' in `let:x` */
	name: string;
	/** The 'y' in `let:x={y}` */
	expression: null | Identifier | ArrayExpression | ObjectExpression;
}

/** An `on:` directive */
export interface OnDirective extends BaseNode {
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

export type DelegatedEvent =
	| {
			type: 'hoistable';
			function: ArrowFunctionExpression | FunctionExpression | FunctionDeclaration;
	  }
	| { type: 'non-hoistable' };

/** A `style:` directive */
export interface StyleDirective extends BaseNode {
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

export type Directive =
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

export interface Component extends BaseElement {
	type: 'Component';
	metadata: {
		dynamic: boolean;
	};
}

interface TitleElement extends BaseElement {
	type: 'TitleElement';
	name: 'title';
}

export interface SlotElement extends BaseElement {
	type: 'SlotElement';
	name: 'slot';
}

export interface RegularElement extends BaseElement {
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

export interface SvelteComponent extends BaseElement {
	type: 'SvelteComponent';
	name: 'svelte:component';
	expression: Expression;
}

interface SvelteDocument extends BaseElement {
	type: 'SvelteDocument';
	name: 'svelte:document';
}

export interface SvelteElement extends BaseElement {
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

export interface SvelteFragment extends BaseElement {
	type: 'SvelteFragment';
	name: 'svelte:fragment';
}

interface SvelteHead extends BaseElement {
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

interface SvelteWindow extends BaseElement {
	type: 'SvelteWindow';
	name: 'svelte:window';
}

export type ElementLike =
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
export interface EachBlock extends BaseNode {
	type: 'EachBlock';
	expression: Expression;
	context: Pattern;
	body: Fragment;
	fallback?: Fragment;
	index?: string;
	key?: Expression;
	metadata: {
		keyed: boolean;
		contains_group_binding: boolean;
		/** Set if something in the array expression is shadowed within the each block */
		array_name: Identifier | null;
		index: Identifier;
		item: Identifier;
		declarations: Map<string, Binding>;
		/** List of bindings that are referenced within the expression */
		references: Binding[];
		/**
		 * Optimization path for each blocks: If the parent isn't a fragment and
		 * it only has a single child, then we can classify the block as being "controlled".
		 * This saves us from creating an extra comment and insertion being faster.
		 */
		is_controlled: boolean;
	};
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
	body: Fragment;
}

export type Block = EachBlock | IfBlock | AwaitBlock | KeyBlock | SnippetBlock;

export interface Attribute extends BaseNode {
	type: 'Attribute';
	name: string;
	value: true | ExpressionTag | Array<Text | ExpressionTag>;
	metadata: {
		expression: ExpressionMetadata;
		/** May be set if this is an event attribute */
		delegated: null | DelegatedEvent;
	};
}

export interface SpreadAttribute extends BaseNode {
	type: 'SpreadAttribute';
	expression: Expression;
	metadata: {
		expression: ExpressionMetadata;
	};
}

export type TemplateNode =
	| Root
	| Text
	| Tag
	| ElementLike
	| Attribute
	| SpreadAttribute
	| Directive
	| Comment
	| Block;

export type SvelteNode = Node | TemplateNode | Fragment | Css.Node;

export interface Script extends BaseNode {
	type: 'Script';
	context: string;
	content: Program;
	attributes: Attribute[];
}

declare module 'estree' {
	export interface BaseNode {
		/** Added by the Svelte parser */
		start?: number;
		/** Added by the Svelte parser */
		end?: number;
		/** Added by acorn-typescript */
		typeAnnotation?: any;
	}
}
