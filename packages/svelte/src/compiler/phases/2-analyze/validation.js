/** @import { Visitors } from './types.js' */
import { AssignmentExpression } from './visitors/AssignmentExpression.js';
import { AwaitBlock } from './visitors/AwaitBlock.js';
import { BindDirective } from './visitors/BindDirective.js';
import { CallExpression } from './visitors/CallExpression.js';
import { ClassBody } from './visitors/ClassBody.js';
import { ClassDeclaration } from './visitors/ClassDeclaration.js';
import { Component } from './visitors/Component.js';
import { ConstTag } from './visitors/ConstTag.js';
import { DebugTag } from './visitors/DebugTag.js';
import { EachBlock } from './visitors/EachBlock.js';
import { ExportDefaultDeclaration } from './visitors/ExportDefaultDeclaration.js';
import { ExportNamedDeclaration } from './visitors/ExportNamedDeclaration.js';
import { ExpressionStatement } from './visitors/ExpressionStatement.js';
import { ExpressionTag } from './visitors/ExpressionTag.js';
import { HtmlTag } from './visitors/HtmlTag.js';
import { Identifier } from './visitors/Identifier.js';
import { IfBlock } from './visitors/IfBlock.js';
import { ImportDeclaration } from './visitors/ImportDeclaration.js';
import { KeyBlock } from './visitors/KeyBlock.js';
import { LabeledStatement } from './visitors/LabeledStatement.js';
import { LetDirective } from './visitors/LetDirective.js';
import { MemberExpression } from './visitors/MemberExpression.js';
import { NewExpression } from './visitors/NewExpression.js';
import { OnDirective } from './visitors/OnDirective.js';
import { RegularElement } from './visitors/RegularElement.js';
import { RenderTag } from './visitors/RenderTag.js';
import { SlotElement } from './visitors/SlotElement.js';
import { SnippetBlock } from './visitors/SnippetBlock.js';
import { StyleDirective } from './visitors/StyleDirective.js';
import { SvelteComponent } from './visitors/SvelteComponent.js';
import { SvelteElement } from './visitors/SvelteElement.js';
import { SvelteFragment } from './visitors/SvelteFragment.js';
import { SvelteHead } from './visitors/SvelteHead.js';
import { SvelteSelf } from './visitors/SvelteSelf.js';
import { Text } from './visitors/Text.js';
import { TitleElement } from './visitors/TitleElement.js';
import { UpdateExpression } from './visitors/UpdateExpression.js';
import { VariableDeclarator } from './visitors/VariableDeclarator.js';

/**
 * @type {Visitors}
 */
const validation = {
	AssignmentExpression,
	AwaitBlock,
	BindDirective,
	CallExpression,
	ClassBody,
	ClassDeclaration,
	Component,
	ConstTag,
	DebugTag,
	EachBlock,
	ExportDefaultDeclaration,
	ExportNamedDeclaration,
	ExpressionStatement,
	ExpressionTag,
	HtmlTag,
	Identifier,
	IfBlock,
	ImportDeclaration,
	KeyBlock,
	LabeledStatement,
	LetDirective,
	MemberExpression,
	NewExpression,
	OnDirective,
	RegularElement,
	RenderTag,
	SlotElement,
	SnippetBlock,
	StyleDirective,
	SvelteHead,
	SvelteElement,
	SvelteFragment,
	SvelteComponent,
	SvelteSelf,
	Text,
	TitleElement,
	UpdateExpression,
	VariableDeclarator
};

export const validation_legacy = validation;

export const validation_runes_js = validation;

export const validation_runes = validation;
