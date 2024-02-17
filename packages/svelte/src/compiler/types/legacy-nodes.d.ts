import type { StyleDirective as LegacyStyleDirective, Text, Css } from '#compiler';
import type {
	ArrayExpression,
	AssignmentExpression,
	Expression,
	Identifier,
	MemberExpression,
	ObjectExpression,
	Pattern
} from 'estree';

interface BaseNode {
	type: string;
	start: number;
	end: number;
}

interface BaseElement extends BaseNode {
	name: string;
	attributes: Array<LegacyAttributeLike>;
	children: Array<LegacyElementLike>;
}

export interface LegacyRoot extends BaseNode {
	html: LegacySvelteNode;
	css?: any;
	instance?: any;
	module?: any;
}

export interface LegacyAction extends BaseNode {
	type: 'Action';
	/** The 'x' in `use:x` */
	name: string;
	/** The 'y' in `use:x={y}` */
	expression: null | Expression;
}

export interface LegacyAnimation extends BaseNode {
	type: 'Animation';
	/** The 'x' in `animate:x` */
	name: string;
	/** The y in `animate:x={y}` */
	expression: null | Expression;
}

export interface LegacyBinding extends BaseNode {
	type: 'Binding';
	/** The 'x' in `bind:x` */
	name: string;
	/** The y in `bind:x={y}` */
	expression: Identifier | MemberExpression;
}

export interface LegacyBody extends BaseElement {
	type: 'Body';
	name: 'svelte:body';
}

export interface LegacyAttribute extends BaseNode {
	type: 'Attribute';
	name: string;
	value: true | Array<Text | LegacyMustacheTag | LegacyAttributeShorthand>;
}

export interface LegacyAttributeShorthand extends BaseNode {
	type: 'AttributeShorthand';
	expression: Expression;
}

export interface LegacyLet extends BaseNode {
	type: 'Let';
	/** The 'x' in `let:x` */
	name: string;
	/** The 'y' in `let:x={y}` */
	expression: null | Identifier | ArrayExpression | ObjectExpression;
}

export interface LegacyCatchBlock extends BaseNode {
	type: 'CatchBlock';
	children: LegacySvelteNode[];
	skip: boolean;
}

export interface LegacyClass extends BaseNode {
	type: 'Class';
	/** The 'x' in `class:x` */
	name: 'class';
	/** The 'y' in `class:x={y}`, or the `x` in `class:x` */
	expression: Expression;
}

export interface LegacyDocument extends BaseElement {
	type: 'Document';
}

export interface LegacyElement {
	type: 'Element';
}

export interface LegacyEventHandler extends BaseNode {
	type: 'EventHandler';
	/** The 'x' in `on:x` */
	name: string;
	/** The 'y' in `on:x={y}` */
	expression: null | Expression;
	modifiers: string[];
}

export interface LegacyHead extends BaseElement {
	type: 'Head';
}

export interface LegacyInlineComponent extends BaseElement {
	type: 'InlineComponent';
	/** Set if this is a `<svelte:component>` */
	expression?: Expression;
}

export interface LegacyMustacheTag extends BaseNode {
	type: 'MustacheTag';
	expression: Expression;
}

export interface LegacyOptions {
	type: 'Options';
	name: 'svelte:options';
	attributes: Array<any>;
}

export interface LegacyPendingBlock extends BaseNode {
	type: 'PendingBlock';
	children: LegacySvelteNode[];
	skip: boolean;
}

export interface LegacyRawMustacheTag extends BaseNode {
	type: 'RawMustacheTag';
	expression: Expression;
}

export interface LegacySpread extends BaseNode {
	type: 'Spread';
	expression: Expression;
}

export interface LegacySlot extends BaseElement {
	type: 'Slot';
}

export interface LegacySlotTemplate extends BaseElement {
	type: 'SlotTemplate';
}

export interface LegacyThenBlock extends BaseNode {
	type: 'ThenBlock';
	children: LegacySvelteNode[];
	skip: boolean;
}

export interface SnippetBlock extends BaseNode {
	type: 'SnippetBlock';
	expression: Identifier;
	context: null | Pattern;
	children: LegacySvelteNode[];
}

export interface RenderTag extends BaseNode {
	type: 'RenderTag';
	expression: Identifier;
	argument: null | Expression;
}

export interface LegacyTitle extends BaseElement {
	type: 'Title';
	name: 'title';
}

export interface LegacyConstTag extends BaseNode {
	type: 'ConstTag';
	expression: AssignmentExpression;
}

export interface LegacyTransition extends BaseNode {
	type: 'Transition';
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

export interface LegacyWindow extends BaseElement {
	type: 'Window';
}

type LegacyDirective =
	| LegacyAnimation
	| LegacyBinding
	| LegacyClass
	| LegacyLet
	| LegacyEventHandler
	| LegacyStyleDirective
	| LegacyTransition
	| LegacyAction;

export type LegacyAttributeLike = LegacyAttribute | LegacySpread | LegacyDirective;

export type LegacyElementLike =
	| LegacyBody
	| LegacyCatchBlock
	| LegacyDocument
	| LegacyElement
	| LegacyHead
	| LegacyInlineComponent
	| LegacyMustacheTag
	| LegacyOptions
	| LegacyPendingBlock
	| LegacyRawMustacheTag
	| LegacySlot
	| LegacySlotTemplate
	| LegacyThenBlock
	| LegacyTitle
	| LegacyWindow;

export interface LegacyStyle extends BaseNode {
	type: 'Style';
	attributes: any[];
	content: {
		start: number;
		end: number;
		styles: string;
	};
	children: any[];
}

export interface LegacySelector extends BaseNode {
	type: 'Selector';
	children: Array<Css.Combinator | Css.SimpleSelector>;
}

export type LegacyCssNode = LegacyStyle | LegacySelector;

export type LegacySvelteNode =
	| LegacyConstTag
	| LegacyElementLike
	| LegacyAttributeLike
	| LegacyAttributeShorthand
	| LegacyCssNode
	| Text;
