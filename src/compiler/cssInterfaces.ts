export interface CssLocation {
    source: string;
	start: {
		offset: number;
		line: number;
		column: number;
	};
	end: {
		offset: number;
		line: number;
		column: number;
	};
}


export interface CssNodeCommon {
    type: string;
    start?:number;
    end?:number;
    loc?: CssLocation;
    children?: Array<CssNode | CssNodePlain>
}

export interface AnPlusB extends CssNodeCommon {
	type: 'AnPlusB';
	a: string | null;
	b: string | null;
}

export interface Atrule extends CssNodeCommon {
	type: 'Atrule';
	name: string;
	prelude: AtrulePrelude | Raw | null;
	block: Block | null;
}

export interface AtrulePlain extends CssNodeCommon {
	type: 'Atrule';
	name: string;
	prelude: AtrulePreludePlain | Raw | null;
	block: BlockPlain | null;
}

export interface AtrulePrelude extends CssNodeCommon {
	type: 'AtrulePrelude';
	children: CssNode[] ;
}

export interface AtrulePreludePlain extends CssNodeCommon {
	type: 'AtrulePrelude';
	children: CssNodePlain[];
}

export interface AttributeSelector extends CssNodeCommon {
	type: 'AttributeSelector';
	name: Identifier;
	matcher: string | null;
	value: StringNode | Identifier | null;
	flags: string | null;
}

export interface Block extends CssNodeCommon {
	type: 'Block';
	children: CssNode[];
}

export interface BlockPlain extends CssNodeCommon {
	type: 'Block';
	children: CssNodePlain[];
}

export interface Brackets extends CssNodeCommon {
	type: 'Brackets';
	children: CssNode[];
}

export interface BracketsPlain extends CssNodeCommon {
	type: 'Brackets';
	children: CssNodePlain[];
}

export interface CDC extends CssNodeCommon {
	type: 'CDC';
}

export interface CDO extends CssNodeCommon {
	type: 'CDO';
}

export interface ClassSelector extends CssNodeCommon {
	type: 'ClassSelector';
	name: string;
}

export interface Combinator extends CssNodeCommon {
	type: 'Combinator';
	name: string;
}

export interface Comment extends CssNodeCommon {
	type: 'Comment';
	value: string;
}

export interface Declaration extends CssNodeCommon {
	type: 'Declaration';
	important: boolean | string;
	property: string;
	value: Value | Raw;
}

export interface DeclarationPlain extends CssNodeCommon {
	type: 'Declaration';
	important: boolean | string;
	property: string;
	value: ValuePlain | Raw;
}

export interface DeclarationList extends CssNodeCommon {
	type: 'DeclarationList';
	children: CssNode[];
}

export interface DeclarationListPlain extends CssNodeCommon {
	type: 'DeclarationList';
	children: CssNodePlain[];
}

export interface Dimension extends CssNodeCommon {
	type: 'Dimension';
	value: string;
	unit: string;
}

export interface FunctionNode extends CssNodeCommon {
	type: 'Function';
	name: string;
	children: CssNode[];
}

export interface FunctionNodePlain extends CssNodeCommon {
	type: 'Function';
	name: string;
	children: CssNodePlain[];
}

export interface Hash extends CssNodeCommon {
	type: 'Hash';
	value: string;
}

export interface IdSelector extends CssNodeCommon {
	type: 'IdSelector';
	name: string;
}

export interface Identifier extends CssNodeCommon {
	type: 'Identifier';
	name: string;
}

export interface MediaFeature extends CssNodeCommon {
	type: 'MediaFeature';
	name: string;
	value: Identifier | NumberNode | Dimension | Ratio | null;
}

export interface MediaQuery extends CssNodeCommon {
	type: 'MediaQuery';
	children: CssNode[];
}

export interface MediaQueryPlain extends CssNodeCommon {
	type: 'MediaQuery';
	children: CssNodePlain[];
}

export interface MediaQueryList extends CssNodeCommon {
	type: 'MediaQueryList';
	children: CssNode[];
}

export interface MediaQueryListPlain extends CssNodeCommon {
	type: 'MediaQueryList';
	children: CssNodePlain[];
}

export interface Nth extends CssNodeCommon {
	type: 'Nth';
	nth: AnPlusB | Identifier;
	selector: SelectorList | null;
}

export interface NthPlain extends CssNodeCommon {
	type: 'Nth';
	nth: AnPlusB | Identifier;
	selector: SelectorListPlain | null;
}

export interface NumberNode extends CssNodeCommon {
	type: 'Number';
	value: string;
}

export interface Operator extends CssNodeCommon {
	type: 'Operator';
	value: string;
}

export interface Parentheses extends CssNodeCommon {
	type: 'Parentheses';
	children: CssNode[];
}

export interface ParenthesesPlain extends CssNodeCommon {
	type: 'Parentheses';
	children: CssNodePlain[];
}

export interface Percentage extends CssNodeCommon {
	type: 'Percentage';
	value: string;
}

export interface PseudoClassSelector extends CssNodeCommon {
	type: 'PseudoClassSelector';
	name: string;
	children: CssNode[] | null;
}

export interface PseudoClassSelectorPlain extends CssNodeCommon {
	type: 'PseudoClassSelector';
	name: string;
	children: CssNodePlain[] | null;
}

export interface PseudoElementSelector extends CssNodeCommon {
	type: 'PseudoElementSelector';
	name: string;
	children: CssNode[] | null;
}

export interface PseudoElementSelectorPlain extends CssNodeCommon {
	type: 'PseudoElementSelector';
	name: string;
	children: CssNodePlain[] | null;
}

export interface Ratio extends CssNodeCommon {
	type: 'Ratio';
	left: string;
	right: string;
}

export interface Raw extends CssNodeCommon {
	type: 'Raw';
	value: string;
}

export interface Rule extends CssNodeCommon {
	type: 'Rule';
	prelude: SelectorList | Raw;
	block: Block;
}

export interface RulePlain extends CssNodeCommon {
	type: 'Rule';
	prelude: SelectorListPlain | Raw;
	block: BlockPlain;
}

export interface Selector extends CssNodeCommon {
	type: 'Selector';
	children: CssNode[];
}

export interface SelectorPlain extends CssNodeCommon {
	type: 'Selector';
	children: CssNodePlain[];
}

export interface SelectorList extends CssNodeCommon {
	type: 'SelectorList';
	children: CssNode[];
}

export interface SelectorListPlain extends CssNodeCommon {
	type: 'SelectorList';
	children: CssNodePlain[];
}

export interface StringNode extends CssNodeCommon {
	type: 'String';
	value: string;
}

export interface StyleSheet extends CssNodeCommon {
	type: 'StyleSheet';
	children: CssNode[];
}

export interface StyleSheetPlain extends CssNodeCommon {
	type: 'StyleSheet';
	children: CssNodePlain[];
}

export interface TypeSelector extends CssNodeCommon {
	type: 'TypeSelector';
	name: string;
}

export interface UnicodeRange extends CssNodeCommon {
	type: 'UnicodeRange';
	value: string;
}

export interface Url extends CssNodeCommon {
	type: 'Url';
	value: StringNode | Raw;
}

export interface Value extends CssNodeCommon {
	type: 'Value';
	children: CssNode[];
}

export interface ValuePlain extends CssNodeCommon {
	type: 'Value';
	children: CssNodePlain[];
}

export interface WhiteSpace extends CssNodeCommon {
	type: 'WhiteSpace';
	value: string;
}

export type CssNodePlain =
	| AnPlusB
	| AtrulePlain
	| AtrulePreludePlain
	| AttributeSelector
	| BlockPlain
	| BracketsPlain
	| CDC
	| CDO
	| ClassSelector
	| Combinator
	| Comment
	| DeclarationPlain
	| DeclarationListPlain
	| Dimension
	| FunctionNodePlain
	| Hash
	| IdSelector
	| Identifier
	| MediaFeature
	| MediaQueryPlain
	| MediaQueryListPlain
	| NthPlain
	| NumberNode
	| Operator
	| ParenthesesPlain
	| Percentage
	| PseudoClassSelectorPlain
	| PseudoElementSelectorPlain
	| Ratio
	| Raw
	| RulePlain
	| SelectorPlain
	| SelectorListPlain
	| StringNode
	| StyleSheetPlain
	| TypeSelector
	| UnicodeRange
	| Url
	| ValuePlain
	| WhiteSpace;

export type CssNode =
	| AnPlusB
	| Atrule
	| AtrulePrelude
	| AttributeSelector
	| Block
	| Brackets
	| CDC
	| CDO
	| ClassSelector
	| Combinator
	| Comment
	| Declaration
	| DeclarationList
	| Dimension
	| FunctionNode
	| Hash
	| IdSelector
	| Identifier
	| MediaFeature
	| MediaQuery
	| MediaQueryList
	| Nth
	| NumberNode
	| Operator
	| Parentheses
	| Percentage
	| PseudoClassSelector
	| PseudoElementSelector
	| Ratio
	| Raw
	| Rule
	| Selector
	| SelectorList
	| StringNode
	| StyleSheet
	| TypeSelector
	| UnicodeRange
	| Url
	| Value
	| WhiteSpace;
