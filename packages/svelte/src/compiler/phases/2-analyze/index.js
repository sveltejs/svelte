/** @import { Expression, Node, Program } from 'estree' */
/** @import { Binding, AST, ValidatedCompileOptions, ValidatedModuleCompileOptions } from '#compiler' */
/** @import { AnalysisState, Visitors } from './types' */
/** @import { Analysis, ComponentAnalysis, Js, ReactiveStatement, Template } from '../types' */
import { walk } from 'zimmerframe';
import { parse } from '../1-parse/acorn.js';
import * as e from '../../errors.js';
import * as w from '../../warnings.js';
import { extract_identifiers } from '../../utils/ast.js';
import * as b from '#compiler/builders';
import { Scope, ScopeRoot, create_scopes, get_rune, set_scope } from '../scope.js';
import check_graph_for_cycles from './utils/check_graph_for_cycles.js';
import { create_attribute, is_custom_element_node } from '../nodes.js';
import { analyze_css } from './css/css-analyze.js';
import { prune } from './css/css-prune.js';
import { hash, is_rune } from '../../../utils.js';
import { warn_unused } from './css/css-warn.js';
import { extract_svelte_ignore } from '../../utils/extract_svelte_ignore.js';
import { ignore_map, ignore_stack, pop_ignore, push_ignore } from '../../state.js';
import { ArrowFunctionExpression } from './visitors/ArrowFunctionExpression.js';
import { AssignmentExpression } from './visitors/AssignmentExpression.js';
import { AttachTag } from './visitors/AttachTag.js';
import { Attribute } from './visitors/Attribute.js';
import { AwaitBlock } from './visitors/AwaitBlock.js';
import { AwaitExpression } from './visitors/AwaitExpression.js';
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
import { Fragment } from './visitors/Fragment.js';
import { FunctionDeclaration } from './visitors/FunctionDeclaration.js';
import { FunctionExpression } from './visitors/FunctionExpression.js';
import { HtmlTag } from './visitors/HtmlTag.js';
import { Identifier } from './visitors/Identifier.js';
import { IfBlock } from './visitors/IfBlock.js';
import { ImportDeclaration } from './visitors/ImportDeclaration.js';
import { KeyBlock } from './visitors/KeyBlock.js';
import { LabeledStatement } from './visitors/LabeledStatement.js';
import { LetDirective } from './visitors/LetDirective.js';
import { Literal } from './visitors/Literal.js';
import { MemberExpression } from './visitors/MemberExpression.js';
import { NewExpression } from './visitors/NewExpression.js';
import { OnDirective } from './visitors/OnDirective.js';
import { PropertyDefinition } from './visitors/PropertyDefinition.js';
import { RegularElement } from './visitors/RegularElement.js';
import { RenderTag } from './visitors/RenderTag.js';
import { SlotElement } from './visitors/SlotElement.js';
import { SnippetBlock } from './visitors/SnippetBlock.js';
import { SpreadAttribute } from './visitors/SpreadAttribute.js';
import { SpreadElement } from './visitors/SpreadElement.js';
import { StyleDirective } from './visitors/StyleDirective.js';
import { SvelteBody } from './visitors/SvelteBody.js';
import { SvelteComponent } from './visitors/SvelteComponent.js';
import { SvelteDocument } from './visitors/SvelteDocument.js';
import { SvelteElement } from './visitors/SvelteElement.js';
import { SvelteFragment } from './visitors/SvelteFragment.js';
import { SvelteHead } from './visitors/SvelteHead.js';
import { SvelteSelf } from './visitors/SvelteSelf.js';
import { SvelteWindow } from './visitors/SvelteWindow.js';
import { SvelteBoundary } from './visitors/SvelteBoundary.js';
import { TaggedTemplateExpression } from './visitors/TaggedTemplateExpression.js';
import { TemplateElement } from './visitors/TemplateElement.js';
import { Text } from './visitors/Text.js';
import { TitleElement } from './visitors/TitleElement.js';
import { TransitionDirective } from './visitors/TransitionDirective.js';
import { UpdateExpression } from './visitors/UpdateExpression.js';
import { UseDirective } from './visitors/UseDirective.js';
import { VariableDeclarator } from './visitors/VariableDeclarator.js';
import is_reference from 'is-reference';
import { mark_subtree_dynamic } from './visitors/shared/fragment.js';
import * as state from '../../state.js';

/**
 * @type {Visitors}
 */
const visitors = {
	_(node, { state, next, path }) {
		const parent = path.at(-1);

		/** @type {string[]} */
		const ignores = [];

		if (parent?.type === 'Fragment' && node.type !== 'Comment' && node.type !== 'Text') {
			const idx = parent.nodes.indexOf(/** @type {any} */ (node));

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
		} else {
			const comments = /** @type {any} */ (node).leadingComments;

			if (comments) {
				for (const comment of comments) {
					ignores.push(
						...extract_svelte_ignore(
							comment.start + 2 /* '//'.length */,
							comment.value,
							state.analysis.runes
						)
					);
				}
			}
		}

		if (ignores.length > 0) {
			push_ignore(ignores);
		}

		ignore_map.set(node, structuredClone(ignore_stack));

		const scope = state.scopes.get(node);
		next(scope !== undefined && scope !== state.scope ? { ...state, scope } : state);

		if (ignores.length > 0) {
			pop_ignore();
		}
	},
	ArrowFunctionExpression,
	AssignmentExpression,
	AttachTag,
	Attribute,
	AwaitBlock,
	AwaitExpression,
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
	Fragment,
	FunctionDeclaration,
	FunctionExpression,
	HtmlTag,
	Identifier,
	IfBlock,
	ImportDeclaration,
	KeyBlock,
	LabeledStatement,
	LetDirective,
	Literal,
	MemberExpression,
	NewExpression,
	OnDirective,
	PropertyDefinition,
	RegularElement,
	RenderTag,
	SlotElement,
	SnippetBlock,
	SpreadAttribute,
	SpreadElement,
	StyleDirective,
	SvelteBody,
	SvelteComponent,
	SvelteDocument,
	SvelteElement,
	SvelteFragment,
	SvelteHead,
	SvelteSelf,
	SvelteWindow,
	SvelteBoundary,
	TaggedTemplateExpression,
	TemplateElement,
	Text,
	TransitionDirective,
	TitleElement,
	UpdateExpression,
	UseDirective,
	VariableDeclarator
};

/**
 * @param {AST.Script | null} script
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

	const { scope, scopes, has_await } = create_scopes(
		ast,
		root,
		allow_reactive_declarations,
		parent
	);

	return { ast, scope, scopes, has_await };
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

const RESERVED = ['$$props', '$$restProps', '$$slots'];

/**
 * @param {string} source
 * @param {ValidatedModuleCompileOptions} options
 * @returns {Analysis}
 */
export function analyze_module(source, options) {
	/** @type {AST.JSComment[]} */
	const comments = [];

	state.set_source(source);
	const ast = parse(source, comments, false, false);

	const { scope, scopes, has_await } = create_scopes(ast, new ScopeRoot(), false, null);

	for (const [name, references] of scope.references) {
		if (name[0] !== '$' || RESERVED.includes(name)) continue;
		if (name === '$' || name[1] === '$') {
			e.global_reference_invalid(references[0].node, name);
		}

		const binding = scope.get(name.slice(1));

		if (binding !== null && !is_rune(name)) {
			e.store_invalid_subscription_module(references[0].node);
		}
	}

	/** @type {Analysis} */
	const analysis = {
		module: { ast, scope, scopes, has_await },
		name: options.filename,
		accessors: false,
		runes: true,
		immutable: true,
		tracing: false,
		async_deriveds: new Set(),
		comments,
		classes: new Map(),
		pickled_awaits: new Set()
	};

	state.adjust({
		dev: options.dev,
		rootDir: options.rootDir,
		runes: true
	});

	walk(
		/** @type {Node} */ (ast),
		{
			scope,
			scopes,
			analysis: /** @type {ComponentAnalysis} */ (analysis),
			state_fields: new Map(),
			// TODO the following are not needed for modules, but we have to pass them in order to avoid type error,
			// and reducing the type would result in a lot of tedious type casts elsewhere - find a good solution one day
			ast_type: /** @type {any} */ (null),
			component_slots: /** @type {Set<string>} */ (new Set()),
			expression: null,
			function_depth: 0,
			has_props_rune: false,
			options: /** @type {ValidatedCompileOptions} */ (options),
			fragment: null,
			parent_element: null,
			reactive_statement: null,
			in_derived: false
		},
		visitors
	);

	return analysis;
}

/**
 * @param {AST.Root} root
 * @param {string} source
 * @param {ValidatedCompileOptions} options
 * @returns {ComponentAnalysis}
 */
export function analyze_component(root, source, options) {
	const scope_root = new ScopeRoot();

	const module = js(root.module, scope_root, false, null);
	const instance = js(root.instance, scope_root, true, module.scope);

	const { scope, scopes, has_await } = create_scopes(
		root.fragment,
		scope_root,
		false,
		instance.scope
	);

	/** @type {Template} */
	const template = { ast: root.fragment, scope, scopes };

	let synthetic_stores_legacy_check = [];

	// create synthetic bindings for store subscriptions
	for (const [name, references] of module.scope.references) {
		if (name[0] !== '$' || RESERVED.includes(name)) continue;
		if (name === '$' || name[1] === '$') {
			e.global_reference_invalid(references[0].node, name);
		}

		const store_name = name.slice(1);
		const declaration = instance.scope.get(store_name);
		const init = /** @type {Node | undefined} */ (declaration?.initial);

		// If we're not in legacy mode through the compiler option, assume the user
		// is referencing a rune and not a global store.
		if (
			options.runes === false ||
			!is_rune(name) ||
			(declaration !== null &&
				// const state = $state(0) is valid
				(get_rune(init, instance.scope) === null ||
					// rune-line names received as props are valid too (but we have to protect against $props as store)
					(store_name !== 'props' && get_rune(init, instance.scope) === '$props')) &&
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
				} else if (declaration !== null && is_rune(name)) {
					for (const { node, path } of references) {
						if (path.at(-1)?.type === 'CallExpression') {
							w.store_rune_conflict(node, store_name);
						}
					}
				}
			}

			if (module.ast) {
				for (const { node, path } of references) {
					// if the reference is inside module, error. this is a bit hacky but it works
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

			// we push to the array because at this moment in time we can't be sure if we are in legacy
			// mode yet because we are still changing the module scope
			synthetic_stores_legacy_check.push(() => {
				// if we are creating a synthetic binding for a let declaration we should also declare
				// the declaration as state in case it's reassigned and we are not in runes mode (the function will
				// not be called if we are not in runes mode, that's why there's no !runes check here)
				if (
					declaration !== null &&
					declaration.kind === 'normal' &&
					declaration.declaration_kind === 'let' &&
					declaration.reassigned
				) {
					declaration.kind = 'state';
				}
			});

			const binding = instance.scope.declare(b.id(name), 'store_sub', 'synthetic');
			binding.references = references;
			instance.scope.references.set(name, references);
			module.scope.references.delete(name);
		}
	}

	const component_name = get_component_name(options.filename);

	const runes =
		options.runes ??
		(has_await || instance.has_await || Array.from(module.scope.references.keys()).some(is_rune));

	if (!runes) {
		for (let check of synthetic_stores_legacy_check) {
			check();
		}
	}

	if (runes && root.module) {
		const context = root.module.attributes.find((attribute) => attribute.name === 'context');
		if (context) {
			w.script_context_deprecated(context);
		}
	}

	const is_custom_element = !!options.customElementOptions || options.customElement;

	const name = module.scope.generate(options.name ?? component_name);

	state.adjust({
		component_name: name,
		dev: options.dev,
		rootDir: options.rootDir,
		runes
	});

	// TODO remove all the ?? stuff, we don't need it now that we're validating the config
	/** @type {ComponentAnalysis} */
	const analysis = {
		name,
		root: scope_root,
		module,
		instance,
		template,
		comments: root.comments,
		elements: [],
		runes,
		// if we are not in runes mode but we have no reserved references ($$props, $$restProps)
		// and no `export let` we might be in a wannabe runes component that is using runes in an external
		// module...we need to fallback to the runic behavior
		maybe_runes:
			!runes &&
			// if they explicitly disabled runes, use the legacy behavior
			options.runes !== false &&
			![...module.scope.references.keys()].some((name) =>
				['$$props', '$$restProps'].includes(name)
			) &&
			!instance.ast.body.some(
				(node) =>
					node.type === 'LabeledStatement' ||
					(node.type === 'ExportNamedDeclaration' &&
						((node.declaration &&
							node.declaration.type === 'VariableDeclaration' &&
							node.declaration.kind === 'let') ||
							node.specifiers.some(
								(specifier) =>
									specifier.local.type === 'Identifier' &&
									instance.scope.get(specifier.local.name)?.declaration_kind === 'let'
							)))
			),
		tracing: false,
		classes: new Map(),
		immutable: runes || options.immutable,
		exports: [],
		uses_props: false,
		props_id: null,
		uses_rest_props: false,
		uses_slots: false,
		uses_component_bindings: false,
		uses_render_tags: false,
		needs_context: false,
		needs_mutation_validation: false,
		needs_props: false,
		event_directive_node: null,
		uses_event_attributes: false,
		custom_element: is_custom_element,
		inject_styles: options.css === 'injected' || is_custom_element,
		accessors:
			is_custom_element ||
			(runes ? false : !!options.accessors) ||
			// because $set method needs accessors
			options.compatibility?.componentApi === 4,
		reactive_statements: new Map(),
		binding_groups: new Map(),
		slot_names: new Map(),
		css: {
			ast: root.css,
			hash: root.css
				? options.cssHash({
						css: root.css.content.styles,
						filename: state.filename,
						name: component_name,
						hash
					})
				: '',
			keyframes: [],
			has_global: false
		},
		source,
		snippet_renderers: new Map(),
		snippets: new Set(),
		async_deriveds: new Set(),
		pickled_awaits: new Set()
	};

	if (!runes) {
		// every exported `let` or `var` declaration becomes a prop, everything else becomes an export
		for (const node of instance.ast.body) {
			if (node.type !== 'ExportNamedDeclaration') continue;

			analysis.needs_props = true;

			if (node.declaration) {
				if (
					node.declaration.type === 'FunctionDeclaration' ||
					node.declaration.type === 'ClassDeclaration'
				) {
					analysis.exports.push({
						name: /** @type {import('estree').Identifier} */ (node.declaration.id).name,
						alias: null
					});
				} else if (node.declaration.type === 'VariableDeclaration') {
					if (node.declaration.kind === 'const') {
						for (const declarator of node.declaration.declarations) {
							for (const node of extract_identifiers(declarator.id)) {
								analysis.exports.push({ name: node.name, alias: null });
							}
						}
					} else {
						for (const declarator of node.declaration.declarations) {
							for (const id of extract_identifiers(declarator.id)) {
								const binding = /** @type {Binding} */ (instance.scope.get(id.name));
								binding.kind = 'bindable_prop';
							}
						}
					}
				}
			} else {
				for (const specifier of node.specifiers) {
					if (specifier.local.type !== 'Identifier' || specifier.exported.type !== 'Identifier') {
						continue;
					}

					const binding = instance.scope.get(specifier.local.name);

					if (
						binding &&
						(binding.declaration_kind === 'var' || binding.declaration_kind === 'let')
					) {
						binding.kind = 'bindable_prop';

						if (specifier.exported.name !== specifier.local.name) {
							binding.prop_alias = specifier.exported.name;
						}
					} else {
						analysis.exports.push({ name: specifier.local.name, alias: specifier.exported.name });
					}
				}
			}
		}

		// if reassigned/mutated bindings are referenced in `$:` blocks
		// or the template, turn them into state
		for (const binding of instance.scope.declarations.values()) {
			if (binding.kind !== 'normal') continue;

			for (const { node, path } of binding.references) {
				if (node === binding.node) continue;

				if (binding.updated) {
					if (
						path[path.length - 1].type === 'StyleDirective' ||
						path.some((node) => node.type === 'Fragment') ||
						(path[1].type === 'LabeledStatement' && path[1].label.name === '$')
					) {
						binding.kind = 'state';
					}
				}
			}
		}

		// more legacy nonsense: if an `each` binding is reassigned/mutated,
		// treat the expression as being mutated as well
		walk(/** @type {AST.SvelteNode} */ (template.ast), null, {
			EachBlock(node) {
				const scope = /** @type {Scope} */ (template.scopes.get(node));

				for (const binding of scope.declarations.values()) {
					if (binding.updated) {
						const state = { scope: /** @type {Scope} */ (scope.parent), scopes: template.scopes };

						walk(node.expression, state, {
							// @ts-expect-error
							_: set_scope,
							Identifier(node, context) {
								const parent = /** @type {Expression} */ (context.path.at(-1));

								if (is_reference(node, parent)) {
									const binding = context.state.scope.get(node.name);

									if (
										binding &&
										binding.kind === 'normal' &&
										binding.declaration_kind !== 'import'
									) {
										binding.kind = 'state';
										binding.mutated = true;
									}
								}
							}
						});

						break;
					}
				}
			}
		});
	}

	if (root.options) {
		for (const attribute of root.options.attributes) {
			if (attribute.name === 'accessors' && analysis.runes) {
				w.options_deprecated_accessors(attribute);
			}

			if (attribute.name === 'customElement' && !options.customElement) {
				w.options_missing_custom_element(attribute);
			}

			if (attribute.name === 'immutable' && analysis.runes) {
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
				scopes,
				analysis,
				options,
				ast_type: ast === instance.ast ? 'instance' : ast === template.ast ? 'template' : 'module',
				fragment: ast === template.ast ? ast : null,
				parent_element: null,
				has_props_rune: false,
				component_slots: new Set(),
				expression: null,
				state_fields: new Map(),
				function_depth: scope.function_depth,
				reactive_statement: null,
				in_derived: false
			};

			walk(/** @type {AST.SvelteNode} */ (ast), state, visitors);
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
								/** @type {AST.BindDirective} */ (path[i]).name === 'this'
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
			/** @type {AnalysisState} */
			const state = {
				scope,
				scopes,
				analysis,
				options,
				fragment: ast === template.ast ? ast : null,
				parent_element: null,
				has_props_rune: false,
				ast_type: ast === instance.ast ? 'instance' : ast === template.ast ? 'template' : 'module',
				reactive_statement: null,
				component_slots: new Set(),
				expression: null,
				state_fields: new Map(),
				function_depth: scope.function_depth,
				in_derived: false
			};

			walk(/** @type {AST.SvelteNode} */ (ast), state, visitors);
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

	for (const node of analysis.module.ast.body) {
		if (node.type === 'ExportNamedDeclaration' && node.specifiers !== null && node.source == null) {
			for (const specifier of node.specifiers) {
				if (specifier.local.type !== 'Identifier') continue;
				const name = specifier.local.name;
				const binding = analysis.module.scope.get(name);
				if (!binding) {
					if ([...analysis.snippets].find((snippet) => snippet.expression.name === name)) {
						e.snippet_invalid_export(specifier);
					} else {
						e.export_undefined(specifier, name);
					}
				}
			}
		}
	}

	if (analysis.event_directive_node && analysis.uses_event_attributes) {
		e.mixed_event_handler_syntaxes(
			analysis.event_directive_node,
			analysis.event_directive_node.name
		);
	}

	for (const [node, resolved] of analysis.snippet_renderers) {
		if (!resolved) {
			node.metadata.snippets = analysis.snippets;
		}

		for (const snippet of node.metadata.snippets) {
			snippet.metadata.sites.add(node);
		}
	}

	if (
		analysis.uses_render_tags &&
		(analysis.uses_slots || (!analysis.custom_element && analysis.slot_names.size > 0))
	) {
		const pos = analysis.slot_names.values().next().value ?? analysis.source.indexOf('$$slot');
		e.slot_snippet_conflict(pos);
	}

	if (analysis.css.ast) {
		analyze_css(analysis.css.ast, analysis);

		// mark nodes as scoped/unused/empty etc
		for (const node of analysis.elements) {
			prune(analysis.css.ast, node);
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
	}

	for (const node of analysis.elements) {
		if (node.metadata.scoped && is_custom_element_node(node)) {
			mark_subtree_dynamic(node.metadata.path);
		}

		let has_class = false;
		let has_style = false;
		let has_spread = false;
		let has_class_directive = false;
		let has_style_directive = false;

		for (const attribute of node.attributes) {
			// The spread method appends the hash to the end of the class attribute on its own
			if (attribute.type === 'SpreadAttribute') {
				has_spread = true;
				break;
			} else if (attribute.type === 'Attribute') {
				has_class ||= attribute.name.toLowerCase() === 'class';
				has_style ||= attribute.name.toLowerCase() === 'style';
			} else if (attribute.type === 'ClassDirective') {
				has_class_directive = true;
			} else if (attribute.type === 'StyleDirective') {
				has_style_directive = true;
			}
		}

		// We need an empty class to generate the set_class() or class="" correctly
		if (!has_spread && !has_class && (node.metadata.scoped || has_class_directive)) {
			node.attributes.push(
				create_attribute('class', -1, -1, [
					{
						type: 'Text',
						data: '',
						raw: '',
						start: -1,
						end: -1
					}
				])
			);
		}

		// We need an empty style to generate the set_style() correctly
		if (!has_spread && !has_style && has_style_directive) {
			node.attributes.push(
				create_attribute('style', -1, -1, [
					{
						type: 'Text',
						data: '',
						raw: '',
						start: -1,
						end: -1
					}
				])
			);
		}
	}

	// TODO
	// analysis.stylesheet.warn_on_unused_selectors(analysis);

	return analysis;
}

/**
 * @param {Map<import('estree').LabeledStatement, ReactiveStatement>} unsorted_reactive_declarations
 */
function order_reactive_statements(unsorted_reactive_declarations) {
	/** @typedef {[import('estree').LabeledStatement, ReactiveStatement]} Tuple */

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
	/** @type {Map<import('estree').LabeledStatement, ReactiveStatement>} */
	const reactive_declarations = new Map();

	/**
	 *
	 * @param {import('estree').LabeledStatement} node
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
