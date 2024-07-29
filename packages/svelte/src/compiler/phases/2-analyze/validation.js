/** @import { Expression, Identifier, VariableDeclarator } from 'estree' */
/** @import { Attribute, Component, ElementLike, SvelteComponent, SvelteElement, SvelteSelf, TransitionDirective } from '#compiler' */
/** @import { AnalysisState, Context, Visitors } from './types.js' */
import is_reference from 'is-reference';
import * as e from '../../errors.js';
import {
	extract_identifiers,
	get_attribute_expression,
	is_expression_attribute,
	is_text_attribute,
	unwrap_optional
} from '../../utils/ast.js';
import * as w from '../../warnings.js';
import { Runes } from '../constants.js';
import { regex_not_whitespace } from '../patterns.js';
import { get_rune } from '../scope.js';
import { merge } from '../visitors.js';
import { a11y_validators } from './visitors/shared/a11y.js';
import { is_tag_valid_with_parent } from '../../../html-tree-validation.js';
import { AssignmentExpression } from './visitors/AssignmentExpression.js';
import { AwaitBlock } from './visitors/AwaitBlock.js';
import { BindDirective } from './visitors/BindDirective.js';
import { CallExpression } from './visitors/CallExpression.js';
import { ConstTag } from './visitors/ConstTag.js';
import { EachBlock } from './visitors/EachBlock.js';
import { ExportDefaultDeclaration } from './visitors/ExportDefaultDeclaration.js';
import { ExportNamedDeclaration } from './visitors/ExportNamedDeclaration.js';
import { ExpressionStatement } from './visitors/ExpressionStatement.js';
import { IfBlock } from './visitors/IfBlock.js';
import { ImportDeclaration } from './visitors/ImportDeclaration.js';
import { LabeledStatement } from './visitors/LabeledStatement.js';
import { LetDirective } from './visitors/LetDirective.js';
import { MemberExpression } from './visitors/MemberExpression.js';
import { RegularElement } from './visitors/RegularElement.js';
import { RenderTag } from './visitors/RenderTag.js';
import { UpdateExpression } from './visitors/UpdateExpression.js';
import {
	validate_assignment,
	validate_block_not_empty,
	validate_opening_tag
} from './visitors/shared/utils.js';
import {
	validate_attribute,
	validate_attribute_name,
	validate_slot_attribute
} from './visitors/shared/attribute.js';
import { validate_element } from './visitors/shared/element.js';

/**
 * @param {Component | SvelteComponent | SvelteSelf} node
 * @param {Context} context
 */
function validate_component(node, context) {
	for (const attribute of node.attributes) {
		if (
			attribute.type !== 'Attribute' &&
			attribute.type !== 'SpreadAttribute' &&
			attribute.type !== 'LetDirective' &&
			attribute.type !== 'OnDirective' &&
			attribute.type !== 'BindDirective'
		) {
			e.component_invalid_directive(attribute);
		}

		if (
			attribute.type === 'OnDirective' &&
			(attribute.modifiers.length > 1 || attribute.modifiers.some((m) => m !== 'once'))
		) {
			e.event_handler_invalid_component_modifier(attribute);
		}

		if (attribute.type === 'Attribute') {
			if (context.state.analysis.runes) {
				validate_attribute(attribute, node);

				if (is_expression_attribute(attribute)) {
					const expression = get_attribute_expression(attribute);
					if (expression.type === 'SequenceExpression') {
						let i = /** @type {number} */ (expression.start);
						while (--i > 0) {
							const char = context.state.analysis.source[i];
							if (char === '(') break; // parenthesized sequence expressions are ok
							if (char === '{') e.attribute_invalid_sequence_expression(expression);
						}
					}
				}
			}

			validate_attribute_name(attribute);

			if (attribute.name === 'slot') {
				validate_slot_attribute(context, attribute, true);
			}
		}
	}

	context.next({
		...context.state,
		parent_element: null,
		component_slots: new Set()
	});
}

/**
 * @type {Visitors}
 */
const validation = {
	ExpressionStatement,
	MemberExpression,
	AssignmentExpression,
	BindDirective,
	ExportDefaultDeclaration,
	ConstTag,
	ImportDeclaration,
	LetDirective,
	RegularElement,
	RenderTag,
	IfBlock,
	EachBlock,
	AwaitBlock,
	KeyBlock(node, context) {
		validate_block_not_empty(node.fragment, context);
	},
	SnippetBlock(node, context) {
		validate_block_not_empty(node.body, context);

		for (const arg of node.parameters) {
			if (arg.type === 'RestElement') {
				e.snippet_invalid_rest_parameter(arg);
			}
		}

		context.next({ ...context.state, parent_element: null });

		const { path } = context;
		const parent = path.at(-2);
		if (!parent) return;

		if (
			parent.type === 'Component' &&
			parent.attributes.some(
				(attribute) =>
					(attribute.type === 'Attribute' || attribute.type === 'BindDirective') &&
					attribute.name === node.expression.name
			)
		) {
			e.snippet_shadowing_prop(node, node.expression.name);
		}

		if (node.expression.name !== 'children') return;

		if (
			parent.type === 'Component' ||
			parent.type === 'SvelteComponent' ||
			parent.type === 'SvelteSelf'
		) {
			if (
				parent.fragment.nodes.some(
					(node) => node.type !== 'SnippetBlock' && (node.type !== 'Text' || node.data.trim())
				)
			) {
				e.snippet_conflict(node);
			}
		}
	},
	StyleDirective(node) {
		if (node.modifiers.length > 1 || (node.modifiers.length && node.modifiers[0] !== 'important')) {
			e.style_directive_invalid_modifier(node);
		}
	},
	SvelteHead(node) {
		const attribute = node.attributes[0];
		if (attribute) {
			e.svelte_head_illegal_attribute(attribute);
		}
	},
	SvelteElement(node, context) {
		validate_element(node, context);
		context.next({
			...context.state,
			parent_element: null
		});
	},
	SvelteFragment(node, context) {
		const parent = context.path.at(-2);
		if (parent?.type !== 'Component' && parent?.type !== 'SvelteComponent') {
			e.svelte_fragment_invalid_placement(node);
		}

		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				if (attribute.name === 'slot') {
					validate_slot_attribute(context, attribute);
				}
			} else if (attribute.type !== 'LetDirective') {
				e.svelte_fragment_invalid_attribute(attribute);
			}
		}
	},
	SlotElement(node) {
		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				if (attribute.name === 'name') {
					if (!is_text_attribute(attribute)) {
						e.slot_element_invalid_name(attribute);
					}
					const slot_name = attribute.value[0].data;
					if (slot_name === 'default') {
						e.slot_element_invalid_name_default(attribute);
					}
				}
			} else if (attribute.type !== 'SpreadAttribute' && attribute.type !== 'LetDirective') {
				e.slot_element_invalid_attribute(attribute);
			}
		}
	},
	Component: validate_component,
	SvelteComponent: validate_component,
	SvelteSelf: validate_component,
	Text(node, context) {
		if (!node.parent) return;
		if (context.state.parent_element && regex_not_whitespace.test(node.data)) {
			if (!is_tag_valid_with_parent('#text', context.state.parent_element)) {
				e.node_invalid_placement(node, 'Text node', context.state.parent_element);
			}
		}
	},
	TitleElement(node) {
		const attribute = node.attributes[0];
		if (attribute) {
			e.title_illegal_attribute(attribute);
		}

		const child = node.fragment.nodes.find((n) => n.type !== 'Text' && n.type !== 'ExpressionTag');
		if (child) {
			e.title_invalid_content(child);
		}
	},
	UpdateExpression,
	ExpressionTag(node, context) {
		if (!node.parent) return;
		if (context.state.parent_element) {
			if (!is_tag_valid_with_parent('#text', context.state.parent_element)) {
				e.node_invalid_placement(node, '`{expression}`', context.state.parent_element);
			}
		}
	}
};

export const validation_legacy = merge(validation, a11y_validators, {
	VariableDeclarator(node, { state }) {
		ensure_no_module_import_conflict(node, state);

		if (node.init?.type !== 'CallExpression') return;

		const callee = node.init.callee;
		if (
			callee.type !== 'Identifier' ||
			(callee.name !== '$state' && callee.name !== '$derived' && callee.name !== '$props')
		) {
			return;
		}

		if (state.scope.get(callee.name)?.kind !== 'store_sub') {
			e.rune_invalid_usage(node.init, callee.name);
		}
	},
	AssignmentExpression(node, { state, path }) {
		const parent = path.at(-1);
		if (parent && parent.type === 'ConstTag') return;
		validate_assignment(node, node.left, state);
	},
	LabeledStatement,
	UpdateExpression(node, { state }) {
		validate_assignment(node, node.argument, state);
	}
});

/**
 * @param {VariableDeclarator} node
 * @param {AnalysisState} state
 */
function ensure_no_module_import_conflict(node, state) {
	const ids = extract_identifiers(node.id);
	for (const id of ids) {
		if (
			state.scope === state.analysis.instance.scope &&
			state.analysis.module.scope.get(id.name)?.declaration_kind === 'import'
		) {
			e.declaration_duplicate_module_import(node.id);
		}
	}
}

/**
 * @type {Visitors}
 */
export const validation_runes_js = {
	ImportDeclaration,
	ExportNamedDeclaration,
	CallExpression,
	VariableDeclarator(node, { state }) {
		const init = node.init;
		const rune = get_rune(init, state.scope);

		if (rune === null) return;

		const args = /** @type {import('estree').CallExpression} */ (init).arguments;

		if ((rune === '$derived' || rune === '$derived.by') && args.length !== 1) {
			e.rune_invalid_arguments_length(node, rune, 'exactly one argument');
		} else if (rune === '$state' && args.length > 1) {
			e.rune_invalid_arguments_length(node, rune, 'zero or one arguments');
		} else if (rune === '$props') {
			e.props_invalid_placement(node);
		} else if (rune === '$bindable') {
			e.bindable_invalid_location(node);
		}
	},
	AssignmentExpression(node, { state }) {
		validate_assignment(node, node.left, state);
	},
	UpdateExpression(node, { state }) {
		validate_assignment(node, node.argument, state);
	},
	ClassBody(node, context) {
		/** @type {string[]} */
		const private_derived_state = [];

		for (const definition of node.body) {
			if (
				definition.type === 'PropertyDefinition' &&
				definition.key.type === 'PrivateIdentifier' &&
				definition.value?.type === 'CallExpression'
			) {
				const rune = get_rune(definition.value, context.state.scope);
				if (rune === '$derived' || rune === '$derived.by') {
					private_derived_state.push(definition.key.name);
				}
			}
		}

		context.next({
			...context.state,
			private_derived_state
		});
	},
	ClassDeclaration(node, context) {
		// In modules, we allow top-level module scope only, in components, we allow the component scope,
		// which is function_depth of 1. With the exception of `new class` which is also not allowed at
		// component scope level either.
		const allowed_depth = context.state.ast_type === 'module' ? 0 : 1;

		if (context.state.scope.function_depth > allowed_depth) {
			w.perf_avoid_nested_class(node);
		}
	},
	NewExpression(node, context) {
		if (node.callee.type === 'ClassExpression' && context.state.scope.function_depth > 0) {
			w.perf_avoid_inline_class(node);
		}
	},
	Identifier(node, { path, state }) {
		let i = path.length;
		let parent = /** @type {Expression} */ (path[--i]);

		if (
			Runes.includes(/** @type {Runes[number]} */ (node.name)) &&
			is_reference(node, parent) &&
			state.scope.get(node.name) === null &&
			state.scope.get(node.name.slice(1)) === null
		) {
			/** @type {Expression} */
			let current = node;
			let name = node.name;

			while (parent.type === 'MemberExpression') {
				if (parent.computed) e.rune_invalid_computed_property(parent);
				name += `.${/** @type {Identifier} */ (parent.property).name}`;

				current = parent;
				parent = /** @type {Expression} */ (path[--i]);

				if (!Runes.includes(/** @type {Runes[number]} */ (name))) {
					if (name === '$effect.active') {
						e.rune_renamed(parent, '$effect.active', '$effect.tracking');
					}

					e.rune_invalid_name(parent, name);
				}
			}

			if (parent.type !== 'CallExpression') {
				e.rune_missing_parentheses(current);
			}
		}
	}
};

export const validation_runes = merge(validation, a11y_validators, {
	ImportDeclaration,
	LabeledStatement,
	ExportNamedDeclaration,
	CallExpression,
	EachBlock,
	IfBlock(node, { state, path }) {
		const parent = path.at(-1);
		const expected =
			path.at(-2)?.type === 'IfBlock' && parent?.type === 'Fragment' && parent.nodes.length === 1
				? ':'
				: '#';
		validate_opening_tag(node, state, expected);
	},
	AwaitBlock(node, { state }) {
		validate_opening_tag(node, state, '#');

		if (node.value) {
			const start = /** @type {number} */ (node.value.start);
			const match = state.analysis.source.substring(start - 10, start).match(/{(\s*):then\s+$/);
			if (match && match[1] !== '') {
				e.block_unexpected_character({ start: start - 10, end: start }, ':');
			}
		}

		if (node.error) {
			const start = /** @type {number} */ (node.error.start);
			const match = state.analysis.source.substring(start - 10, start).match(/{(\s*):catch\s+$/);
			if (match && match[1] !== '') {
				e.block_unexpected_character({ start: start - 10, end: start }, ':');
			}
		}
	},
	KeyBlock(node, { state }) {
		validate_opening_tag(node, state, '#');
	},
	SnippetBlock(node, { state }) {
		validate_opening_tag(node, state, '#');
	},
	ConstTag(node, { state }) {
		validate_opening_tag(node, state, '@');
	},
	HtmlTag(node, { state }) {
		validate_opening_tag(node, state, '@');
	},
	DebugTag(node, { state }) {
		validate_opening_tag(node, state, '@');
	},
	RenderTag(node, { state }) {
		validate_opening_tag(node, state, '@');
	},
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

			if (state.scope !== state.analysis.instance.scope) {
				e.props_invalid_placement(node);
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
	SlotElement(node, { state }) {
		if (!state.analysis.custom_element) {
			w.slot_element_deprecated(node);
		}
	},
	OnDirective(node, { path }) {
		const parent_type = path.at(-1)?.type;
		// Don't warn on component events; these might not be under the author's control so the warning would be unactionable
		if (parent_type === 'RegularElement' || parent_type === 'SvelteElement') {
			w.event_directive_deprecated(node, node.name);
		}
	},
	// TODO this is a code smell. need to refactor this stuff
	ClassBody: validation_runes_js.ClassBody,
	ClassDeclaration: validation_runes_js.ClassDeclaration,
	Identifier: validation_runes_js.Identifier,
	NewExpression: validation_runes_js.NewExpression
});
