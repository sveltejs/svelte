import is_reference from 'is-reference';
import { walk } from 'zimmerframe';
import { is_element_node } from './nodes.js';
import * as b from '../utils/builders.js';
import { error } from '../errors.js';
import { extract_identifiers, extract_identifiers_from_expression } from '../utils/ast.js';
import { JsKeywords, Runes } from './constants.js';

export class Scope {
	/** @type {ScopeRoot} */
	root;

	/**
	 * The immediate parent scope
	 * @type {Scope | null}
	 */
	#parent;

	/**
	 * Whether or not `var` declarations are contained by this scope
	 * @type {boolean}
	 */
	#porous;

	/**
	 * A map of every identifier declared by this scope, and all the
	 * identifiers that reference it
	 * @type {Map<string, import('#compiler').Binding>}
	 */
	declarations = new Map();

	/**
	 * A map of declarators to the bindings they declare
	 * @type {Map<import('estree').VariableDeclarator | import('#compiler').LetDirective, import('#compiler').Binding[]>}
	 */
	declarators = new Map();

	/**
	 * A set of all the names referenced with this scope
	 * — useful for generating unique names
	 * @type {Map<string, { node: import('estree').Identifier; path: import('#compiler').SvelteNode[] }[]>}
	 */
	references = new Map();

	/**
	 * The scope depth allows us to determine if a state variable is referenced in its own scope,
	 * which is usually an error. Block statements do not increase this value
	 */
	function_depth = 0;

	/**
	 *
	 * @param {ScopeRoot} root
	 * @param {Scope | null} parent
	 * @param {boolean} porous
	 */
	constructor(root, parent, porous) {
		this.root = root;
		this.#parent = parent;
		this.#porous = porous;
		this.function_depth = parent ? parent.function_depth + (porous ? 0 : 1) : 0;
	}

	/**
	 * @param {import('estree').Identifier} node
	 * @param {import('#compiler').Binding['kind']} kind
	 * @param {import('#compiler').DeclarationKind} declaration_kind
	 * @param {null | import('estree').Expression | import('estree').FunctionDeclaration | import('estree').ClassDeclaration | import('estree').ImportDeclaration} initial
	 * @returns {import('#compiler').Binding}
	 */
	declare(node, kind, declaration_kind, initial = null) {
		if (node.name === '$') {
			error(node, 'invalid-dollar-binding');
		}

		if (
			node.name.startsWith('$') &&
			declaration_kind !== 'synthetic' &&
			declaration_kind !== 'param' &&
			declaration_kind !== 'rest_param' &&
			this.function_depth <= 1
		) {
			error(node, 'invalid-dollar-prefix');
		}

		if (this.#parent) {
			if (declaration_kind === 'var' && this.#porous) {
				return this.#parent.declare(node, kind, declaration_kind);
			}

			if (declaration_kind === 'import') {
				return this.#parent.declare(node, kind, declaration_kind, initial);
			}
		}

		if (this.declarations.has(node.name)) {
			// This also errors on var/function types, but that's arguably a good thing
			error(node, 'duplicate-declaration', node.name);
		}

		/** @type {import('#compiler').Binding} */
		const binding = {
			node,
			references: [],
			legacy_dependencies: [],
			initial,
			mutated: false,
			scope: this,
			kind,
			declaration_kind,
			is_called: false,
			prop_alias: null,
			expression: null,
			mutation: null,
			reassigned: false
		};
		this.declarations.set(node.name, binding);
		this.root.conflicts.add(node.name);
		return binding;
	}

	child(porous = false) {
		return new Scope(this.root, this, porous);
	}

	/**
	 * @param {string} preferred_name
	 * @returns {string}
	 */
	generate(preferred_name) {
		if (this.#porous) {
			return /** @type {Scope} */ (this.#parent).generate(preferred_name);
		}

		preferred_name = preferred_name.replace(/[^a-zA-Z0-9_$]/g, '_').replace(/^[0-9]/, '_');
		let name = preferred_name;
		let n = 1;

		while (
			this.references.has(name) ||
			this.declarations.has(name) ||
			this.root.conflicts.has(name) ||
			JsKeywords.includes(name)
		) {
			name = `${preferred_name}_${n++}`;
		}

		this.references.set(name, []);
		this.root.conflicts.add(name);
		return name;
	}

	/**
	 * @param {string} name
	 * @returns {import('#compiler').Binding | null}
	 */
	get(name) {
		return this.declarations.get(name) ?? this.#parent?.get(name) ?? null;
	}

	/**
	 * @param {import('estree').VariableDeclarator | import('#compiler').LetDirective} node
	 * @returns {import('#compiler').Binding[]}
	 */
	get_bindings(node) {
		const bindings = this.declarators.get(node);
		if (!bindings) {
			error(node, 'INTERNAL', 'No binding found for declarator');
		}
		return bindings;
	}

	/**
	 * @param {string} name
	 * @returns {Scope | null}
	 */
	owner(name) {
		return this.declarations.has(name) ? this : this.#parent && this.#parent.owner(name);
	}

	/**
	 * @param {import('estree').Identifier} node
	 * @param {import('#compiler').SvelteNode[]} path
	 */
	reference(node, path) {
		path = [...path]; // ensure that mutations to path afterwards don't affect this reference
		let references = this.references.get(node.name);
		if (!references) this.references.set(node.name, (references = []));

		references.push({ node, path });

		const binding = this.declarations.get(node.name);
		if (binding) {
			binding.references.push({ node, path });
		} else if (this.#parent) {
			this.#parent.reference(node, path);
		} else {
			// no binding was found, and this is the top level scope,
			// which means this is a global
			this.root.conflicts.add(node.name);
		}
	}
}

export class ScopeRoot {
	/** @type {Set<string>} */
	conflicts = new Set();

	/**
	 * @param {string} preferred_name
	 */
	unique(preferred_name) {
		preferred_name = preferred_name.replace(/[^a-zA-Z0-9_$]/g, '_');
		let final_name = preferred_name;
		let n = 1;

		while (this.conflicts.has(final_name)) {
			final_name = `${preferred_name}_${n++}`;
		}

		this.conflicts.add(final_name);
		const id = b.id(final_name);
		return id;
	}
}

/**
 * @param {import('#compiler').SvelteNode} ast
 * @param {ScopeRoot} root
 * @param {boolean} allow_reactive_declarations
 * @param {Scope | null} parent
 */
export function create_scopes(ast, root, allow_reactive_declarations, parent) {
	/** @typedef {{ scope: Scope }} State */

	/**
	 * A map of node->associated scope. A node appearing in this map does not necessarily mean that it created a scope
	 * @type {Map<import('#compiler').SvelteNode, Scope>}
	 */
	const scopes = new Map();
	const scope = new Scope(root, parent, false);
	scopes.set(ast, scope);

	/** @type {State} */
	const state = { scope };

	/** @type {[Scope, { node: import('estree').Identifier; path: import('#compiler').SvelteNode[] }][]} */
	const references = [];

	/** @type {[Scope, import('estree').Pattern | import('estree').MemberExpression][]} */
	const updates = [];

	/**
	 * An array of reactive declarations, i.e. the `a` in `$: a = b * 2`
	 * @type {import('estree').Identifier[]}
	 */
	const possible_implicit_declarations = [];

	/**
	 * @param {Scope} scope
	 * @param {import('estree').Pattern[]} params
	 */
	function add_params(scope, params) {
		for (const param of params) {
			for (const node of extract_identifiers(param)) {
				scope.declare(node, 'normal', param.type === 'RestElement' ? 'rest_param' : 'param');
			}
		}
	}

	/**
	 * @type {import('zimmerframe').Visitor<import('estree').Node, State, import('#compiler').SvelteNode>}
	 */
	const create_block_scope = (node, { state, next }) => {
		const scope = state.scope.child(true);
		scopes.set(node, scope);

		next({ scope });
	};

	/**
	 * @type {import('zimmerframe').Visitor<import('#compiler').ElementLike, State, import('#compiler').SvelteNode>}
	 */
	const SvelteFragment = (node, { state, next }) => {
		const scope = analyze_let_directives(node, state.scope);
		scopes.set(node, scope);
		next({ scope });
	};

	/**
	 * @param {import('#compiler').ElementLike} node
	 * @param {Scope} parent
	 */
	function analyze_let_directives(node, parent) {
		const scope = parent.child();

		for (const attribute of node.attributes) {
			if (attribute.type !== 'LetDirective') continue;

			/** @type {import('#compiler').Binding[]} */
			const bindings = [];
			scope.declarators.set(attribute, bindings);

			// attach the scope to the directive itself, as well as the
			// contents to which it applies
			scopes.set(attribute, scope);

			if (attribute.expression) {
				for (const id of extract_identifiers_from_expression(attribute.expression)) {
					const binding = scope.declare(id, 'derived', 'const');
					bindings.push(binding);
				}
			} else {
				/** @type {import('estree').Identifier} */
				const id = {
					name: attribute.name,
					type: 'Identifier',
					start: attribute.start,
					end: attribute.end
				};
				const binding = scope.declare(id, 'derived', 'const');
				bindings.push(binding);
			}
		}
		return scope;
	}

	walk(ast, state, {
		// references
		Identifier(node, { path, state }) {
			const parent = path.at(-1);
			if (parent && is_reference(node, /** @type {import('estree').Node} */ (parent))) {
				references.push([state.scope, { node, path: path.slice() }]);
			}
		},

		LabeledStatement(node, { path, next }) {
			if (path.length > 1 || !allow_reactive_declarations) return next();
			if (node.label.name !== '$') return next();

			// create a scope for the $: block
			const scope = state.scope.child();
			scopes.set(node, scope);

			if (
				node.body.type === 'ExpressionStatement' &&
				node.body.expression.type === 'AssignmentExpression'
			) {
				for (const id of extract_identifiers(node.body.expression.left)) {
					if (!id.name.startsWith('$')) {
						possible_implicit_declarations.push(id);
					}
				}
			}

			next({ scope });
		},

		SvelteFragment,
		SvelteElement: SvelteFragment,
		RegularElement: SvelteFragment,

		Component(node, { state, visit, path }) {
			state.scope.reference(b.id(node.name), path);

			// let:x from the default slot is a weird one:
			// Its scope only applies to children that are not slots themselves.
			for (const attribute of node.attributes) {
				visit(attribute);
			}

			const scope = analyze_let_directives(node, state.scope);
			scopes.set(node, scope);

			for (const child of node.fragment.nodes) {
				if (
					is_element_node(child) &&
					child.attributes.some(
						(attribute) => attribute.type === 'Attribute' && attribute.name === 'slot'
					)
				) {
					// <div slot="..."> inherits the scope above the component, because slots are hella weird
					scopes.set(child, state.scope);
					visit(child);
				} else if (child.type === 'SnippetBlock') {
					visit(child, { scope });
				} else {
					visit(child, { scope });
				}
			}
		},

		// updates
		AssignmentExpression(node, { state, next }) {
			updates.push([state.scope, node.left]);
			next();
		},

		UpdateExpression(node, { state, next }) {
			updates.push([
				state.scope,
				/** @type {import('estree').Identifier | import('estree').MemberExpression} */ (
					node.argument
				)
			]);
			next();
		},

		ImportDeclaration(node, { state }) {
			for (const specifier of node.specifiers) {
				state.scope.declare(specifier.local, 'normal', 'import', node);
			}
		},

		FunctionExpression(node, { state, next }) {
			const scope = state.scope.child();
			scopes.set(node, scope);

			if (node.id) scope.declare(node.id, 'normal', 'function');

			add_params(scope, node.params);
			next({ scope });
		},

		FunctionDeclaration(node, { state, next }) {
			if (node.id) state.scope.declare(node.id, 'normal', 'function', node);

			const scope = state.scope.child();
			scopes.set(node, scope);

			add_params(scope, node.params);
			next({ scope });
		},

		ArrowFunctionExpression(node, { state, next }) {
			const scope = state.scope.child();
			scopes.set(node, scope);

			add_params(scope, node.params);
			next({ scope });
		},

		ForStatement: create_block_scope,
		ForInStatement: create_block_scope,
		ForOfStatement: create_block_scope,
		BlockStatement: create_block_scope,
		SwitchStatement: create_block_scope,

		ClassDeclaration(node, { state, next }) {
			if (node.id) state.scope.declare(node.id, 'normal', 'const', node);
			next();
		},

		VariableDeclaration(node, { state, path, next }) {
			const is_parent_const_tag = path.at(-1)?.type === 'ConstTag';
			for (const declarator of node.declarations) {
				/** @type {import('#compiler').Binding[]} */
				const bindings = [];

				state.scope.declarators.set(declarator, bindings);

				for (const id of extract_identifiers(declarator.id)) {
					const binding = state.scope.declare(
						id,
						is_parent_const_tag ? 'derived' : 'normal',
						node.kind,
						declarator.init
					);
					bindings.push(binding);
				}
			}

			next();
		},

		CatchClause(node, { state, next }) {
			if (node.param) {
				const scope = state.scope.child(true);
				scopes.set(node, scope);

				for (const id of extract_identifiers(node.param)) {
					state.scope.declare(id, 'normal', 'let');
				}

				next({ scope });
			} else {
				next();
			}
		},

		EachBlock(node, { state, visit }) {
			// Array part is still from the scope above
			/** @type {Set<import('estree').Identifier>} */
			const references_within = new Set();
			const idx = references.length;
			visit(node.expression);
			for (let i = idx; i < references.length; i++) {
				const [scope, { node: id }] = references[i];
				if (scope === state.scope) {
					references_within.add(id);
				}
			}
			scopes.set(node.expression, state.scope);

			// context and children are a new scope
			const scope = state.scope.child();
			scopes.set(node, scope);

			// declarations
			for (const id of extract_identifiers(node.context)) {
				scope.declare(id, 'each', 'const');
			}
			if (node.context.type !== 'Identifier') {
				scope.declare(b.id('$$item'), 'derived', 'synthetic');
			}

			if (node.index) {
				const is_keyed =
					node.key &&
					(node.key.type !== 'Identifier' || !node.index || node.key.name !== node.index);
				scope.declare(b.id(node.index), is_keyed ? 'derived' : 'normal', 'const');
			}
			if (node.key) visit(node.key, { scope });

			// children
			for (const child of node.body.nodes) {
				visit(child, { scope });
			}
			if (node.fallback) visit(node.fallback, { scope });

			// Check if inner scope shadows something from outer scope.
			// This is necessary because we need access to the array expression of the each block
			// in the inner scope if bindings are used, in order to invalidate the array.
			let needs_array_deduplication = false;
			for (const [name] of scope.declarations) {
				if (state.scope.get(name) !== null) {
					needs_array_deduplication = true;
				}
			}

			node.metadata = {
				contains_group_binding: false,
				array_name: needs_array_deduplication ? state.scope.root.unique('$$array') : null,
				index: scope.root.unique('$$index'),
				item_name: node.context.type === 'Identifier' ? node.context.name : '$$item',
				references: [...references_within]
					.map((id) => /** @type {import('#compiler').Binding} */ (state.scope.get(id.name)))
					.filter(Boolean),
				is_controlled: false
			};
		},

		AwaitBlock(node, context) {
			context.next();

			if (node.then && node.value !== null) {
				const then_scope = /** @type {Scope} */ (scopes.get(node.then));
				const value_scope = context.state.scope.child();
				for (const id of extract_identifiers(node.value)) {
					then_scope.declare(id, 'normal', 'const');
					value_scope.declare(id, 'normal', 'const');
				}
				scopes.set(node.value, value_scope);
			}

			if (node.catch && node.error !== null) {
				const catch_scope = /** @type {Scope} */ (scopes.get(node.catch));
				const error_scope = context.state.scope.child();
				for (const id of extract_identifiers(node.error)) {
					catch_scope.declare(id, 'normal', 'const');
					error_scope.declare(id, 'normal', 'const');
				}
				scopes.set(node.error, error_scope);
			}
		},

		SnippetBlock(node, context) {
			const state = context.state;
			// Special-case for root-level snippets: they become part of the instance scope
			const is_top_level = !context.path.at(-2);
			let scope = state.scope;
			if (is_top_level) {
				scope = /** @type {Scope} */ (parent);
			}
			scope.declare(node.expression, 'normal', 'function', node.expression);

			const child_scope = state.scope.child();
			scopes.set(node, child_scope);

			if (node.context) {
				for (const id of extract_identifiers(node.context)) {
					child_scope.declare(id, 'each', 'let');
				}
			}

			context.next({ scope: child_scope });
		},

		Fragment: (node, context) => {
			const scope = context.state.scope.child(node.transparent);
			scopes.set(node, scope);
			context.next({ scope });
		},

		BindDirective(node, context) {
			updates.push([
				context.state.scope,
				/** @type {import('estree').Identifier | import('estree').MemberExpression} */ (
					node.expression
				)
			]);
			context.next();
		}

		// TODO others
	});

	for (const id of possible_implicit_declarations) {
		const binding = scope.get(id.name);
		if (binding) continue; // TODO can also be legacy_reactive if declared outside of reactive statement

		scope.declare(id, 'legacy_reactive', 'let');
	}

	// we do this after the fact, so that we don't need to worry
	// about encountering references before their declarations
	for (const [scope, { node, path }] of references) {
		scope.reference(node, path);
	}

	for (const [scope, node] of updates) {
		if (node.type === 'MemberExpression') {
			let object = node.object;
			while (object.type === 'MemberExpression') {
				object = object.object;
			}

			const binding = scope.get(/** @type {import('estree').Identifier} */ (object).name);
			if (binding) binding.mutated = true;
		} else {
			extract_identifiers(node).forEach((identifier) => {
				const binding = scope.get(identifier.name);
				if (binding) {
					binding.mutated = true;
					binding.reassigned = true;
				}
			});
		}
	}

	return {
		scope,
		scopes
	};
}

/**
 * @template {{ scope: Scope }} State
 * @param {Map<import('#compiler').SvelteNode, Scope>} scopes
 * @returns {import('zimmerframe').Visitors<import('#compiler').SvelteNode, State>}
 */
export function set_scope(scopes) {
	return {
		/**
		 *
		 * @param {import('#compiler').SvelteNode} node
		 * @param {import('zimmerframe').Context<import('#compiler').SvelteNode, State>} context
		 */
		_(node, { next, state }) {
			const scope = scopes.get(node);
			next(scope !== undefined && scope !== state.scope ? { ...state, scope } : state);
		}
	};
}

/**
 * Returns the name of the rune if the given expression is a `CallExpression` using a rune.
 * @param {import('estree').Node | null | undefined} node
 * @param {Scope} scope
 * @returns {Runes[number] | null}
 */
export function get_rune(node, scope) {
	if (!node) return null;
	if (node.type !== 'CallExpression') return null;

	let n = node.callee;

	let joined = '';

	while (n.type === 'MemberExpression') {
		if (n.computed) return null;
		if (n.property.type !== 'Identifier') return null;
		joined = '.' + n.property.name + joined;
		n = n.object;
	}

	if (n.type !== 'Identifier') return null;

	joined = n.name + joined;
	if (!Runes.includes(/** @type {any} */ (joined))) return null;

	const binding = scope.get(n.name);
	if (binding !== null) return null; // rune name, but references a variable or store

	return /** @type {Runes[number] | null} */ (joined);
}
