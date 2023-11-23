import type { Binding } from '#compiler';
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
	Program
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
 * - `foreign` — for other compilation targets than the web, e.g. Svelte Native.
 *               Disallows bindings other than bind:this, disables a11y checks, disables any special attribute handling
 *               (also see https://github.com/sveltejs/svelte/pull/5652)
 */
export type Namespace = 'html' | 'svg' | 'foreign';

export interface Root extends BaseNode {
	type: 'Root';
	/**
	 * Inline options provided by `<svelte:options>` — these override options passed to `compile(...)`
	 */
	options: SvelteOptions | null;
	fragment: Fragment;
	/** The parsed `<style>` element, if exists */
	css: Style | null;
	/** The parsed `<script>` element, if exists */
	instance: Script | null;
	/** The parsed `<script context="module">` element, if exists */
	module: Script | null;
}

export interface SvelteOptions {
	// start/end info (needed for Prettier, when someone wants to keep the options where they are)
	start: number;
	end: number;
	// options
	runes?: boolean;
	immutable?: boolean;
	accessors?: boolean;
	preserveWhitespace?: boolean;
	namespace?: Namespace;
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
		contains_call_expression: boolean;
		/**
		 * Whether or not the expression contains any dynamic references —
		 * determines whether it will be updated in a render effect or not
		 */
		dynamic: boolean;
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
	/** any svelte-ignore directives — <!-- svelte-ignore a b c --> would result in ['a', 'b', 'c'] */
	ignores: string[];
}

/** A `{@const ...}` tag */
export interface ConstTag extends BaseNode {
	type: 'ConstTag';
	declaration: VariableDeclaration & {
		declarations: [VariableDeclarator & { id: Identifier; init: Expression }];
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
	expression: Identifier;
	argument: null | Expression;
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
		dynamic: false;
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
		delegated: null | DelegatedEvent;
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
	value: true | Array<ExpressionTag | Text>;
	modifiers: Array<'important'>;
	metadata: {
		dynamic: boolean;
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
		/** `true` if contains a SpreadAttribute */
		has_spread: boolean;
		/**
		 * `true` if events on this element can theoretically be delegated. This doesn't necessarily mean that
		 * a specific event will be delegated, as there are other factors which affect the final outcome.
		 * `null` only until it was determined whether this element can be delegated or not.
		 */
		can_delegate_events: boolean | null;
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
		contains_group_binding: boolean;
		/** Set if something in the array expression is shadowed within the each block */
		array_name: Identifier | null;
		index: Identifier;
		item_name: string;
		/** List of bindings that are referenced within the expression */
		references: Binding[];
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
	context: null | Pattern;
	body: Fragment;
}

export type Block = EachBlock | IfBlock | AwaitBlock | KeyBlock | SnippetBlock;

export interface Attribute extends BaseNode {
	type: 'Attribute';
	name: string;
	value: true | Array<Text | ExpressionTag>;
	metadata: {
		dynamic: boolean;
		/** May be set if this is an event attribute */
		delegated: null | DelegatedEvent;
	};
}

export interface SpreadAttribute extends BaseNode {
	type: 'SpreadAttribute';
	expression: Expression;
	metadata: {
		dynamic: boolean;
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

export type SvelteNode = Node | TemplateNode | Fragment;

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

declare module 'estree' {
	export interface BaseNode {
		/** Added by the Svelte parser */
		start?: number;
		/** Added by the Svelte parser */
		end?: number;
	}
}
