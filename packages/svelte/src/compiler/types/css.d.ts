import type { AST } from '#compiler';
import type {
	BaseNode as ParseCSSBaseNode,
	Combinator as ParseCSSCombinator,
	TypeSelector as ParseCSSTypeSelector,
	IdSelector as ParseCSSIdSelector,
	ClassSelector as ParseCSSClassSelector,
	AttributeSelector as ParseCSSAttributeSelector,
	PseudoElementSelector as ParseCSSPseudoElementSelector,
	Percentage as ParseCSSPercentage,
	NestingSelector as ParseCSSNestingSelector,
	Nth as ParseCSSNth,
	Declaration as ParseCSSDeclaration
} from '@sveltejs/parse-css';

export namespace _CSS {
	// Re-export unchanged types from @sveltejs/parse-css
	export type BaseNode = ParseCSSBaseNode;
	export type Combinator = ParseCSSCombinator;
	export type TypeSelector = ParseCSSTypeSelector;
	export type IdSelector = ParseCSSIdSelector;
	export type ClassSelector = ParseCSSClassSelector;
	export type AttributeSelector = ParseCSSAttributeSelector;
	export type PseudoElementSelector = ParseCSSPseudoElementSelector;
	export type Percentage = ParseCSSPercentage;
	export type NestingSelector = ParseCSSNestingSelector;
	export type Nth = ParseCSSNth;
	export type Declaration = ParseCSSDeclaration;

	// PseudoClassSelector references SelectorList, so we need to define it here
	export interface PseudoClassSelector extends BaseNode {
		type: 'PseudoClassSelector';
		name: string;
		args: SelectorList | null;
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

	// Svelte-specific types (with metadata or additional fields)

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
		/** @internal */
		metadata: {
			parent_rule: null | Rule;
			has_local_selectors: boolean;
			/**
			 * `true` if the rule contains a ComplexSelector whose RelativeSelectors are all global or global-like
			 */
			has_global_selectors: boolean;
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
		/** @internal */
		metadata: {
			rule: null | Rule;
			is_global: boolean;
			/** True if this selector applies to an element. For global selectors, this is defined in css-analyze, for others in css-prune while scoping */
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
		/** @internal */
		metadata: {
			/**
			 * `true` if the whole selector is unscoped, e.g. `:global(...)` or `:global` or `:global.x`.
			 * Selectors like `:global(...).x` are not considered global, because they still need scoping.
			 * Selectors like `:global(...):is/where/not/has(...)` are only considered global if all their
			 * children are global.
			 */
			is_global: boolean;
			/** `:root`, `:host`, `::view-transition`, or selectors after a `:global` */
			is_global_like: boolean;
			scoped: boolean;
		};
	}

	export interface Block extends BaseNode {
		type: 'Block';
		children: Array<Declaration | Rule | Atrule>;
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
