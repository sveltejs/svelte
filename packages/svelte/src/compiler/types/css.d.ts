import type { Style } from './template';

export interface BaseNode {
	start: number;
	end: number;
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
	children: Selector[];
}

export interface Selector extends BaseNode {
	type: 'Selector';
	children: Array<SimpleSelector | Combinator>;
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
	args: string | null;
}

export interface Percentage extends BaseNode {
	type: 'Percentage';
	value: string;
}

export type SimpleSelector =
	| TypeSelector
	| IdSelector
	| ClassSelector
	| AttributeSelector
	| PseudoElementSelector
	| PseudoClassSelector
	| Percentage;

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
export type Node = Style | Rule | Atrule;
