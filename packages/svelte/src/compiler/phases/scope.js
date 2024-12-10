/** @import { ClassDeclaration, Expression, FunctionDeclaration, Identifier, ImportDeclaration, MemberExpression, Node, Pattern, VariableDeclarator } from 'estree' */
/** @import { Context, Visitor } from 'zimmerframe' */
/** @import { AST, Binding, DeclarationKind } from '#compiler' */
import is_reference from 'is-reference';
import { walk } from 'zimmerframe';
import { create_expression_metadata } from './nodes.js';
import * as b from '../utils/builders.js';
import * as e from '../errors.js';
import {
	extract_identifiers,
	extract_identifiers_from_destructuring,
	object,
	unwrap_pattern
} from '../utils/ast.js';
import { is_reserved, is_rune } from '../../utils.js';
import { determine_slot } from '../utils/slot.js';
import { validate_identifier_name } from './2-analyze/visitors/shared/utils.js';

export class Scope {
	/** @type {ScopeRoot} */
	root;

	/**
	 * The immediate parent scope
	 * @type {Scope | null}
	 */
	parent;

	/**
	 * Whether or not `var` declarations are contained by this scope
	 * @type {boolean}
	 */
	#porous;

	/**
	 * A map of every identifier declared by this scope, and all the
	 * identifiers that reference it
	 * @type {Map<string, Binding>}
	 */
	declarations = new Map();

	/**
	 * A map of declarators to the bindings they declare
	 * @type {Map<VariableDeclarator | AST.LetDirective, Binding[]>}
	 */
	declarators = new Map();

	/**
	 * A set of all the names referenced with this scope
	 * — useful for generating unique names
	 * @type {Map<string, { node: Identifier; path: AST.SvelteNode[] }[]>}
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
		this.parent = parent;
		this.#porous = porous;
		this.function_depth = parent ? parent.function_depth + (porous ? 0 : 1) : 0;
	}

	/**
	 * @param {Identifier} node
	 * @param {Binding['kind']} kind
	 * @param {DeclarationKind} declaration_kind
	 * @param {null | Expression | FunctionDeclaration | ClassDeclaration | ImportDeclaration | AST.EachBlock | AST.SnippetBlock} initial
	 * @returns {Binding}
	 */
	declare(node, kind, declaration_kind, initial = null) {
		if (this.parent) {
			if (declaration_kind === 'var' && this.#porous) {
				return this.parent.declare(node, kind, declaration_kind);
			}

			if (declaration_kind === 'import') {
				return this.parent.declare(node, kind, declaration_kind, initial);
			}
		}

		if (this.declarations.has(node.name)) {
			// This also errors on var/function types, but that's arguably a good thing
			e.declaration_duplicate(node, node.name);
		}

		/** @type {Binding} */
		const binding = {
			node,
			references: [],
			legacy_dependencies: [],
			initial,
			reassigned: false,
			mutated: false,
			updated: false,
			scope: this,
			kind,
			declaration_kind,
			is_called: false,
			prop_alias: null,
			metadata: null
		};

		validate_identifier_name(binding, this.function_depth);

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
			return /** @type {Scope} */ (this.parent).generate(preferred_name);
		}

		preferred_name = preferred_name.replace(/[^a-zA-Z0-9_$]/g, '_').replace(/^[0-9]/, '_');
		let name = preferred_name;
		let n = 1;

		while (
			this.references.has(name) ||
			this.declarations.has(name) ||
			this.root.conflicts.has(name) ||
			is_reserved(name)
		) {
			name = `${preferred_name}_${n++}`;
		}

		this.references.set(name, []);
		this.root.conflicts.add(name);
		return name;
	}

	/**
	 * @param {string} name
	 * @returns {Binding | null}
	 */
	get(name) {
		return this.declarations.get(name) ?? this.parent?.get(name) ?? null;
	}

	/**
	 * @param {VariableDeclarator | AST.LetDirective} node
	 * @returns {Binding[]}
	 */
	get_bindings(node) {
		const bindings = this.declarators.get(node);
		if (!bindings) {
			throw new Error('No binding found for declarator');
		}
		return bindings;
	}

	/**
	 * @param {string} name
	 * @returns {Scope | null}
	 */
	owner(name) {
		return this.declarations.has(name) ? this : this.parent && this.parent.owner(name);
	}

	/**
	 * @param {Identifier} node
	 * @param {AST.SvelteNode[]} path
	 */
	reference(node, path) {
		path = [...path]; // ensure that mutations to path afterwards don't affect this reference
		let references = this.references.get(node.name);

		if (!references) this.references.set(node.name, (references = []));

		references.push({ node, path });

		const binding = this.declarations.get(node.name);
		if (binding) {
			binding.references.push({ node, path });
		} else if (this.parent) {
			this.parent.reference(node, path);
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
 * @param {AST.SvelteNode} ast
 * @param {ScopeRoot} root
 * @param {boolean} allow_reactive_declarations
 * @param {Scope | null} parent
 */
export function create_scopes(ast, root, allow_reactive_declarations, parent) {
	/** @typedef {{ scope: Scope }} State */

	/**
	 * A map of node->associated scope. A node appearing in this map does not necessarily mean that it created a scope
	 * @type {Map<AST.SvelteNode, Scope>}
	 */
	const scopes = new Map();
	const scope = new Scope(root, parent, false);
	scopes.set(ast, scope);

	/** @type {State} */
	const state = { scope };

	/** @type {[Scope, { node: Identifier; path: AST.SvelteNode[] }][]} */
	const references = [];

	/** @type {[Scope, Pattern | MemberExpression][]} */
	const updates = [];

	/**
	 * An array of reactive declarations, i.e. the `a` in `$: a = b * 2`
	 * @type {Identifier[]}
	 */
	const possible_implicit_declarations = [];

	/**
	 * @param {Scope} scope
	 * @param {Pattern[]} params
	 */
	function add_params(scope, params) {
		for (const param of params) {
			for (const node of extract_identifiers(param)) {
				scope.declare(node, 'normal', param.type === 'RestElement' ? 'rest_param' : 'param');
			}
		}
	}

	/**
	 * @type {Visitor<Node, State, AST.SvelteNode>}
	 */
	const create_block_scope = (node, { state, next }) => {
		const scope = state.scope.child(true);
		scopes.set(node, scope);

		next({ scope });
	};

	/**
	 * @type {Visitor<AST.ElementLike, State, AST.SvelteNode>}
	 */
	const SvelteFragment = (node, { state, next }) => {
		const scope = state.scope.child();
		scopes.set(node, scope);
		next({ scope });
	};

	/**
	 * @type {Visitor<AST.Component | AST.SvelteComponent | AST.SvelteSelf, State, AST.SvelteNode>}
	 */
	const Component = (node, context) => {
		node.metadata.scopes = {
			default: context.state.scope.child()
		};

		if (node.type === 'SvelteComponent') {
			context.visit(node.expression);
		}

		const default_state = determine_slot(node)
			? context.state
			: { scope: node.metadata.scopes.default };

		for (const attribute of node.attributes) {
			if (attribute.type === 'LetDirective') {
				context.visit(attribute, default_state);
			} else {
				context.visit(attribute);
			}
		}

		for (const child of node.fragment.nodes) {
			let state = default_state;

			const slot_name = determine_slot(child);

			if (slot_name !== null) {
				node.metadata.scopes[slot_name] = context.state.scope.child();

				state = {
					scope: node.metadata.scopes[slot_name]
				};
			}

			context.visit(child, state);
		}
	};

	/**
	 * @type {Visitor<AST.AnimateDirective | AST.TransitionDirective | AST.UseDirective, State, AST.SvelteNode>}
	 */
	const SvelteDirective = (node, { state, path, visit }) => {
		state.scope.reference(b.id(node.name.split('.')[0]), path);

		if (node.expression) {
			visit(node.expression);
		}
	};

	walk(ast, state, {
		// references
		Identifier(node, { path, state }) {
			const parent = path.at(-1);
			if (
				parent &&
				is_reference(node, /** @type {Node} */ (parent)) &&
				// TSTypeAnnotation, TSInterfaceDeclaration etc - these are normally already filtered out,
				// but for the migration they aren't, so we need to filter them out here
				// TODO -> once migration script is gone we can remove this check
				!parent.type.startsWith('TS')
			) {
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
		SlotElement: SvelteFragment,
		SvelteElement: SvelteFragment,
		RegularElement: SvelteFragment,

		LetDirective(node, context) {
			const scope = context.state.scope;

			/** @type {Binding[]} */
			const bindings = [];
			scope.declarators.set(node, bindings);

			if (node.expression) {
				for (const id of extract_identifiers_from_destructuring(node.expression)) {
					const binding = scope.declare(id, 'template', 'const');
					scope.reference(id, [context.path[context.path.length - 1], node]);
					bindings.push(binding);
				}
			} else {
				/** @type {Identifier} */
				const id = {
					name: node.name,
					type: 'Identifier',
					start: node.start,
					end: node.end
				};
				const binding = scope.declare(id, 'template', 'const');
				scope.reference(id, [context.path[context.path.length - 1], node]);
				bindings.push(binding);
			}
		},

		Component: (node, context) => {
			context.state.scope.reference(b.id(node.name), context.path);
			Component(node, context);
		},
		SvelteSelf: Component,
		SvelteComponent: Component,

		// updates
		AssignmentExpression(node, { state, next }) {
			updates.push([state.scope, node.left]);
			next();
		},

		UpdateExpression(node, { state, next }) {
			updates.push([state.scope, /** @type {Identifier | MemberExpression} */ (node.argument)]);
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
		SwitchStatement: create_block_scope,
		BlockStatement(node, context) {
			const parent = context.path.at(-1);
			if (
				parent?.type === 'FunctionDeclaration' ||
				parent?.type === 'FunctionExpression' ||
				parent?.type === 'ArrowFunctionExpression'
			) {
				// We already created a new scope for the function
				context.next();
			} else {
				create_block_scope(node, context);
			}
		},

		ClassDeclaration(node, { state, next }) {
			if (node.id) state.scope.declare(node.id, 'normal', 'let', node);
			next();
		},

		VariableDeclaration(node, { state, path, next }) {
			const is_parent_const_tag = path.at(-1)?.type === 'ConstTag';
			for (const declarator of node.declarations) {
				/** @type {Binding[]} */
				const bindings = [];

				state.scope.declarators.set(declarator, bindings);

				for (const id of extract_identifiers(declarator.id)) {
					const binding = state.scope.declare(
						id,
						is_parent_const_tag ? 'template' : 'normal',
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
					scope.declare(id, 'normal', 'let');
				}

				next({ scope });
			} else {
				next();
			}
		},

		EachBlock(node, { state, visit }) {
			visit(node.expression);

			// context and children are a new scope
			const scope = state.scope.child();
			scopes.set(node, scope);

			if (node.context) {
				// declarations
				for (const id of extract_identifiers(node.context)) {
					const binding = scope.declare(id, 'each', 'const');

					let inside_rest = false;
					let is_rest_id = false;
					walk(node.context, null, {
						Identifier(node) {
							if (inside_rest && node === id) {
								is_rest_id = true;
							}
						},
						RestElement(_, { next }) {
							const prev = inside_rest;
							inside_rest = true;
							next();
							inside_rest = prev;
						}
					});

					binding.metadata = { inside_rest: is_rest_id };
				}

				// Visit to pick up references from default initializers
				visit(node.context, { scope });
			}

			if (node.index) {
				const is_keyed =
					node.key &&
					(node.key.type !== 'Identifier' || !node.index || node.key.name !== node.index);
				scope.declare(b.id(node.index), is_keyed ? 'template' : 'normal', 'const', node);
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
				expression: create_expression_metadata(),
				keyed: false,
				contains_group_binding: false,
				array_name: needs_array_deduplication ? state.scope.root.unique('$$array') : null,
				index: scope.root.unique('$$index'),
				declarations: scope.declarations,
				is_controlled: false
			};
		},

		AwaitBlock(node, context) {
			context.visit(node.expression);

			if (node.pending) {
				context.visit(node.pending);
			}

			if (node.then) {
				context.visit(node.then);
				if (node.value) {
					const then_scope = /** @type {Scope} */ (scopes.get(node.then));
					const value_scope = context.state.scope.child();
					scopes.set(node.value, value_scope);
					context.visit(node.value, { scope: value_scope });
					for (const id of extract_identifiers(node.value)) {
						then_scope.declare(id, 'template', 'const');
						value_scope.declare(id, 'normal', 'const');
					}
				}
			}

			if (node.catch) {
				context.visit(node.catch);
				if (node.error) {
					const catch_scope = /** @type {Scope} */ (scopes.get(node.catch));
					const error_scope = context.state.scope.child();
					scopes.set(node.error, error_scope);
					context.visit(node.error, { scope: error_scope });
					for (const id of extract_identifiers(node.error)) {
						catch_scope.declare(id, 'template', 'const');
						error_scope.declare(id, 'normal', 'const');
					}
				}
			}
		},

		SnippetBlock(node, context) {
			const state = context.state;
			let scope = state.scope;

			scope.declare(node.expression, 'normal', 'function', node);

			const child_scope = state.scope.child();
			scopes.set(node, child_scope);

			for (const param of node.parameters) {
				for (const id of extract_identifiers(param)) {
					child_scope.declare(id, 'snippet', 'let');
				}
			}

			context.next({ scope: child_scope });
		},

		Fragment: (node, context) => {
			const scope = context.state.scope.child(node.metadata.transparent);
			scopes.set(node, scope);
			context.next({ scope });
		},

		BindDirective(node, context) {
			updates.push([
				context.state.scope,
				/** @type {Identifier | MemberExpression} */ (node.expression)
			]);
			context.next();
		},

		TransitionDirective: SvelteDirective,
		AnimateDirective: SvelteDirective,
		UseDirective: SvelteDirective,
		// using it's own function instead of `SvelteDirective` because
		// StyleDirective doesn't have expressions and are generally already
		// handled by `Identifier`. This is the special case for the shorthand
		// eg <button style:height /> where the variable has the same name of
		// the css property
		StyleDirective(node, { path, state, next }) {
			if (node.value === true) {
				state.scope.reference(b.id(node.name), path.concat(node));
			}
			next();
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
		for (const expression of unwrap_pattern(node)) {
			const left = object(expression);
			const binding = left && scope.get(left.name);

			if (binding !== null && left !== binding.node) {
				binding.updated = true;

				if (left === expression) {
					binding.reassigned = true;
				} else {
					binding.mutated = true;
				}
			}
		}
	}

	return {
		scope,
		scopes
	};
}

/**
 * @template {{ scope: Scope, scopes: Map<AST.SvelteNode, Scope> }} State
 * @param {AST.SvelteNode} node
 * @param {Context<AST.SvelteNode, State>} context
 */
export function set_scope(node, { next, state }) {
	const scope = state.scopes.get(node);
	next(scope !== undefined && scope !== state.scope ? { ...state, scope } : state);
}

/**
 * Returns the name of the rune if the given expression is a `CallExpression` using a rune.
 * @param {Node | null | undefined} node
 * @param {Scope} scope
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

	if (n.type === 'CallExpression' && n.callee.type === 'Identifier') {
		joined = '()' + joined;
		n = n.callee;
	}

	if (n.type !== 'Identifier') return null;

	joined = n.name + joined;

	if (!is_rune(joined)) return null;

	const binding = scope.get(n.name);
	if (binding !== null) return null; // rune name, but references a variable or store

	return joined;
}
