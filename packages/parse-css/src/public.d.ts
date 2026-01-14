export interface BaseNode {
	start: number;
	end: number;
}

export interface StyleSheet extends BaseNode {
	type: 'StyleSheet';
	children: Array<Atrule | Rule>;
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
	combinator: Combinator | null;
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

// Re-export from implementation
export { parse, CSSParseError } from './index.js';
