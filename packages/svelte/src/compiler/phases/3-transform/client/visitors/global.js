/** @import { Visitors } from '../types' */
import { AnimateDirective } from './AnimateDirective.js';
import { ArrowFunctionExpression } from './ArrowFunctionExpression.js';
import { AssignmentExpression } from './AssignmentExpression.js';
import { Attribute } from './Attribute.js';
import { AwaitBlock } from './AwaitBlock.js';
import { BindDirective } from './BindDirective.js';
import { BreakStatement } from './BreakStatement.js';
import { CallExpression } from './CallExpression.js';
import { Comment } from './Comment.js';
import { Component } from './Component.js';
import { ConstTag } from './ConstTag.js';
import { DebugTag } from './DebugTag.js';
import { EachBlock } from './EachBlock.js';
import { Fragment } from './Fragment.js';
import { FunctionDeclaration } from './FunctionDeclaration.js';
import { FunctionExpression } from './FunctionExpression.js';
import { HtmlTag } from './HtmlTag.js';
import { Identifier } from './Identifier.js';
import { IfBlock } from './IfBlock.js';
import { KeyBlock } from './KeyBlock.js';
import { LabeledStatement } from './LabeledStatement.js';
import { LetDirective } from './LetDirective.js';
import { MemberExpression } from './MemberExpression.js';
import { OnDirective } from './OnDirective.js';
import { RegularElement } from './RegularElement.js';
import { RenderTag } from './RenderTag.js';
import { SlotElement } from './SlotElement.js';
import { SnippetBlock } from './SnippetBlock.js';
import { SpreadAttribute } from './SpreadAttribute.js';
import { SvelteBody } from './SvelteBody.js';
import { SvelteComponent } from './SvelteComponent.js';
import { SvelteDocument } from './SvelteDocument.js';
import { SvelteElement } from './SvelteElement.js';
import { SvelteFragment } from './SvelteFragment.js';
import { SvelteHead } from './SvelteHead.js';
import { SvelteSelf } from './SvelteSelf.js';
import { SvelteWindow } from './SvelteWindow.js';
import { TitleElement } from './TitleElement.js';
import { TransitionDirective } from './TransitionDirective.js';
import { UpdateExpression } from './UpdateExpression.js';
import { UseDirective } from './UseDirective.js';
import { VariableDeclaration } from './VariableDeclaration.js';

/** @type {Visitors} */
export const global_visitors = {
	AnimateDirective,
	ArrowFunctionExpression,
	AssignmentExpression,
	Attribute,
	AwaitBlock,
	BindDirective,
	BreakStatement,
	CallExpression,
	Comment,
	Component,
	ConstTag,
	DebugTag,
	EachBlock,
	Fragment,
	FunctionDeclaration,
	FunctionExpression,
	HtmlTag,
	Identifier,
	IfBlock,
	KeyBlock,
	LabeledStatement,
	LetDirective,
	MemberExpression,
	OnDirective,
	RegularElement,
	RenderTag,
	SlotElement,
	SnippetBlock,
	SpreadAttribute,
	SvelteBody,
	SvelteComponent,
	SvelteDocument,
	SvelteElement,
	SvelteFragment,
	SvelteHead,
	SvelteSelf,
	SvelteWindow,
	TitleElement,
	TransitionDirective,
	UpdateExpression,
	UseDirective,
	VariableDeclaration
};
