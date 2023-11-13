import is_reference from 'is-reference';
import { walk } from 'zimmerframe';
import { error } from '../../errors.js';
import { extract_identifiers, extract_paths, get_callee_name } from '../../utils/ast.js';
import * as b from '../../utils/builders.js';
import { ReservedKeywords, Runes } from '../constants.js';
import { Scope, ScopeRoot, create_scopes, get_rune, set_scope } from '../scope.js';
import { merge } from '../visitors.js';
import Stylesheet from './css/Stylesheet.js';
import { warn } from '../../warnings.js';
import check_graph_for_cycles from './utils/check_graph_for_cycles.js';
import { validate_template } from './visitors/validate-template.js';
import { validate_a11y } from './visitors/validate-a11y.js';
import { validate_legacy } from './visitors/validate-legacy.js';
import { validate_runes } from './visitors/validate-runes.js';
import { common_visitors } from './visitors/common.js';

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

	walk(
		/** @type {import('estree').Node} */ (ast),
		{ scope },
		// @ts-expect-error TODO clean this mess up
		merge(set_scope(scopes), validation_runes_js, runes_scope_js_tweaker)
	);

	/** @type {import('../types').RawWarning[]} */
	const warnings = [];

	// If we are in runes mode, then check for possible misuses of state runes
	for (const [, scope] of scopes) {
		for (const [name, binding] of scope.declarations) {
			if (binding.kind === 'state' && !binding.mutated) {
				warn(warnings, binding.node, [], 'state-rune-not-mutated', name);
			}
		}
	}

	return {
		module: { ast, scope, scopes },
		name: options.filename || 'module',
		warnings,
		accessors: false
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
			!Runes.includes(name) ||
			(declaration !== null &&
				// const state = $state(0) is valid
				!Runes.includes(
					/** @type {string} */ (
						get_callee_name(/** @type {import('estree').Expression} */ (declaration.initial))
					)
				) &&
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
				} else if (declaration !== null && Runes.includes(name)) {
					warn(warnings, declaration.node, [], 'store-with-rune-name', store_name);
				}
			}

			if (module.ast) {
				// if the reference is inside context="module", error. this is a bit hacky but it works
				for (const { node } of references) {
					if (
						/** @type {number} */ (node.start) > /** @type {number} */ (module.ast.start) &&
						/** @type {number} */ (node.end) < /** @type {number} */ (module.ast.end)
					) {
						error(node, 'illegal-subscription');
					}
				}
			}

			const binding = instance.scope.declare(b.id(name), 'store_sub', 'synthetic');
			binding.references = references;
		}
	}

	const component_name = get_component_name(options.filename ?? 'Component');

	// TODO remove all the ?? stuff, we don't need it now that we're validating the config
	/** @type {import('../types.js').ComponentAnalysis} */
	const analysis = {
		name: module.scope.generate(options.name ?? component_name),
		root: scope_root,
		module,
		instance,
		template,
		elements: [],
		stylesheet: new Stylesheet({
			ast: root.css,
			// TODO are any of these necessary or can we just pass in the whole `analysis` object later?
			filename: options.filename ?? '<unknown>',
			component_name,
			get_css_hash: options.cssHash
		}),
		runes:
			options.runes ?? Array.from(module.scope.references).some(([name]) => Runes.includes(name)),
		exports: [],
		uses_props: false,
		uses_rest_props: false,
		uses_slots: false,
		uses_component_bindings: false,
		custom_element: options.customElement,
		inject_styles: options.css === 'injected' || !!options.customElement,
		accessors: options.customElement ? true : !!options.accessors,
		reactive_statements: new Map(),
		binding_groups: new Map(),
		slot_names: new Set(),
		warnings
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
				merge(
					set_scope(scopes),
					validate_template,
					validate_a11y,
					validate_runes,
					runes_scope_tweaker,
					common_visitors
				)
			);
		}

		// If we are in runes mode, then check for possible misuses of state runes
		for (const [, scope] of instance.scopes) {
			for (const [name, binding] of scope.declarations) {
				if (binding.kind === 'state' && !binding.mutated) {
					warn(warnings, binding.node, [], 'state-rune-not-mutated', name);
				}
			}
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
				merge(
					// @ts-expect-error TODO
					set_scope(scopes),
					validate_template,
					validate_a11y,
					validate_legacy,
					legacy_scope_tweaker,
					common_visitors
				)
			);
		}

		analysis.reactive_statements = order_reactive_statements(analysis.reactive_statements);
	}

	analysis.stylesheet.validate(analysis);

	for (const element of analysis.elements) {
		analysis.stylesheet.apply(element);
	}

	analysis.stylesheet.reify(options.generate === 'client');

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
			for (const id of extract_identifiers(node.body.expression.left)) {
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
			for (const id of extract_identifiers(node.left)) {
				state.reactive_statement.assignments.add(id);
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
						binding.kind = 'state';
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

		if (node.declaration.type === 'FunctionDeclaration') {
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

/** @type {import('zimmerframe').Visitors<import('#compiler').SvelteNode, { scope: Scope }>} */
const runes_scope_js_tweaker = {
	VariableDeclarator(node, { state }) {
		if (node.init?.type !== 'CallExpression') return;
		if (get_rune(node.init, state.scope) === null) return;

		const callee = node.init.callee;
		if (callee.type !== 'Identifier') return;

		const name = callee.name;
		if (name !== '$state' && name !== '$derived') return;

		for (const path of extract_paths(node.id)) {
			// @ts-ignore this fails in CI for some insane reason
			const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(path.node.name));
			binding.kind = name === '$state' ? 'state' : 'derived';
		}
	}
};

/** @type {import('./types').Visitors} */
const runes_scope_tweaker = {
	VariableDeclarator(node, { state }) {
		if (node.init?.type !== 'CallExpression') return;
		if (get_rune(node.init, state.scope) === null) return;

		const callee = node.init.callee;
		if (callee.type !== 'Identifier') return;

		const name = callee.name;
		if (name !== '$state' && name !== '$derived' && name !== '$props') return;

		for (const path of extract_paths(node.id)) {
			// @ts-ignore this fails in CI for some insane reason
			const binding = /** @type {import('#compiler').Binding} */ (state.scope.get(path.node.name));
			binding.kind =
				name === '$state'
					? 'state'
					: name === '$derived'
					? 'derived'
					: path.is_rest
					? 'rest_prop'
					: 'prop';
		}

		if (name === '$props') {
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
		state.analysis.exports.push({
			name: node.local.name,
			alias: node.exported.name
		});
	},
	ExportNamedDeclaration(node, { next, state }) {
		if (!node.declaration) {
			return next();
		}

		if (node.declaration.type === 'FunctionDeclaration') {
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
