import type { Binding, ExpressionMetadata } from '#compiler';
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
	SimpleCallExpression,
	SequenceExpression
} from 'estree';
import type { Scope } from '../phases/scope';
import type { _CSS } from './css';

/**
 * - `html`    — the default, for e.g. `<div>` or `<span>`
 * - `svg`     — for e.g. `<svg>` or `<g>`
 * - `mathml`  — for e.g. `<math>` or `<mrow>`
 */
export type Namespace = 'html' | 'svg' | 'mathml';

export type DelegatedEvent =
	| {
			hoisted: true;
			function: ArrowFunctionExpression | FunctionExpression | FunctionDeclaration;
	  }
	| { hoisted: false };

export namespace AST {
	export interface BaseNode {
		type: string;
		start: number;
		end: number;
	}

	export interface Fragment {
		type: 'Fragment';
		nodes: Array<Text | Tag | ElementLike | Block | Comment>;
		/** @internal */
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
		/** @internal */
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
		/** @internal */
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
		/** @internal */
		metadata: {
			dynamic: boolean;
			args_with_call_expression: Set<number>;
			path: SvelteNode[];
			/** The set of locally-defined snippets that this render tag could correspond to,
			 * used for CSS pruning purposes */
			snippets: Set<SnippetBlock>;
		};
	}

	/** An `animate:` directive */
	export interface AnimateDirective extends BaseNode {
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
		expression: Identifier | MemberExpression | SequenceExpression;
		/** @internal */
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
		/** @internal */
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
		/** @internal */
		metadata: {
			expression: ExpressionMetadata;
		};
	}

	/** A `style:` directive */
	export interface StyleDirective extends BaseNode {
		type: 'StyleDirective';
		/** The 'x' in `style:x` */
		name: string;
		/** The 'y' in `style:x={y}` */
		value: true | ExpressionTag | Array<ExpressionTag | Text>;
		modifiers: Array<'important'>;
		/** @internal */
		metadata: {
			expression: ExpressionMetadata;
		};
	}

	// TODO have separate in/out/transition directives
	/** A `transition:`, `in:` or `out:` directive */
	export interface TransitionDirective extends BaseNode {
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
	export interface UseDirective extends BaseNode {
		type: 'UseDirective';
		/** The 'x' in `use:x` */
		name: string;
		/** The 'y' in `use:x={y}` */
		expression: null | Expression;
	}

	interface BaseElement extends BaseNode {
		name: string;
		attributes: Array<Attribute | SpreadAttribute | Directive>;
		fragment: Fragment;
	}

	export interface Component extends BaseElement {
		type: 'Component';
		/** @internal */
		metadata: {
			scopes: Record<string, Scope>;
			dynamic: boolean;
			/** The set of locally-defined snippets that this component tag could render,
			 * used for CSS pruning purposes */
			snippets: Set<SnippetBlock>;
			path: SvelteNode[];
		};
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
		/** @internal */
		metadata: {
			/** `true` if this is an svg element */
			svg: boolean;
			/** `true` if this is a mathml element */
			mathml: boolean;
			/** `true` if contains a SpreadAttribute */
			has_spread: boolean;
			scoped: boolean;
			path: SvelteNode[];
		};
	}

	export interface SvelteBody extends BaseElement {
		type: 'SvelteBody';
		name: 'svelte:body';
	}

	export interface SvelteComponent extends BaseElement {
		type: 'SvelteComponent';
		name: 'svelte:component';
		expression: Expression;
		/** @internal */
		metadata: {
			scopes: Record<string, Scope>;
			/** The set of locally-defined snippets that this component tag could render,
			 * used for CSS pruning purposes */
			snippets: Set<SnippetBlock>;
			path: SvelteNode[];
		};
	}

	export interface SvelteDocument extends BaseElement {
		type: 'SvelteDocument';
		name: 'svelte:document';
	}

	export interface SvelteElement extends BaseElement {
		type: 'SvelteElement';
		name: 'svelte:element';
		tag: Expression;
		/** @internal */
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
			path: SvelteNode[];
		};
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
		/** @internal */
		metadata: {
			scopes: Record<string, Scope>;
			/** The set of locally-defined snippets that this component tag could render,
			 * used for CSS pruning purposes */
			snippets: Set<SnippetBlock>;
			path: SvelteNode[];
		};
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
		/** @internal */
		metadata: {
			expression: ExpressionMetadata;
			keyed: boolean;
			contains_group_binding: boolean;
			/** Set if something in the array expression is shadowed within the each block */
			array_name: Identifier | null;
			index: Identifier;
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
		/** @internal */
		metadata: {
			can_hoist: boolean;
			/** The set of components/render tags that could render this snippet,
			 * used for CSS pruning */
			sites: Set<Component | SvelteComponent | SvelteSelf | RenderTag>;
		};
	}

	export interface Attribute extends BaseNode {
		type: 'Attribute';
		name: string;
		/**
		 * Quoted/string values are represented by an array, even if they contain a single expression like `"{x}"`
		 */
		value: true | ExpressionTag | Array<Text | ExpressionTag>;
		/** @internal */
		metadata: {
			expression: ExpressionMetadata;
			/** May be set if this is an event attribute */
			delegated: null | DelegatedEvent;
			/** May be `true` if this is a `class` attribute that needs `clsx` */
			needs_clsx: boolean;
		};
	}

	export interface SpreadAttribute extends BaseNode {
		type: 'SpreadAttribute';
		expression: Expression;
		/** @internal */
		metadata: {
			expression: ExpressionMetadata;
		};
	}

	export interface Script extends BaseNode {
		type: 'Script';
		context: 'default' | 'module';
		content: Program;
		attributes: Attribute[];
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

	export type Tag = AST.ExpressionTag | AST.HtmlTag | AST.ConstTag | AST.DebugTag | AST.RenderTag;

	export type TemplateNode =
		| AST.Root
		| AST.Text
		| Tag
		| ElementLike
		| AST.Attribute
		| AST.SpreadAttribute
		| Directive
		| AST.Comment
		| Block;

	export type SvelteNode = Node | TemplateNode | AST.Fragment | _CSS.Node;

	export type { _CSS as CSS };
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
