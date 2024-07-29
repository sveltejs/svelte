/** @import { Visitors } from './types.js' */
import * as e from '../../errors.js';
import * as w from '../../warnings.js';
import { get_rune } from '../scope.js';
import { merge } from '../visitors.js';
import { a11y_validators } from './visitors/shared/a11y.js';
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
import { ensure_no_module_import_conflict, validate_opening_tag } from './visitors/shared/utils.js';

/**
 * @type {Visitors}
 */
const validation = {
	AssignmentExpression,
	AwaitBlock,
	BindDirective,
	Component,
	ConstTag,
	EachBlock,
	ExportDefaultDeclaration,
	ExpressionStatement,
	ExpressionTag,
	IfBlock,
	ImportDeclaration,
	KeyBlock,
	LabeledStatement,
	LetDirective,
	MemberExpression,
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

export const validation_legacy = merge(validation, a11y_validators);

/**
 * @type {Visitors}
 */
export const validation_runes_js = {
	ImportDeclaration,
	ExportNamedDeclaration,
	CallExpression,
	VariableDeclarator,
	AssignmentExpression,
	UpdateExpression,
	ClassBody,
	ClassDeclaration,
	NewExpression,
	Identifier
};

export const validation_runes = merge(validation, a11y_validators, {
	ImportDeclaration,
	LabeledStatement,
	ExportNamedDeclaration,
	CallExpression,
	EachBlock,
	IfBlock,
	AwaitBlock,
	KeyBlock,
	SnippetBlock,
	ConstTag,
	HtmlTag,
	DebugTag,
	RenderTag,
	VariableDeclarator(node, { state }) {
		ensure_no_module_import_conflict(node, state);

		const init = node.init;
		const rune = get_rune(init, state.scope);

		if (rune === null) return;

		const args = /** @type {import('estree').CallExpression} */ (init).arguments;

		// TODO some of this is duplicated with above, seems off
		if ((rune === '$derived' || rune === '$derived.by') && args.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		} else if (rune === '$state' && args.length > 1) {
			e.rune_invalid_arguments_length(node, rune, 'zero or one arguments');
		} else if (rune === '$props') {
			if (state.has_props_rune) {
				e.props_duplicate(node);
			}

			state.has_props_rune = true;

			if (args.length > 0) {
				e.rune_invalid_arguments(node, rune);
			}

			if (node.id.type !== 'ObjectPattern' && node.id.type !== 'Identifier') {
				e.props_invalid_identifier(node);
			}

			if (node.id.type === 'ObjectPattern') {
				for (const property of node.id.properties) {
					if (property.type === 'Property') {
						if (property.computed) {
							e.props_invalid_pattern(property);
						}

						if (property.key.type === 'Identifier' && property.key.name.startsWith('$$')) {
							e.props_illegal_name(property);
						}

						const value =
							property.value.type === 'AssignmentPattern' ? property.value.left : property.value;

						if (value.type !== 'Identifier') {
							e.props_invalid_pattern(property);
						}
					}
				}
			}
		}

		if (rune === '$derived') {
			const arg = args[0];
			if (
				arg.type === 'CallExpression' &&
				(arg.callee.type === 'ArrowFunctionExpression' || arg.callee.type === 'FunctionExpression')
			) {
				w.derived_iife(node);
			}
		}
	},
	OnDirective,
	ClassBody,
	ClassDeclaration,
	Identifier,
	NewExpression
});
