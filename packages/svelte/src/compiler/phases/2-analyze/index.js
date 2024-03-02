import is_reference from 'is-reference';
import { walk } from 'zimmerframe';
import { error } from '../../errors.js';
import {
	extract_identifiers,
	extract_all_identifiers_from_expression,
	extract_paths,
	is_event_attribute,
	is_text_attribute,
	object
} from '../../utils/ast.js';
import * as b from '../../utils/builders.js';
import { ReservedKeywords, Runes, SVGElements } from '../constants.js';
import { Scope, ScopeRoot, create_scopes, get_rune, set_scope } from '../scope.js';
import { merge } from '../visitors.js';
import { validation_legacy, validation_runes, validation_runes_js } from './validation.js';
import { warn } from '../../warnings.js';
import check_graph_for_cycles from './utils/check_graph_for_cycles.js';
import { regex_starts_with_newline } from '../patterns.js';
import { create_attribute, is_element_node } from '../nodes.js';
import { DelegatedEvents, namespace_svg } from '../../../constants.js';
import { should_proxy_or_freeze } from '../3-transform/client/utils.js';
import { analyze_css } from './css/css-analyze.js';
import { prune } from './css/css-prune.js';
import { hash } from './utils.js';

/**
 * @param {import('#compiler').Script | null} script
 * @param {ScopeRoot} root
 * @param {boolean} allow_reactive_declarations
 * @param {Scope | null} parent
 * @returns {import('../types.js').Js}
 */
function js(script, root, allow_reactive_declarations, parent) {
	/** @type {import('estree').Program} */
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
 * Checks if given event attribute can be delegated/hoisted and returns the corresponding info if so
 * @param {string} event_name
 * @param {import('estree').Expression | null} handler
 * @param {import('./types').Context} context
 * @returns {null | import('#compiler').DelegatedEvent}
 */
function get_delegated_event(event_name, handler, context) {
	// Handle delegated event handlers. Bail-out if not a delegated event.
	if (!handler || !DelegatedEvents.includes(event_name)) {
		return null;
	}

	// If we are not working with a RegularElement, then bail-out.
	const element = context.path.at(-1);
	if (element?.type !== 'RegularElement') {
		return null;
	}

	/** @type {import('#compiler').DelegatedEvent} */
	const non_hoistable = { type: 'non-hoistable' };
	/** @type {import('estree').FunctionExpression | import('estree').FunctionDeclaration | import('estree').ArrowFunctionExpression | null} */
	let target_function = null;
	let binding = null;

	if (element.metadata.has_spread) {
		// event attribute becomes part of the dynamic spread array
		return non_hoistable;
	}

	if (handler.type === 'ArrowFunctionExpression' || handler.type === 'FunctionExpression') {
		target_function = handler;
	} else if (handler.type === 'Identifier') {
		binding = context.state.scope.get(handler.name);

		if (context.state.analysis.module.scope.references.has(handler.name)) {
			// If a binding with the same name is referenced in the module scope (even if not declared there), bail-out
			return non_hoistable;
		}

		if (binding != null) {
			for (const { path } of binding.references) {
				const parent = path.at(-1);
				if (parent == null) {
					return non_hoistable;
				}

				/** @type {import('#compiler').RegularElement | null} */
				let element = null;
				/** @type {string | null} */
				let event_name = null;
				if (parent.type === 'OnDirective') {
					element = /** @type {import('#compiler').RegularElement} */ (path.at(-2));
					event_name = parent.name;
				} else if (
					parent.type === 'ExpressionTag' &&
					is_event_attribute(/** @type {import('#compiler').Attribute} */ (path.at(-2)))
				) {
					element = /** @type {import('#compiler').RegularElement} */ (path.at(-3));
					const attribute = /** @type {import('#compiler').Attribute} */ (path.at(-2));
					event_name = get_attribute_event_name(attribute.name);
				}

				if (element && event_name) {
					if (
						element.type !== 'RegularElement' ||
						determine_element_spread(element).metadata.has_spread ||
						!DelegatedEvents.includes(event_name)
					) {
						return non_hoistable;
					}
				} else if (parent.type !== 'FunctionDeclaration' && parent.type !== 'VariableDeclarator') {
					return non_hoistable;
				}
			}
		}

		// If the binding is exported, bail-out
		if (context.state.analysis.exports.find((node) => node.name === handler.name)) {
			return non_hoistable;
		}

		if (binding !== null && binding.initial !== null && !binding.mutated && !binding.is_called) {
			const binding_type = binding.initial.type;

			if (
				binding_type === 'ArrowFunctionExpression' ||
				binding_type === 'FunctionDeclaration' ||
				binding_type === 'FunctionExpression'
			) {
				target_function = binding.initial;
			}
		}
	}

	// If we can't find a function, bail-out
	if (target_function == null) {
		return non_hoistable;
	}
	// If the function is marked as non-hoistable, bail-out
	if (target_function.metadata.hoistable === 'impossible') {
		return non_hoistable;
	}
	// If the function has more than one arg, then bail-out
	if (target_function.params.length > 1) {
		return non_hoistable;
	}

	const visited_references = new Set();
	const scope = target_function.metadata.scope;
	for (const [reference] of scope.references) {
		// Bail-out if the arguments keyword is used
		if (reference === 'arguments') {
			return non_hoistable;
		}
		const binding = scope.get(reference);
		const local_binding = context.state.scope.get(reference);

		// If we are referencing a binding that is shadowed in another scope then bail out.
		if (local_binding !== null && binding !== null && local_binding.node !== binding.node) {
			return non_hoistable;
		}

		// If we have multiple references to the same store using $ prefix, bail out.
		if (
			binding !== null &&
			binding.kind === 'store_sub' &&
			visited_references.has(reference.slice(1))
		) {
			return non_hoistable;
		}

		// If we reference the index within an each block, then bail-out.
		if (binding !== null && binding.initial?.type === 'EachBlock') {
			return non_hoistable;
		}

		if (
			binding !== null &&
			// Bail-out if the the binding is a rest param
			(binding.declaration_kind === 'rest_param' ||
				// Bail-out if we reference anything from the EachBlock (for now) that mutates in non-runes mode,
				(((!context.state.analysis.runes && binding.kind === 'each') ||
					// or any normal not reactive bindings that are mutated.
					binding.kind === 'normal' ||
					// or any reactive imports (those are rewritten) (can only happen in legacy mode)
					binding.kind === 'legacy_reactive_import') &&
					binding.mutated))
		) {
			return non_hoistable;
		}
		visited_references.add(reference);
	}

	return { type: 'hoistable', function: target_function };
}

/**
 * @param {import('estree').Program} ast
 * @param {import('#compiler').ValidatedModuleCompileOptions} options
 * @returns {import('../types.js').Analysis}
 */
export function analyze_module(ast, options) {
	const { scope, scopes } = create_scopes(ast, new ScopeRoot(), false, null);

	for (const [name, references] of scope.references) {
		if (name[0] !== '$' || ReservedKeywords.includes(name)) continue;
		if (name === '$' || name[1] === '$') {
			error(references[0].node, 'illegal-global', name);
		}
	}

	/** @type {import('../types').RawWarning[]} */
	const warnings = [];

	const analysis = {
		warnings
	};

	walk(
		/** @type {import('estree').Node} */ (ast),
		{ scope, analysis },
		// @ts-expect-error TODO clean this mess up
		merge(set_scope(scopes), validation_runes_js, runes_scope_js_tweaker)
	);

	return {
		module: { ast, scope, scopes },
		name: options.filename || 'module',
		warnings,
		accessors: false,
		runes: true,
		immutable: true
	};
}

/**
 * @param {import('#compiler').Root} root
 * @param {import('#compiler').ValidatedCompileOptions} options
 * @returns {import('../types.js').ComponentAnalysis}
 */
export function analyze_component(root, options) {
	const scope_root = new ScopeRoot();

	const module = js(root.module, scope_root, false, null);
	const instance = js(root.instance, scope_root, true, module.scope);

	const { scope, scopes } = create_scopes(root.fragment, scope_root, false, instance.scope);

	/** @type {import('../types.js').Template} */
	const template = { ast: root.fragment, scope, scopes };

	/** @type {import('../types').RawWarning[]} */
	const warnings = [];

	// create synthetic bindings for store subscriptions
	for (const [name, references] of module.scope.references) {
		if (name[0] !== '$' || ReservedKeywords.includes(name)) continue;
		if (name === '$' || name[1] === '$') {
			error(references[0].node, 'illegal-global', name);
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
				get_rune(declaration.initial, instance.scope) === null &&
				// allow `import { derived } from 'svelte/store'` in the same file as `const x = $derived(..)` because one is not a subscription to the other
				!(
					name === '$derived' &&
					declaration.initial?.type === 'ImportDeclaration' &&
					declaration.initial.source.value === 'svelte/store'
				))
		) {
			if (options.runes !== false) {
				if (declaration === null && /[a-z]/.test(store_name[0])) {
					error(references[0].node, 'illegal-global', name);
				} else if (declaration !== null && Runes.includes(/** @type {any} */ (name))) {
					for (const { node, path } of references) {
						if (path.at(-1)?.type === 'CallExpression') {
							warn(warnings, node, [], 'store-with-rune-name', store_name);
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
						get_rune(/** @type {import('estree').Node} */ (path.at(-1)), module.scope) === null
					) {
						error(node, 'illegal-subscription');
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
	/** @type {import('../types.js').ComponentAnalysis} */
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
		custom_element: options.customElement,
		inject_styles: options.css === 'injected' || !!options.customElement,
		accessors: options.customElement
			? true
			: !!options.accessors ||
				// because $set method needs accessors
				!!options.legacy?.componentApi,
		reactive_statements: new Map(),
		binding_groups: new Map(),
		slot_names: new Set(),
		warnings,
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
		}
	};

	if (analysis.runes) {
		const props_refs = module.scope.references.get('$$props');
		if (props_refs) {
			error(props_refs[0].node, 'invalid-legacy-props');
		}

		const rest_props_refs = module.scope.references.get('$$restProps');
		if (rest_props_refs) {
			error(rest_props_refs[0].node, 'invalid-legacy-rest-props');
		}

		for (const { ast, scope, scopes } of [module, instance, template]) {
			/** @type {import('./types').AnalysisState} */
			const state = {
				scope,
				analysis,
				options,
				ast_type: ast === instance.ast ? 'instance' : ast === template.ast ? 'template' : 'module',
				parent_element: null,
				has_props_rune: false,
				component_slots: new Set(),
				expression: null,
				private_derived_state: [],
				function_depth: scope.function_depth
			};

			walk(
				/** @type {import('#compiler').SvelteNode} */ (ast),
				state,
				merge(set_scope(scopes), validation_runes, runes_scope_tweaker, common_visitors)
			);
		}
	} else {
		instance.scope.declare(b.id('$$props'), 'prop', 'synthetic');
		instance.scope.declare(b.id('$$restProps'), 'rest_prop', 'synthetic');

		for (const { ast, scope, scopes } of [module, instance, template]) {
			/** @type {import('./types').LegacyAnalysisState} */
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
				private_derived_state: [],
				function_depth: scope.function_depth
			};

			walk(
				/** @type {import('#compiler').SvelteNode} */ (ast),
				state,
				// @ts-expect-error TODO
				merge(set_scope(scopes), validation_legacy, legacy_scope_tweaker, common_visitors)
			);
		}

		analysis.reactive_statements = order_reactive_statements(analysis.reactive_statements);
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
							/** @type {import('#compiler').BindDirective} */ (path[i]).name === 'this'
						) {
							for (let j = i - 1; j >= 0; j -= 1) {
								const type = path[j].type;
								if (
									type === 'IfBlock' ||
									type === 'EachBlock' ||
									type === 'AwaitBlock' ||
									type === 'KeyBlock'
								) {
									warn(warnings, binding.node, [], 'non-state-reference', name);
									continue outer;
								}
							}
							continue inner;
						}
					}

					warn(warnings, binding.node, [], 'non-state-reference', name);
					continue outer;
				}
			}
		}
	}

	if (analysis.css.ast) {
		analyze_css(analysis.css.ast, analysis);

		// mark nodes as scoped/unused/empty etc
		for (const element of analysis.elements) {
			prune(analysis.css.ast, element);
		}

		outer: for (const element of analysis.elements) {
			if (element.metadata.scoped) {
				// Dynamic elements in dom mode always use spread for attributes and therefore shouldn't have a class attribute added to them
				// TODO this happens during the analysis phase, which shouldn't know anything about client vs server
				if (element.type === 'SvelteElement' && options.generate === 'client') continue;

				/** @type {import('#compiler').Attribute | undefined} */
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
					const chunks = class_attribute.value;

					if (chunks.length === 1 && chunks[0].type === 'Text') {
						chunks[0].data += ` ${analysis.css.hash}`;
					} else {
						chunks.push({
							type: 'Text',
							data: ` ${analysis.css.hash}`,
							raw: ` ${analysis.css.hash}`,
							start: -1,
							end: -1,
							parent: null
						});
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

/** @type {import('./types').Visitors<import('./types').LegacyAnalysisState>} */
const legacy_scope_tweaker = {
	LabeledStatement(node, { next, path, state }) {
		if (
			state.ast_type !== 'instance' ||
			node.label.name !== '$' ||
			/** @type {import('#compiler').SvelteNode} */ (path.at(-1)).type !== 'Program'
		) {
			return next();
		}

		// Find all dependencies of this `$: {...}` statement
		/** @type {import('../types.js').ReactiveStatement} */
		const reactive_statement = {
			assignments: new Set(),
			dependencies: new Set()
		};

		next({ ...state, reactive_statement, function_depth: state.scope.function_depth + 1 });

		for (const [name, nodes] of state.scope.references) {
			const binding = state.scope.get(name);
			if (binding === null) continue;

			// Include bindings that have references other than assignments and their own declarations
			if (
				nodes.some((n) => n.node !== binding.node && !reactive_statement.assignments.has(n.node))
			) {
				reactive_statement.dependencies.add(binding);
			}
		}

		state.reactive_statements.set(node, reactive_statement);

		if (
			node.body.type === 'ExpressionStatement' &&
			node.body.expression.type === 'AssignmentExpression'
		) {
			let ids = extract_identifiers(node.body.expression.left);
			if (node.body.expression.left.type === 'MemberExpression') {
				const id = object(node.body.expression.left);
				if (id !== null) {
					ids = [id];
				}
			}

			for (const id of ids) {
				const binding = state.scope.get(id.name);
				if (binding?.kind === 'legacy_reactive') {
					// TODO does this include `let double; $: double = x * 2`?
					binding.legacy_dependencies = Array.from(reactive_statement.dependencies);
				}
			}
		}
	},
	AssignmentExpression(node, { state, next }) {
		if (state.reactive_statement && node.operator === '=') {
			if (node.left.type === 'MemberExpression') {
				const id = object(node.left);
				if (id !== null) {
					state.reactive_statement.assignments.add(id);
				}
			} else {
				for (const id of extract_identifiers(node.left)) {
					state.reactive_statement.assignments.add(id);
				}
			}
		}

		next();
	},
	Identifier(node, { state, path }) {
		const parent = /** @type {import('estree').Node} */ (path.at(-1));
		if (is_reference(node, parent)) {
			if (node.name === '$$props') {
				state.analysis.uses_props = true;
			}

			if (node.name === '$$restProps') {
				state.analysis.uses_rest_props = true;
			}

			if (node.name === '$$slots') {
				state.analysis.uses_slots = true;
			}

			let binding = state.scope.get(node.name);

			if (binding?.kind === 'store_sub') {
				// get the underlying store to mark it as reactive in case it's mutated
				binding = state.scope.get(node.name.slice(1));
			}

			if (
				binding !== null &&
				binding.kind === 'normal' &&
				((binding.scope === state.instance_scope && binding.declaration_kind !== 'function') ||
					binding.declaration_kind === 'import')
			) {
				if (binding.declaration_kind === 'import') {
					if (
						binding.mutated &&
						// TODO could be more fine-grained - not every mention in the template implies a state binding
						(state.reactive_statement || state.ast_type === 'template') &&
						parent.type === 'MemberExpression'
					) {
						binding.kind = 'legacy_reactive_import';
					}
				} else if (
					binding.mutated &&
					// TODO could be more fine-grained - not every mention in the template implies a state binding
					(state.reactive_statement || state.ast_type === 'template')
				) {
					binding.kind = 'state';
				} else if (
					state.reactive_statement &&
					parent.type === 'AssignmentExpression' &&
					parent.left === binding.node
				) {
					binding.kind = 'derived';
				} else {
					let idx = -1;
					let ancestor = path.at(idx);
					while (ancestor) {
						if (ancestor.type === 'EachBlock') {
							// Ensures that the array is reactive when only its entries are mutated
							// TODO: this doesn't seem correct. We should be checking at the points where
							// the identifier (the each expression) is used in a way that makes it reactive.
							// This just forces the collection identifier to always be reactive even if it's
							// not.
							if (ancestor.expression === (idx === -1 ? node : path.at(idx + 1))) {
								binding.kind = 'state';
								break;
							}
						}
						ancestor = path.at(--idx);
					}
				}
			}
		}
	},
	ExportNamedDeclaration(node, { next, state }) {
		if (state.ast_type !== 'instance') {
			return next();
		}

		if (!node.declaration) {
			for (const specifier of node.specifiers) {
				const binding = /** @type {import('#compiler').Binding} */ (
					state.scope.get(specifier.local.name)
				);
				if (
					binding.kind === 'state' ||
					binding.kind === 'frozen_state' ||
					(binding.kind === 'normal' && binding.declaration_kind === 'let')
				) {
					binding.kind = 'prop';
					if (specifier.exported.name !== specifier.local.name) {
						binding.prop_alias = specifier.exported.name;
					}
				} else {
					state.analysis.exports.push({
						name: specifier.local.name,
						alias: specifier.exported.name
					});
				}
			}
			return next();
		}

		if (
			node.declaration.type === 'FunctionDeclaration' ||
			node.declaration.type === 'ClassDeclaration'
		) {
			state.analysis.exports.push({
				name: /** @type {import('estree').Identifier} */ (node.declaration.id).name,
				alias: null
			});
			return next();
		}

		if (node.declaration.type === 'VariableDeclaration') {
			if (node.declaration.kind === 'const') {
				for (const declarator of node.declaration.declarations) {
					for (const node of extract_identifiers(declarator.id)) {
						state.analysis.exports.push({ name: node.name, alias: null });
					}
				}
				return next();
			}

			for (const declarator of node.declaration.declarations) {
				for (const id of extract_identifiers(declarator.id)) {
					const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(id.name));
					binding.kind = 'prop';
				}
			}
		}
	}
};

/** @type {import('zimmerframe').Visitors<import('#compiler').SvelteNode, { scope: Scope, analysis: { warnings: import('../types').RawWarning[] } }>} */
const runes_scope_js_tweaker = {
	VariableDeclarator(node, { state }) {
		if (node.init?.type !== 'CallExpression') return;
		const rune = get_rune(node.init, state.scope);
		if (rune === null) return;

		const callee = node.init.callee;
		if (callee.type !== 'Identifier' && callee.type !== 'MemberExpression') return;

		if (
			rune !== '$state' &&
			rune !== '$state.frozen' &&
			rune !== '$derived' &&
			rune !== '$derived.by'
		)
			return;

		for (const path of extract_paths(node.id)) {
			// @ts-ignore this fails in CI for some insane reason
			const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(path.node.name));
			binding.kind =
				rune === '$state' ? 'state' : rune === '$state.frozen' ? 'frozen_state' : 'derived';
		}
	}
};

/** @type {import('./types').Visitors} */
const runes_scope_tweaker = {
	CallExpression(node, { state, next }) {
		const rune = get_rune(node, state.scope);

		// `$inspect(foo)` should not trigger the `static-state-reference` warning
		if (rune === '$inspect') {
			next({ ...state, function_depth: state.function_depth + 1 });
		}
	},
	VariableDeclarator(node, { state }) {
		const init = node.init;
		if (!init || init.type !== 'CallExpression') return;
		const rune = get_rune(init, state.scope);
		if (rune === null) return;

		const callee = init.callee;
		if (callee.type !== 'Identifier' && callee.type !== 'MemberExpression') return;

		if (
			rune !== '$state' &&
			rune !== '$state.frozen' &&
			rune !== '$derived' &&
			rune !== '$derived.by' &&
			rune !== '$props'
		)
			return;

		for (const path of extract_paths(node.id)) {
			// @ts-ignore this fails in CI for some insane reason
			const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(path.node.name));
			binding.kind =
				rune === '$state'
					? 'state'
					: rune === '$state.frozen'
						? 'frozen_state'
						: rune === '$derived' || rune === '$derived.by'
							? 'derived'
							: path.is_rest
								? 'rest_prop'
								: 'prop';
		}

		if (rune === '$props') {
			for (const property of /** @type {import('estree').ObjectPattern} */ (node.id).properties) {
				if (property.type !== 'Property') continue;

				const name =
					property.value.type === 'AssignmentPattern'
						? /** @type {import('estree').Identifier} */ (property.value.left).name
						: /** @type {import('estree').Identifier} */ (property.value).name;
				const alias =
					property.key.type === 'Identifier'
						? property.key.name
						: /** @type {string} */ (/** @type {import('estree').Literal} */ (property.key).value);
				const initial = property.value.type === 'AssignmentPattern' ? property.value.right : null;

				const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(name));
				binding.prop_alias = alias;
				binding.initial = initial; // rewire initial from $props() to the actual initial value
			}
		}
	},
	ExportSpecifier(node, { state }) {
		if (state.ast_type !== 'instance') return;

		state.analysis.exports.push({
			name: node.local.name,
			alias: node.exported.name
		});
	},
	ExportNamedDeclaration(node, { next, state }) {
		if (!node.declaration || state.ast_type !== 'instance') {
			return next();
		}

		if (
			node.declaration.type === 'FunctionDeclaration' ||
			node.declaration.type === 'ClassDeclaration'
		) {
			state.analysis.exports.push({
				name: /** @type {import('estree').Identifier} */ (node.declaration.id).name,
				alias: null
			});
			return next();
		}

		if (node.declaration.type === 'VariableDeclaration' && node.declaration.kind === 'const') {
			for (const declarator of node.declaration.declarations) {
				for (const node of extract_identifiers(declarator.id)) {
					state.analysis.exports.push({ name: node.name, alias: null });
				}
			}
		}
	}
};

/**
 * @param {import('estree').CallExpression} node
 * @param {import('./types').Context} context
 * @returns {boolean}
 */
function is_known_safe_call(node, context) {
	const callee = node.callee;

	// Check for selector() API calls
	if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier') {
		const binding = context.state.scope.get(callee.object.name);
		const selector_binding = context.state.scope.get('selector');
		if (
			selector_binding !== null &&
			selector_binding.declaration_kind === 'import' &&
			selector_binding.initial !== null &&
			selector_binding.initial.type === 'ImportDeclaration' &&
			selector_binding.initial.source.value === 'svelte' &&
			binding !== null &&
			binding.initial !== null &&
			binding.initial.type === 'CallExpression' &&
			binding.initial.callee.type === 'Identifier' &&
			binding.initial.callee.name === 'selector'
		) {
			return true;
		}
	}
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
	return false;
}

/**
 * @param {import('estree').ArrowFunctionExpression | import('estree').FunctionExpression | import('estree').FunctionDeclaration} node
 * @param {import('./types').Context} context
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

/** @type {import('./types').Visitors} */
const common_visitors = {
	Attribute(node, context) {
		if (node.value === true) return;

		context.next();

		node.metadata.dynamic = node.value.some((chunk) => {
			if (chunk.type !== 'ExpressionTag') {
				return false;
			}

			if (
				chunk.expression.type === 'FunctionExpression' ||
				chunk.expression.type === 'ArrowFunctionExpression'
			) {
				return false;
			}

			return chunk.metadata.dynamic || chunk.metadata.contains_call_expression;
		});

		if (is_event_attribute(node)) {
			const expression = node.value[0].expression;

			const delegated_event = get_delegated_event(node.name.slice(2), expression, context);

			if (delegated_event !== null) {
				if (delegated_event.type === 'hoistable') {
					delegated_event.function.metadata.hoistable = true;
				}
				node.metadata.delegated = delegated_event;
			}
		}
	},
	ClassDirective(node, context) {
		context.next({ ...context.state, expression: node });
	},
	SpreadAttribute(node, context) {
		context.next({ ...context.state, expression: node });
	},
	SlotElement(node, context) {
		let name = 'default';
		for (const attr of node.attributes) {
			if (attr.type === 'Attribute' && attr.name === 'name' && is_text_attribute(attr)) {
				name = attr.value[0].data;
				break;
			}
		}
		context.state.analysis.slot_names.add(name);
	},
	StyleDirective(node, context) {
		if (node.value === true) {
			const binding = context.state.scope.get(node.name);
			if (binding?.kind !== 'normal') {
				node.metadata.dynamic = true;
			}
		} else {
			context.next();
			node.metadata.dynamic = node.value.some(
				(node) => node.type === 'ExpressionTag' && node.metadata.dynamic
			);
		}
	},
	ExpressionTag(node, context) {
		context.next({ ...context.state, expression: node });
	},
	Identifier(node, context) {
		const parent = /** @type {import('estree').Node} */ (context.path.at(-1));
		if (!is_reference(node, parent)) return;

		if (node.name === '$$slots') {
			context.state.analysis.uses_slots = true;
			return;
		}

		const binding = context.state.scope.get(node.name);

		// if no binding, means some global variable
		if (binding && binding.kind !== 'normal') {
			if (context.state.expression) {
				context.state.expression.metadata.dynamic = true;
			}

			if (
				node !== binding.node &&
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
				context.state.function_depth === binding.scope.function_depth
			) {
				warn(context.state.analysis.warnings, node, context.path, 'static-state-reference');
			}
		}
	},
	CallExpression(node, context) {
		if (
			context.state.expression?.type === 'ExpressionTag' ||
			(context.state.expression?.type === 'SpreadAttribute' && !is_known_safe_call(node, context))
		) {
			context.state.expression.metadata.contains_call_expression = true;
		}

		const callee = node.callee;
		if (callee.type === 'Identifier') {
			const binding = context.state.scope.get(callee.name);

			if (binding !== null) {
				binding.is_called = true;
			}

			if (get_rune(node, context.state.scope) === '$derived') {
				// special case — `$derived(foo)` is treated as `$derived(() => foo)`
				// for the purposes of identifying static state references
				context.next({
					...context.state,
					function_depth: context.state.function_depth + 1
				});

				return;
			}
		}

		context.next();
	},
	MemberExpression(node, context) {
		if (context.state.expression) {
			context.state.expression.metadata.dynamic = true;
		}

		context.next();
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
		if (context.state.options.namespace !== 'foreign' && SVGElements.includes(node.name)) {
			node.metadata.svg = true;
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

		if (
			context.state.options.namespace !== 'foreign' &&
			node.tag.type === 'Literal' &&
			typeof node.tag.value === 'string' &&
			SVGElements.includes(node.tag.value)
		) {
			node.metadata.svg = true;
			return;
		}

		for (const attribute of node.attributes) {
			if (attribute.type === 'Attribute') {
				if (attribute.name === 'xmlns' && is_text_attribute(attribute)) {
					node.metadata.svg = attribute.value[0].data === namespace_svg;
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
				// Inside a slot or a snippet -> this resets the namespace, so we can't determine it
				return;
			}
			if (ancestor.type === 'SvelteElement' || ancestor.type === 'RegularElement') {
				node.metadata.svg =
					ancestor.type === 'RegularElement' && ancestor.name === 'foreignObject'
						? false
						: ancestor.metadata.svg;
				return;
			}
		}
	}
};

/**
 * @param {import('#compiler').RegularElement} node
 */
function determine_element_spread(node) {
	let has_spread = false;
	for (const attribute of node.attributes) {
		if (!has_spread && attribute.type === 'SpreadAttribute') {
			has_spread = true;
		}
	}
	node.metadata.has_spread = has_spread;

	return node;
}

/**
 * @param {string} event_name
 */
function get_attribute_event_name(event_name) {
	if (is_capture_event(event_name)) {
		event_name = event_name.slice(0, -7);
	}
	event_name = event_name.slice(2);
	return event_name;
}

/**
 * @param {string} name
 * @returns boolean
 */
function is_capture_event(name) {
	return (
		name.endsWith('capture') && name !== 'ongotpointercapture' && name !== 'onlostpointercapture'
	);
}

/**
 * @param {Map<import('estree').LabeledStatement, import('../types.js').ReactiveStatement>} unsorted_reactive_declarations
 */
function order_reactive_statements(unsorted_reactive_declarations) {
	/** @typedef {[import('estree').LabeledStatement, import('../types.js').ReactiveStatement]} Tuple */

	/** @type {Map<string, Array<Tuple>>} */
	const lookup = new Map();

	for (const [node, declaration] of unsorted_reactive_declarations) {
		declaration.assignments.forEach(({ name }) => {
			const statements = lookup.get(name) ?? [];
			statements.push([node, declaration]);
			lookup.set(name, statements);
		});
	}

	/** @type {Array<[string, string]>} */
	const edges = [];

	for (const [, { assignments, dependencies }] of unsorted_reactive_declarations) {
		for (const { name } of assignments) {
			for (const { node } of dependencies) {
				if (![...assignments].find(({ name }) => node.name === name)) {
					edges.push([name, node.name]);
				}
			}
		}
	}

	const cycle = check_graph_for_cycles(edges);
	if (cycle?.length) {
		const declaration = /** @type {Tuple[]} */ (lookup.get(cycle[0]))[0];
		error(declaration[0], 'cyclical-reactive-declaration', cycle);
	}

	// We use a map and take advantage of the fact that the spec says insertion order is preserved when iterating
	/** @type {Map<import('estree').LabeledStatement, import('../types.js').ReactiveStatement>} */
	const reactive_declarations = new Map();

	/**
	 *
	 * @param {import('estree').LabeledStatement} node
	 * @param {import('../types.js').ReactiveStatement} declaration
	 * @returns
	 */
	const add_declaration = (node, declaration) => {
		if ([...reactive_declarations.values()].includes(declaration)) return;
		declaration.dependencies.forEach(({ node: { name } }) => {
			if ([...declaration.assignments].some((a) => a.name === name)) return;
			for (const [node, earlier] of lookup.get(name) ?? []) {
				add_declaration(node, earlier);
			}
		});
		reactive_declarations.set(node, declaration);
	};
	for (const [node, declaration] of unsorted_reactive_declarations) {
		add_declaration(node, declaration);
	}

	return reactive_declarations;
}
