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

export interface SelectorList extends BaseNode {
	type: 'SelectorList';
	children: ComplexSelector[];
}

export interface ComplexSelector extends BaseNode {
	type: 'ComplexSelector';
	children: RelativeSelector[];
	metadata: {
		used: boolean;
	};
}

export interface RelativeSelector extends BaseNode {
	type: 'RelativeSelector';
	combinator: null | Combinator;
	selectors: SimpleSelector[];
	metadata: {
		is_global: boolean;
		is_host: boolean;
		is_root: boolean;
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
	| Nth;

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
	| ComplexSelector
	| RelativeSelector
	| Combinator
	| SimpleSelector
	| Declaration;
