/** @import { ArrowFunctionExpression, Expression, FunctionDeclaration, FunctionExpression, Node, Program, Super } from 'estree' */
/** @import { Root, Script, SvelteNode, ValidatedCompileOptions, ValidatedModuleCompileOptions } from '#compiler' */
/** @import { AnalysisState, Context, LegacyAnalysisState, Visitors } from './types' */
/** @import { Analysis, ComponentAnalysis, Js, ReactiveStatement, Template } from '../types' */
import is_reference from 'is-reference';
import { walk } from 'zimmerframe';
import * as e from '../../errors.js';
import * as w from '../../warnings.js';
import {
	extract_all_identifiers_from_expression,
	is_text_attribute,
	unwrap_optional,
	get_attribute_chunks
} from '../../utils/ast.js';
import * as b from '../../utils/builders.js';
import { MathMLElements, ReservedKeywords, Runes, SVGElements } from '../constants.js';
import { Scope, ScopeRoot, create_scopes, get_rune, set_scope } from '../scope.js';
import { merge } from '../visitors.js';
import check_graph_for_cycles from './utils/check_graph_for_cycles.js';
import { regex_starts_with_newline } from '../patterns.js';
import { create_attribute, is_element_node } from '../nodes.js';
import { namespace_mathml, namespace_svg } from '../../../constants.js';
import { should_proxy_or_freeze } from '../3-transform/client/utils.js';
import { analyze_css } from './css/css-analyze.js';
import { prune } from './css/css-prune.js';
import { hash } from '../../../utils.js';
import { warn_unused } from './css/css-warn.js';
import { extract_svelte_ignore } from '../../utils/extract_svelte_ignore.js';
import { ignore_map, ignore_stack, pop_ignore, push_ignore } from '../../state.js';
import { AssignmentExpression } from './visitors/AssignmentExpression.js';
import { Attribute } from './visitors/Attribute.js';
import { AwaitBlock } from './visitors/AwaitBlock.js';
import { BindDirective } from './visitors/BindDirective.js';
import { CallExpression } from './visitors/CallExpression.js';
import { ClassBody } from './visitors/ClassBody.js';
import { ClassDeclaration } from './visitors/ClassDeclaration.js';
import { ClassDirective } from './visitors/ClassDirective.js';
import { Component } from './visitors/Component.js';
import { ConstTag } from './visitors/ConstTag.js';
import { DebugTag } from './visitors/DebugTag.js';
import { EachBlock } from './visitors/EachBlock.js';
import { ExportDefaultDeclaration } from './visitors/ExportDefaultDeclaration.js';
import { ExportNamedDeclaration } from './visitors/ExportNamedDeclaration.js';
import { ExportSpecifier } from './visitors/ExportSpecifier.js';
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
import { SpreadAttribute } from './visitors/SpreadAttribute.js';
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
import { determine_element_spread } from './visitors/shared/element.js';

/**
 * @type {Visitors}
 */
const visitors = {
	AssignmentExpression,
	Attribute,
	AwaitBlock,
	BindDirective,
	CallExpression,
	ClassBody,
	ClassDeclaration,
	ClassDirective,
	Component,
	ConstTag,
	DebugTag,
	EachBlock,
	ExportDefaultDeclaration,
	ExportNamedDeclaration,
	ExportSpecifier,
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
	SpreadAttribute,
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

/**
 * @param {Script | null} script
 * @param {ScopeRoot} root
 * @param {boolean} allow_reactive_declarations
 * @param {Scope | null} parent
 * @returns {Js}
 */
function js(script, root, allow_reactive_declarations, parent) {
	/** @type {Program} */
	const ast = script?.content ?? {
		type: 'Program',
		sourceType: 'module',
		start: -1,
		end: -1,
		body: []
	};

	const { scope, scopes } = create_scopes(ast, root, allow_reactive_declarations, parent);

	return { ast, scope, scopes };
}

/**
 * @param {string} filename
 */
function get_component_name(filename) {
	const parts = filename.split(/[/\\]/);
	const basename = /** @type {string} */ (parts.pop());
	const last_dir = /** @type {string} */ (parts.at(-1));
	let name = basename.replace('.svelte', '');
	if (name === 'index' && last_dir && last_dir !== 'src') {
		name = last_dir;
	}
	return name[0].toUpperCase() + name.slice(1);
}

/**
 * @param {Program} ast
 * @param {ValidatedModuleCompileOptions} options
 * @returns {Analysis}
 */
export function analyze_module(ast, options) {
	const { scope, scopes } = create_scopes(ast, new ScopeRoot(), false, null);

	for (const [name, references] of scope.references) {
		if (name[0] !== '$' || ReservedKeywords.includes(name)) continue;
		if (name === '$' || name[1] === '$') {
			e.global_reference_invalid(references[0].node, name);
		}
	}

	walk(
		/** @type {Node} */ (ast),
		{ scope, analysis: { runes: true } },
		// @ts-expect-error TODO clean this mess up
		merge(set_scope(scopes), visitors)
	);

	return {
		module: { ast, scope, scopes },
		name: options.filename || 'module',
		accessors: false,
		runes: true,
		immutable: true
	};
}

/**
 * @param {Root} root
 * @param {string} source
 * @param {ValidatedCompileOptions} options
 * @returns {ComponentAnalysis}
 */
export function analyze_component(root, source, options) {
	const scope_root = new ScopeRoot();

	const module = js(root.module, scope_root, false, null);
	const instance = js(root.instance, scope_root, true, module.scope);

	const { scope, scopes } = create_scopes(root.fragment, scope_root, false, instance.scope);

	/** @type {Template} */
	const template = { ast: root.fragment, scope, scopes };

	// create synthetic bindings for store subscriptions
	for (const [name, references] of module.scope.references) {
		if (name[0] !== '$' || ReservedKeywords.includes(name)) continue;
		if (name === '$' || name[1] === '$') {
			e.global_reference_invalid(references[0].node, name);
		}

		const store_name = name.slice(1);
		const declaration = instance.scope.get(store_name);

		// If we're not in legacy mode through the compiler option, assume the user
		// is referencing a rune and not a global store.
		if (
			options.runes === false ||
			!Runes.includes(/** @type {any} */ (name)) ||
			(declaration !== null &&
				// const state = $state(0) is valid
				(get_rune(declaration.initial, instance.scope) === null ||
					// rune-line names received as props are valid too (but we have to protect against $props as store)
					(store_name !== 'props' && get_rune(declaration.initial, instance.scope) === '$props')) &&
				// allow `import { derived } from 'svelte/store'` in the same file as `const x = $derived(..)` because one is not a subscription to the other
				!(
					name === '$derived' &&
					declaration.initial?.type === 'ImportDeclaration' &&
					declaration.initial.source.value === 'svelte/store'
				))
		) {
			let is_nested_store_subscription_node = undefined;
			search: for (const reference of references) {
				for (let i = reference.path.length - 1; i >= 0; i--) {
					const scope =
						scopes.get(reference.path[i]) ||
						module.scopes.get(reference.path[i]) ||
						instance.scopes.get(reference.path[i]);
					if (scope) {
						const owner = scope?.owner(store_name);
						if (!!owner && owner !== module.scope && owner !== instance.scope) {
							is_nested_store_subscription_node = reference.node;
							break search;
						}
						break;
					}
				}
			}

			if (is_nested_store_subscription_node) {
				e.store_invalid_scoped_subscription(is_nested_store_subscription_node);
			}

			if (options.runes !== false) {
				if (declaration === null && /[a-z]/.test(store_name[0])) {
					e.global_reference_invalid(references[0].node, name);
				} else if (declaration !== null && Runes.includes(/** @type {any} */ (name))) {
					for (const { node, path } of references) {
						if (path.at(-1)?.type === 'CallExpression') {
							w.store_rune_conflict(node, store_name);
						}
					}
				}
			}

			if (module.ast) {
				for (const { node, path } of references) {
					// if the reference is inside context="module", error. this is a bit hacky but it works
					if (
						/** @type {number} */ (node.start) > /** @type {number} */ (module.ast.start) &&
						/** @type {number} */ (node.end) < /** @type {number} */ (module.ast.end) &&
						// const state = $state(0) is valid
						get_rune(/** @type {Node} */ (path.at(-1)), module.scope) === null
					) {
						e.store_invalid_subscription(node);
					}
				}
			}

			const binding = instance.scope.declare(b.id(name), 'store_sub', 'synthetic');
			binding.references = references;
			instance.scope.references.set(name, references);
			module.scope.references.delete(name);
		}
	}

	const component_name = get_component_name(options.filename ?? 'Component');

	const runes =
		options.runes ??
		Array.from(module.scope.references).some(([name]) => Runes.includes(/** @type {any} */ (name)));

	// TODO remove all the ?? stuff, we don't need it now that we're validating the config
	/** @type {ComponentAnalysis} */
	const analysis = {
		name: module.scope.generate(options.name ?? component_name),
		root: scope_root,
		module,
		instance,
		template,
		elements: [],
		runes,
		immutable: runes || options.immutable,
		exports: [],
		uses_props: false,
		uses_rest_props: false,
		uses_slots: false,
		uses_component_bindings: false,
		uses_render_tags: false,
		needs_context: false,
		needs_props: false,
		event_directive_node: null,
		uses_event_attributes: false,
		custom_element: options.customElementOptions ?? options.customElement,
		inject_styles: options.css === 'injected' || options.customElement,
		accessors: options.customElement
			? true
			: (runes ? false : !!options.accessors) ||
				// because $set method needs accessors
				options.compatibility?.componentApi === 4,
		reactive_statements: new Map(),
		binding_groups: new Map(),
		slot_names: new Map(),
		top_level_snippets: [],
		css: {
			ast: root.css,
			hash: root.css
				? options.cssHash({
						css: root.css.content.styles,
						filename: options.filename ?? '<unknown>',
						name: component_name,
						hash
					})
				: '',
			keyframes: []
		},
		source
	};

	if (root.options) {
		for (const attribute of root.options.attributes) {
			if (attribute.name === 'accessors') {
				w.options_deprecated_accessors(attribute);
			}

			if (attribute.name === 'customElement' && !options.customElement) {
				w.options_missing_custom_element(attribute);
			}

			if (attribute.name === 'immutable') {
				w.options_deprecated_immutable(attribute);
			}
		}
	}

	if (analysis.runes) {
		const props_refs = module.scope.references.get('$$props');
		if (props_refs) {
			e.legacy_props_invalid(props_refs[0].node);
		}

		const rest_props_refs = module.scope.references.get('$$restProps');
		if (rest_props_refs) {
			e.legacy_rest_props_invalid(rest_props_refs[0].node);
		}

		for (const { ast, scope, scopes } of [module, instance, template]) {
			/** @type {AnalysisState} */
			const state = {
				scope,
				analysis,
				options,
				ast_type: ast === instance.ast ? 'instance' : ast === template.ast ? 'template' : 'module',
				parent_element: null,
				has_props_rune: false,
				component_slots: new Set(),
				expression: null,
				render_tag: null,
				private_derived_state: [],
				function_depth: scope.function_depth
			};

			walk(
				/** @type {SvelteNode} */ (ast),
				state,
				merge(set_scope(scopes), visitors, common_visitors)
			);
		}

		// warn on any nonstate declarations that are a) reassigned and b) referenced in the template
		for (const scope of [module.scope, instance.scope]) {
			outer: for (const [name, binding] of scope.declarations) {
				if (binding.kind === 'normal' && binding.reassigned) {
					inner: for (const { path } of binding.references) {
						if (path[0].type !== 'Fragment') continue;
						for (let i = 1; i < path.length; i += 1) {
							const type = path[i].type;
							if (
								type === 'FunctionDeclaration' ||
								type === 'FunctionExpression' ||
								type === 'ArrowFunctionExpression'
							) {
								continue inner;
							}
							// bind:this doesn't need to be a state reference if it will never change
							if (
								type === 'BindDirective' &&
								/** @type {BindDirective} */ (path[i]).name === 'this'
							) {
								for (let j = i - 1; j >= 0; j -= 1) {
									const type = path[j].type;
									if (
										type === 'IfBlock' ||
										type === 'EachBlock' ||
										type === 'AwaitBlock' ||
										type === 'KeyBlock'
									) {
										w.non_reactive_update(binding.node, name);
										continue outer;
									}
								}
								continue inner;
							}
						}

						w.non_reactive_update(binding.node, name);
						continue outer;
					}
				}
			}
		}
	} else {
		instance.scope.declare(b.id('$$props'), 'rest_prop', 'synthetic');
		instance.scope.declare(b.id('$$restProps'), 'rest_prop', 'synthetic');

		for (const { ast, scope, scopes } of [module, instance, template]) {
			/** @type {LegacyAnalysisState} */
			const state = {
				scope,
				analysis,
				options,
				parent_element: null,
				has_props_rune: false,
				ast_type: ast === instance.ast ? 'instance' : ast === template.ast ? 'template' : 'module',
				instance_scope: instance.scope,
				reactive_statement: null,
				reactive_statements: analysis.reactive_statements,
				component_slots: new Set(),
				expression: null,
				render_tag: null,
				private_derived_state: [],
				function_depth: scope.function_depth
			};

			walk(
				/** @type {SvelteNode} */ (ast),
				state,
				// @ts-expect-error TODO
				merge(set_scope(scopes), visitors, common_visitors)
			);
		}

		for (const [name, binding] of instance.scope.declarations) {
			if (
				(binding.kind === 'prop' || binding.kind === 'bindable_prop') &&
				binding.node.name !== '$$props'
			) {
				const references = binding.references.filter(
					(r) => r.node !== binding.node && r.path.at(-1)?.type !== 'ExportSpecifier'
				);
				if (!references.length && !instance.scope.declarations.has(`$${name}`)) {
					w.export_let_unused(binding.node, name);
				}
			}
		}

		analysis.reactive_statements = order_reactive_statements(analysis.reactive_statements);
	}

	if (analysis.event_directive_node && analysis.uses_event_attributes) {
		e.mixed_event_handler_syntaxes(
			analysis.event_directive_node,
			analysis.event_directive_node.name
		);
	}

	if (analysis.uses_render_tags && (analysis.uses_slots || analysis.slot_names.size > 0)) {
		const pos = analysis.slot_names.values().next().value ?? analysis.source.indexOf('$$slot');
		e.slot_snippet_conflict(pos);
	}

	if (analysis.css.ast) {
		analyze_css(analysis.css.ast, analysis);

		// mark nodes as scoped/unused/empty etc
		for (const element of analysis.elements) {
			prune(analysis.css.ast, element);
		}

		const { comment } = analysis.css.ast.content;
		const should_ignore_unused =
			comment &&
			extract_svelte_ignore(comment.start, comment.data, analysis.runes).includes(
				'css_unused_selector'
			);

		if (!should_ignore_unused) {
			warn_unused(analysis.css.ast);
		}

		outer: for (const element of analysis.elements) {
			if (element.metadata.scoped) {
				// Dynamic elements in dom mode always use spread for attributes and therefore shouldn't have a class attribute added to them
				// TODO this happens during the analysis phase, which shouldn't know anything about client vs server
				if (element.type === 'SvelteElement' && options.generate === 'client') continue;

				/** @type {Attribute | undefined} */
				let class_attribute = undefined;

				for (const attribute of element.attributes) {
					if (attribute.type === 'SpreadAttribute') {
						// The spread method appends the hash to the end of the class attribute on its own
						continue outer;
					}

					if (attribute.type !== 'Attribute') continue;
					if (attribute.name.toLowerCase() !== 'class') continue;

					class_attribute = attribute;
				}

				if (class_attribute && class_attribute.value !== true) {
					if (is_text_attribute(class_attribute)) {
						class_attribute.value[0].data += ` ${analysis.css.hash}`;
					} else {
						/** @type {Text} */
						const css_text = {
							type: 'Text',
							data: ` ${analysis.css.hash}`,
							raw: ` ${analysis.css.hash}`,
							start: -1,
							end: -1,
							parent: null
						};

						if (Array.isArray(class_attribute.value)) {
							class_attribute.value.push(css_text);
						} else {
							class_attribute.value = [class_attribute.value, css_text];
						}
					}
				} else {
					element.attributes.push(
						create_attribute('class', -1, -1, [
							{
								type: 'Text',
								data: analysis.css.hash,
								raw: analysis.css.hash,
								parent: null,
								start: -1,
								end: -1
							}
						])
					);
				}
			}
		}
	}

	// TODO
	// analysis.stylesheet.warn_on_unused_selectors(analysis);

	return analysis;
}

/**
 * @param {CallExpression} node
 * @param {Context} context
 * @returns {boolean}
 */
function is_known_safe_call(node, context) {
	const callee = node.callee;

	// String / Number / BigInt / Boolean casting calls
	if (callee.type === 'Identifier') {
		const name = callee.name;
		const binding = context.state.scope.get(name);
		if (
			binding === null &&
			(name === 'BigInt' || name === 'String' || name === 'Number' || name === 'Boolean')
		) {
			return true;
		}
	}

	// TODO add more cases

	return false;
}

/**
 * @param {ArrowFunctionExpression | FunctionExpression | FunctionDeclaration} node
 * @param {Context} context
 */
const function_visitor = (node, context) => {
	// TODO retire this in favour of a more general solution based on bindings
	node.metadata = {
		// module context -> already hoisted
		hoistable: context.state.ast_type === 'module' ? 'impossible' : false,
		hoistable_params: [],
		scope: context.state.scope
	};

	context.next({
		...context.state,
		function_depth: context.state.function_depth + 1
	});
};

/**
 * A 'safe' identifier means that the `foo` in `foo.bar` or `foo()` will not
 * call functions that require component context to exist
 * @param {Expression | Super} expression
 * @param {Scope} scope
 */
function is_safe_identifier(expression, scope) {
	let node = expression;
	while (node.type === 'MemberExpression') node = node.object;

	if (node.type !== 'Identifier') return false;

	const binding = scope.get(node.name);
	if (!binding) return true;

	if (binding.kind === 'store_sub') {
		return is_safe_identifier({ name: node.name.slice(1), type: 'Identifier' }, scope);
	}

	return (
		binding.declaration_kind !== 'import' &&
		binding.kind !== 'prop' &&
		binding.kind !== 'bindable_prop' &&
		binding.kind !== 'rest_prop'
	);
}

/** @type {Visitors} */
const common_visitors = {
	_(node, { state, next, path }) {
		ignore_map.set(node, structuredClone(ignore_stack));
		const parent = path.at(-1);
		if (parent?.type === 'Fragment' && node.type !== 'Comment' && node.type !== 'Text') {
			const idx = parent.nodes.indexOf(/** @type {any} */ (node));
			/** @type {string[]} */
			const ignores = [];
			for (let i = idx - 1; i >= 0; i--) {
				const prev = parent.nodes[i];
				if (prev.type === 'Comment') {
					ignores.push(
						...extract_svelte_ignore(
							prev.start + 4 /* '<!--'.length */,
							prev.data,
							state.analysis.runes
						)
					);
				} else if (prev.type !== 'Text') {
					break;
				}
			}

			if (ignores.length > 0) {
				push_ignore(ignores);
				ignore_map.set(node, structuredClone(ignore_stack));
				next();
				pop_ignore();
			}
		} else {
			const comments = /** @type {any} */ (node).leadingComments;
			if (comments) {
				/** @type {string[]} */
				const ignores = [];
				for (const comment of comments) {
					ignores.push(
						...extract_svelte_ignore(
							comment.start + 2 /* '//'.length */,
							comment.value,
							state.analysis.runes
						)
					);
				}
				if (ignores.length > 0) {
					push_ignore(ignores);
					ignore_map.set(node, structuredClone(ignore_stack));
					next();
					pop_ignore();
				}
			}
		}
	},
	StyleDirective(node, context) {
		if (node.value === true) {
			const binding = context.state.scope.get(node.name);
			if (binding?.kind !== 'normal') {
				node.metadata.expression.has_state = true;
			}
		} else {
			context.next();

			for (const chunk of get_attribute_chunks(node.value)) {
				if (chunk.type !== 'ExpressionTag') continue;

				node.metadata.expression.has_state ||= chunk.metadata.expression.has_state;
				node.metadata.expression.has_call ||= chunk.metadata.expression.has_call;
			}
		}
	},
	ExpressionTag(node, context) {
		context.next({ ...context.state, expression: node.metadata.expression });
	},
	Identifier(node, context) {
		const parent = /** @type {Node} */ (context.path.at(-1));
		if (!is_reference(node, parent)) return;

		if (node.name === '$$slots') {
			context.state.analysis.uses_slots = true;
			return;
		}

		// If we are using arguments outside of a function, then throw an error
		if (
			node.name === 'arguments' &&
			context.path.every((n) => n.type !== 'FunctionDeclaration' && n.type !== 'FunctionExpression')
		) {
			e.invalid_arguments_usage(node);
		}

		const binding = context.state.scope.get(node.name);

		if (binding && context.state.expression) {
			context.state.expression.dependencies.add(binding);

			if (binding.kind !== 'normal') {
				context.state.expression.has_state = true;
			}
		}

		// if no binding, means some global variable
		if (binding && binding.kind !== 'normal') {
			if (context.state.expression) {
				context.state.expression.has_state = true;
			}

			// TODO it would be better to just bail out when we hit the ExportSpecifier node but that's
			// not currently possibly because of our visitor merging, which I desperately want to nuke
			const is_export_specifier =
				/** @type {SvelteNode} */ (context.path.at(-1)).type === 'ExportSpecifier';

			if (
				context.state.analysis.runes &&
				node !== binding.node &&
				context.state.function_depth === binding.scope.function_depth &&
				// If we have $state that can be proxied or frozen and isn't re-assigned, then that means
				// it's likely not using a primitive value and thus this warning isn't that helpful.
				((binding.kind === 'state' &&
					(binding.reassigned ||
						(binding.initial?.type === 'CallExpression' &&
							binding.initial.arguments.length === 1 &&
							binding.initial.arguments[0].type !== 'SpreadElement' &&
							!should_proxy_or_freeze(binding.initial.arguments[0], context.state.scope)))) ||
					binding.kind === 'frozen_state' ||
					binding.kind === 'derived') &&
				!is_export_specifier &&
				// We're only concerned with reads here
				(parent.type !== 'AssignmentExpression' || parent.left !== node) &&
				parent.type !== 'UpdateExpression'
			) {
				w.state_referenced_locally(node);
			}
		}
	},
	CallExpression(node, context) {
		const { expression, render_tag } = context.state;

		if (expression && !is_known_safe_call(node, context)) {
			expression.has_call = true;
			expression.has_state = true;
		}

		if (render_tag) {
			// Find out which of the render tag arguments contains this call expression
			const arg_idx = unwrap_optional(render_tag.expression).arguments.findIndex(
				(arg) => arg === node || context.path.includes(arg)
			);

			// -1 if this is the call expression of the render tag itself
			if (arg_idx !== -1) {
				render_tag.metadata.args_with_call_expression.add(arg_idx);
			}
		}

		const callee = node.callee;
		const rune = get_rune(node, context.state.scope);

		if (callee.type === 'Identifier') {
			const binding = context.state.scope.get(callee.name);

			if (binding !== null) {
				binding.is_called = true;
			}

			if (rune === '$derived') {
				// special case — `$derived(foo)` is treated as `$derived(() => foo)`
				// for the purposes of identifying static state references
				context.next({
					...context.state,
					function_depth: context.state.function_depth + 1
				});

				return;
			}
		}

		if (rune === '$effect' || rune === '$effect.pre') {
			// `$effect` needs context because Svelte needs to know whether it should re-run
			// effects that invalidate themselves, and that's determined by whether we're in runes mode
			context.state.analysis.needs_context = true;
		} else if (rune === null) {
			if (!is_safe_identifier(callee, context.state.scope)) {
				context.state.analysis.needs_context = true;
			}
		}

		context.next();
	},
	MemberExpression(node, context) {
		if (context.state.expression) {
			context.state.expression.has_state = true;
		}

		if (!is_safe_identifier(node, context.state.scope)) {
			context.state.analysis.needs_context = true;
		}

		context.next();
	},
	OnDirective(node, { state, path, next }) {
		const parent = path.at(-1);
		if (parent?.type === 'SvelteElement' || parent?.type === 'RegularElement') {
			state.analysis.event_directive_node ??= node;
		}
		next({ ...state, expression: node.metadata.expression });
	},
	BindDirective(node, context) {
		let i = context.path.length;
		while (i--) {
			const parent = context.path[i];
			if (
				parent.type === 'Component' ||
				parent.type === 'SvelteComponent' ||
				parent.type === 'SvelteSelf'
			) {
				if (node.name !== 'this') {
					context.state.analysis.uses_component_bindings = true;
				}
				break;
			} else if (is_element_node(parent)) {
				break;
			}
		}

		if (node.name !== 'group') return;

		// Traverse the path upwards and find all EachBlocks who are (indirectly) contributing to bind:group,
		// i.e. one of their declarations is referenced in the binding. This allows group bindings to work
		// correctly when referencing a variable declared in an EachBlock by using the index of the each block
		// entries as keys.
		i = context.path.length;
		const each_blocks = [];
		const [keypath, expression_ids] = extract_all_identifiers_from_expression(node.expression);
		let ids = expression_ids;
		while (i--) {
			const parent = context.path[i];
			if (parent.type === 'EachBlock') {
				const references = ids.filter((id) => parent.metadata.declarations.has(id.name));
				if (references.length > 0) {
					parent.metadata.contains_group_binding = true;
					for (const binding of parent.metadata.references) {
						binding.mutated = true;
					}
					each_blocks.push(parent);
					ids = ids.filter((id) => !references.includes(id));
					ids.push(...extract_all_identifiers_from_expression(parent.expression)[1]);
				}
			}
		}

		// The identifiers that make up the binding expression form they key for the binding group.
		// If the same identifiers in the same order are used in another bind:group, they will be in the same group.
		// (there's an edge case where `bind:group={a[i]}` will be in a different group than `bind:group={a[j]}` even when i == j,
		//  but this is a limitation of the current static analysis we do; it also never worked in Svelte 4)
		const bindings = expression_ids.map((id) => context.state.scope.get(id.name));
		let group_name;
		outer: for (const [[key, b], group] of context.state.analysis.binding_groups) {
			if (b.length !== bindings.length || key !== keypath) continue;
			for (let i = 0; i < bindings.length; i++) {
				if (bindings[i] !== b[i]) continue outer;
			}
			group_name = group;
		}

		if (!group_name) {
			group_name = context.state.scope.root.unique('binding_group');
			context.state.analysis.binding_groups.set([keypath, bindings], group_name);
		}

		node.metadata = {
			binding_group_name: group_name,
			parent_each_blocks: each_blocks
		};
	},
	ArrowFunctionExpression: function_visitor,
	FunctionExpression: function_visitor,
	FunctionDeclaration: function_visitor,
	RegularElement(node, context) {
		if (context.state.options.namespace !== 'foreign') {
			if (SVGElements.includes(node.name)) node.metadata.svg = true;
			else if (MathMLElements.includes(node.name)) node.metadata.mathml = true;
		}

		determine_element_spread(node);

		// Special case: Move the children of <textarea> into a value attribute if they are dynamic
		if (
			context.state.options.namespace !== 'foreign' &&
			node.name === 'textarea' &&
			node.fragment.nodes.length > 0
		) {
			if (node.fragment.nodes.length > 1 || node.fragment.nodes[0].type !== 'Text') {
				const first = node.fragment.nodes[0];
				if (first.type === 'Text') {
					// The leading newline character needs to be stripped because of a qirk:
					// It is ignored by browsers if the tag and its contents are set through
					// innerHTML, but we're now setting it through the value property at which
					// point it is _not_ ignored, so we need to strip it ourselves.
					// see https://html.spec.whatwg.org/multipage/syntax.html#element-restrictions
					// see https://html.spec.whatwg.org/multipage/grouping-content.html#the-pre-element
					first.data = first.data.replace(regex_starts_with_newline, '');
					first.raw = first.raw.replace(regex_starts_with_newline, '');
				}

				node.attributes.push(
					create_attribute(
						'value',
						/** @type {import('#compiler').Text} */ (node.fragment.nodes.at(0)).start,
						/** @type {import('#compiler').Text} */ (node.fragment.nodes.at(-1)).end,
						// @ts-ignore
						node.fragment.nodes
					)
				);

				node.fragment.nodes = [];
			}
		}

		// Special case: single expression tag child of option element -> add "fake" attribute
		// to ensure that value types are the same (else for example numbers would be strings)
		if (
			context.state.options.namespace !== 'foreign' &&
			node.name === 'option' &&
			node.fragment.nodes?.length === 1 &&
			node.fragment.nodes[0].type === 'ExpressionTag' &&
			!node.attributes.some(
				(attribute) => attribute.type === 'Attribute' && attribute.name === 'value'
			)
		) {
			const child = node.fragment.nodes[0];
			node.attributes.push(create_attribute('value', child.start, child.end, [child]));
		}

		context.state.analysis.elements.push(node);
	},
	SvelteElement(node, context) {
		context.state.analysis.elements.push(node);

		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				if (attribute.name === 'xmlns' && is_text_attribute(attribute)) {
					node.metadata.svg = attribute.value[0].data === namespace_svg;
					node.metadata.mathml = attribute.value[0].data === namespace_mathml;
					return;
				}
			}
		}

		for (let i = context.path.length - 1; i >= 0; i--) {
			const ancestor = context.path[i];
			if (
				ancestor.type === 'Component' ||
				ancestor.type === 'SvelteComponent' ||
				ancestor.type === 'SvelteFragment' ||
				ancestor.type === 'SnippetBlock'
			) {
				// Inside a slot or a snippet -> this resets the namespace, so assume the component namespace
				node.metadata.svg = context.state.options.namespace === 'svg';
				node.metadata.mathml = context.state.options.namespace === 'mathml';
				return;
			}
			if (ancestor.type === 'SvelteElement' || ancestor.type === 'RegularElement') {
				node.metadata.svg =
					ancestor.type === 'RegularElement' && ancestor.name === 'foreignObject'
						? false
						: ancestor.metadata.svg;
				node.metadata.mathml =
					ancestor.type === 'RegularElement' && ancestor.name === 'foreignObject'
						? false
						: ancestor.metadata.mathml;
				return;
			}
		}
	},
	Component(node, context) {
		const binding = context.state.scope.get(
			node.name.includes('.') ? node.name.slice(0, node.name.indexOf('.')) : node.name
		);

		node.metadata.dynamic = binding !== null && binding.kind !== 'normal';
	},
	RenderTag(node, context) {
		context.next({ ...context.state, render_tag: node });
	},
	EachBlock(node) {
		if (node.key) {
			// treat `{#each items as item, i (i)}` as a normal indexed block, everything else as keyed
			node.metadata.keyed =
				node.key.type !== 'Identifier' || !node.index || node.key.name !== node.index;
		}
	}
};

/**
 * @param {Map<LabeledStatement, ReactiveStatement>} unsorted_reactive_declarations
 */
function order_reactive_statements(unsorted_reactive_declarations) {
	/** @typedef {[LabeledStatement, ReactiveStatement]} Tuple */

	/** @type {Map<string, Array<Tuple>>} */
	const lookup = new Map();

	for (const [node, declaration] of unsorted_reactive_declarations) {
		for (const binding of declaration.assignments) {
			const statements = lookup.get(binding.node.name) ?? [];
			statements.push([node, declaration]);
			lookup.set(binding.node.name, statements);
		}
	}

	/** @type {Array<[string, string]>} */
	const edges = [];

	for (const [, { assignments, dependencies }] of unsorted_reactive_declarations) {
		for (const assignment of assignments) {
			for (const dependency of dependencies) {
				if (!assignments.has(dependency)) {
					edges.push([assignment.node.name, dependency.node.name]);
				}
			}
		}
	}

	const cycle = check_graph_for_cycles(edges);
	if (cycle?.length) {
		const declaration = /** @type {Tuple[]} */ (lookup.get(cycle[0]))[0];
		e.reactive_declaration_cycle(declaration[0], cycle.join(' → '));
	}

	// We use a map and take advantage of the fact that the spec says insertion order is preserved when iterating
	/** @type {Map<LabeledStatement, ReactiveStatement>} */
	const reactive_declarations = new Map();

	/**
	 *
	 * @param {LabeledStatement} node
	 * @param {ReactiveStatement} declaration
	 * @returns
	 */
	const add_declaration = (node, declaration) => {
		if ([...reactive_declarations.values()].includes(declaration)) return;

		for (const binding of declaration.dependencies) {
			if (declaration.assignments.has(binding)) continue;
			for (const [node, earlier] of lookup.get(binding.node.name) ?? []) {
				add_declaration(node, earlier);
			}
		}

		reactive_declarations.set(node, declaration);
	};

	for (const [node, declaration] of unsorted_reactive_declarations) {
		add_declaration(node, declaration);
	}

	return reactive_declarations;
}
