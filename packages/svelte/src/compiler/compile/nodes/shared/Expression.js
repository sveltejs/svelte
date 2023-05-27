import { walk } from 'estree-walker';
import is_reference from 'is-reference';
import flatten_reference from '../../utils/flatten_reference.js';
import { create_scopes, extract_names } from '../../utils/scope.js';
import { sanitize } from '../../../utils/names.js';
import get_object from '../../utils/get_object.js';
import is_dynamic from '../../render_dom/wrappers/shared/is_dynamic.js';
import { b } from 'code-red';
import { invalidate } from '../../render_dom/invalidate.js';
import { is_reserved_keyword } from '../../utils/reserved_keywords.js';
import replace_object from '../../utils/replace_object.js';
import is_contextual from './is_contextual.js';
import { clone } from '../../../utils/clone.js';
import compiler_errors from '../../compiler_errors.js';

const regex_contains_term_function_expression = /FunctionExpression/;

export default class Expression {
	/** @type {'Expression'} */
	type = 'Expression';

	/** @type {import('../../Component.js').default} */
	component;

	/** @type {import('../interfaces.js').INode} */
	owner;

	/** @type {import('estree').Node} */
	node;

	/** @type {Set<string>} */
	references = new Set();

	/** @type {Set<string>} */
	dependencies = new Set();

	/** @type {Set<string>} */
	contextual_dependencies = new Set();

	/** @type {import('./TemplateScope.js').default} */
	template_scope;

	/** @type {import('../../utils/scope.js').Scope} */
	scope;

	/** @type {WeakMap<import('estree').Node, import('../../utils/scope.js').Scope>} */
	scope_map;

	/** @type {Array<import('estree').Node | import('estree').Node[]>} */
	declarations = [];
	/** */
	uses_context = false;

	/** @type {import('estree').Node} */
	manipulated;

	/**
	 * @param {import('../../Component.js').default} component  *
	 * @param {import('../interfaces.js').INode} owner  *
	 * @param {import('./TemplateScope.js').default} template_scope  *
	 * @param {import('estree').Node} info  *
	 * @param {boolean} [lazy]  undefined
	 */
	constructor(component, owner, template_scope, info, lazy) {
		// TODO revert to direct property access in prod?
		Object.defineProperties(this, {
			component: {
				value: component
			}
		});
		this.node = info;
		this.template_scope = template_scope;
		this.owner = owner;
		const { dependencies, contextual_dependencies, references } = this;
		let { map, scope } = create_scopes(info);
		this.scope = scope;
		this.scope_map = map;
		const expression = this;
		let function_expression;

		// discover dependencies, but don't change the code yet
		walk(info, {
			/**
			 * @param {any} node
			 * @param {any} parent
			 * @param {string} key
			 */
			enter(node, parent, key) {
				// don't manipulate shorthand props twice
				if (key === 'key' && parent.shorthand) return;
				// don't manipulate `import.meta`, `new.target`
				if (node.type === 'MetaProperty') return this.skip();
				if (map.has(node)) {
					scope = map.get(node);
				}
				if (!function_expression && regex_contains_term_function_expression.test(node.type)) {
					function_expression = node;
				}
				if (is_reference(node, parent)) {
					const { name, nodes } = flatten_reference(node);
					references.add(name);
					if (scope.has(name)) return;
					if (name[0] === '$') {
						const store_name = name.slice(1);
						if (template_scope.names.has(store_name) || scope.has(store_name)) {
							return component.error(node, compiler_errors.contextual_store);
						}
					}
					if (template_scope.is_let(name)) {
						if (!lazy) {
							contextual_dependencies.add(name);
							dependencies.add(name);
						}
					} else if (template_scope.names.has(name)) {
						expression.uses_context = true;
						contextual_dependencies.add(name);
						const owner = template_scope.get_owner(name);
						const is_index = owner.type === 'EachBlock' && owner.key && name === owner.index;
						if (!lazy || is_index) {
							template_scope.dependencies_for_name
								.get(name)
								.forEach(/** @param {any} name */ (name) => dependencies.add(name));
						}
					} else {
						if (!lazy) {
							dependencies.add(name);
						}
						component.add_reference(node, name);
						component.warn_if_undefined(name, nodes[0], template_scope, owner);
					}
					this.skip();
				}
				// track any assignments from template expressions as mutable
				let names;
				let deep = false;
				if (function_expression) {
					if (node.type === 'AssignmentExpression') {
						deep = node.left.type === 'MemberExpression';
						names = extract_names(deep ? get_object(node.left) : node.left);
					} else if (node.type === 'UpdateExpression') {
						deep = node.argument.type === 'MemberExpression';
						names = extract_names(get_object(node.argument));
					}
				}
				if (names) {
					names.forEach(
						/** @param {any} name */ (name) => {
							if (template_scope.names.has(name)) {
								if (template_scope.is_const(name)) {
									component.error(node, compiler_errors.invalid_const_update(name));
								}
								template_scope.dependencies_for_name.get(name).forEach(
									/** @param {any} name */ (name) => {
										const variable = component.var_lookup.get(name);
										if (variable) variable[deep ? 'mutated' : 'reassigned'] = true;
									}
								);
								const each_block = template_scope.get_owner(name);
								/** @type {import('../EachBlock.js').default} */ (each_block).has_binding = true;
							} else {
								component.add_reference(node, name);
								const variable = component.var_lookup.get(name);
								if (variable) {
									variable[deep ? 'mutated' : 'reassigned'] = true;
								}

								/** @type {any} */
								const declaration = scope.find_owner(name)?.declarations.get(name);
								if (declaration) {
									if (declaration.kind === 'const' && !deep) {
										component.error(node, {
											code: 'assignment-to-const',
											message: 'You are assigning to a const'
										});
									}
								} else if (variable && variable.writable === false && !deep) {
									component.error(node, {
										code: 'assignment-to-const',
										message: 'You are assigning to a const'
									});
								}
							}
						}
					);
				}
			},

			/** @param {import('estree').Node} node */
			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
				if (node === function_expression) {
					function_expression = null;
				}
			}
		});
	}
	dynamic_dependencies() {
		return Array.from(this.dependencies).filter(
			/** @param {any} name */ (name) => {
				if (this.template_scope.is_let(name)) return true;
				if (is_reserved_keyword(name)) return true;
				const variable = this.component.var_lookup.get(name);
				return is_dynamic(variable);
			}
		);
	}
	dynamic_contextual_dependencies() {
		return Array.from(this.contextual_dependencies).filter(
			/** @param {any} name */ (name) => {
				return Array.from(this.template_scope.dependencies_for_name.get(name)).some(
					/** @param {any} variable_name */
					(variable_name) => {
						const variable = this.component.var_lookup.get(variable_name);
						return is_dynamic(variable);
					}
				);
			}
		);
	}
	// TODO move this into a render-dom wrapper?

	/**
	 * @param {import('../../render_dom/Block.js').default} [block]
	 * @param {string | void} [ctx]
	 */
	manipulate(block, ctx) {
		// TODO ideally we wouldn't end up calling this method
		// multiple times
		if (this.manipulated) return this.manipulated;
		const { component, declarations, scope_map: map, template_scope, owner } = this;
		let scope = this.scope;
		let function_expression;

		/** @type {Set<string>} */
		let dependencies;

		/** @type {Set<string>} */
		let contextual_dependencies;
		const node = walk(this.node, {
			/**
			 * @param {any} node
			 * @param {any} parent
			 */
			enter(node, parent) {
				if (node.type === 'Property' && node.shorthand) {
					node.value = clone(node.value);
					node.shorthand = false;
				}
				if (map.has(node)) {
					scope = map.get(node);
				}
				if (node.type === 'Identifier' && is_reference(node, parent)) {
					const { name } = flatten_reference(node);
					if (scope.has(name)) return;
					if (function_expression) {
						if (template_scope.names.has(name)) {
							contextual_dependencies.add(name);
							template_scope.dependencies_for_name.get(name).forEach(
								/** @param {any} dependency */ (dependency) => {
									dependencies.add(dependency);
								}
							);
						} else {
							dependencies.add(name);
							component.add_reference(node, name); // TODO is this redundant/misplaced?
						}
					} else if (is_contextual(component, template_scope, name)) {
						const reference = block.renderer.reference(node, ctx);
						this.replace(reference);
					}
					this.skip();
				}
				if (!function_expression) {
					if (node.type === 'AssignmentExpression') {
						// TODO should this be a warning/error? `<p>{foo = 1}</p>`
					}
					if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
						function_expression = node;
						dependencies = new Set();
						contextual_dependencies = new Set();
					}
				}
			},

			/**
			 * @param {import('estree').Node} node
			 * @param {import('estree').Node} parent
			 */
			leave(node, parent) {
				if (map.has(node)) scope = scope.parent;
				if (node === function_expression) {
					const id = component.get_unique_name(sanitize(get_function_name(node, owner)));
					const declaration = b`const ${id} = ${node}`;
					const extract_functions = () => {
						const deps = Array.from(contextual_dependencies);
						const function_expression = /** @type {import('estree').FunctionExpression} */ (node);
						const has_args = function_expression.params.length > 0;
						function_expression.params = [
							...deps.map(
								/** @param {any} name */ (name) =>
									/** @type {import('estree').Identifier} */ ({ type: 'Identifier', name })
							),
							...function_expression.params
						];
						const context_args = deps.map(
							/** @param {any} name */ (name) => block.renderer.reference(name, ctx)
						);
						component.partly_hoisted.push(declaration);
						block.renderer.add_to_context(id.name);
						const callee = block.renderer.reference(id);
						this.replace(/** @type {any} */ (id));
						const func_declaration = has_args
							? b`function ${id}(...args) {
								return ${callee}(${context_args}, ...args);
							}`
							: b`function ${id}() {
								return ${callee}(${context_args});
							}`;
						return { deps, func_declaration };
					};
					if (owner.type === 'ConstTag') {
						// we need a combo block/init recipe
						if (contextual_dependencies.size === 0) {
							let child_scope = scope;
							walk(node, {
								/**
								 * @param {import('estree').Node} node
								 * @param {any} parent
								 */
								enter(node, parent) {
									if (map.has(node)) child_scope = map.get(node);
									if (node.type === 'Identifier' && is_reference(node, parent)) {
										if (child_scope.has(node.name)) return;
										this.replace(block.renderer.reference(node, ctx));
									}
								},

								/** @param {import('estree').Node} node */
								leave(node) {
									if (map.has(node)) child_scope = child_scope.parent;
								}
							});
						} else {
							const { func_declaration } = extract_functions();
							this.replace(func_declaration[0]);
						}
					} else if (dependencies.size === 0 && contextual_dependencies.size === 0) {
						// we can hoist this out of the component completely
						component.fully_hoisted.push(declaration);
						this.replace(/** @type {any} */ (id));
						component.add_var(node, {
							name: id.name,
							internal: true,
							hoistable: true,
							referenced: true
						});
					} else if (contextual_dependencies.size === 0) {
						// function can be hoisted inside the component init
						component.partly_hoisted.push(declaration);
						block.renderer.add_to_context(id.name);
						this.replace(block.renderer.reference(id));
					} else {
						// we need a combo block/init recipe
						const { deps, func_declaration } = extract_functions();
						if (owner.type === 'Attribute' && owner.parent.name === 'slot') {
							/** @type {Set<import('../interfaces.js').INode>} */
							const dep_scopes = new Set(
								deps.map(/** @param {any} name */ (name) => template_scope.get_owner(name))
							);
							// find the nearest scopes

							/** @type {import('../interfaces.js').INode} */
							let node = owner.parent;
							while (node && !dep_scopes.has(node)) {
								node = node.parent;
							}
							const func_expression = func_declaration[0];

							if (node.type === 'SlotTemplate') {
								// <svelte:fragment let:data />
								this.replace(func_expression);
							} else {
								// {#each}, {#await}
								const func_id = component.get_unique_name(id.name + '_func');
								block.renderer.add_to_context(func_id.name, true);
								// rename #ctx -> child_ctx;
								walk(func_expression, {
									/** @param {import('estree').Node} node */
									enter(node) {
										if (node.type === 'Identifier' && node.name === '#ctx') {
											node.name = 'child_ctx';
										}
									}
								});
								// add to get_xxx_context
								// child_ctx[x] = function () { ... }
								/** @type {import('../EachBlock.js').default} */ (
									template_scope.get_owner(deps[0])
								).contexts.push({
									type: 'DestructuredVariable',
									key: func_id,
									modifier: () => func_expression,
									default_modifier: /** @param {any} node */ (node) => node
								});
								this.replace(block.renderer.reference(func_id));
							}
						} else {
							declarations.push(func_declaration);
						}
					}
					function_expression = null;
					dependencies = null;
					contextual_dependencies = null;
					if (parent && parent.type === 'Property') {
						parent.method = false;
					}
				}
				if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
					const assignee = node.type === 'AssignmentExpression' ? node.left : node.argument;
					const object_name = get_object(assignee).name;
					if (scope.has(object_name)) return;
					// normally (`a = 1`, `b.c = 2`), there'll be a single name
					// (a or b). In destructuring cases (`[d, e] = [e, d]`) there
					// may be more, in which case we need to tack the extra ones
					// onto the initial function call
					const names = new Set(extract_names(/** @type {import('estree').Node} */ (assignee)));

					/** @type {Set<string>} */
					const traced = new Set();
					names.forEach(
						/** @param {any} name */ (name) => {
							const dependencies = template_scope.dependencies_for_name.get(name);
							if (dependencies) {
								dependencies.forEach(/** @param {any} name */ (name) => traced.add(name));
							} else {
								traced.add(name);
							}
						}
					);
					const context = block.bindings.get(object_name);
					if (context) {
						// for `{#each array as item}`
						// replace `item = 1` to `each_array[each_index] = 1`, this allow us to mutate the array
						// rather than mutating the local `item` variable
						const { snippet, object, property } = context;

						/** @type {any} */
						const replaced = replace_object(assignee, snippet);
						if (node.type === 'AssignmentExpression') {
							node.left = replaced;
						} else {
							node.argument = replaced;
						}
						contextual_dependencies.add(object.name);
						contextual_dependencies.add(property.name);
					}
					this.replace(invalidate(block.renderer, scope, node, traced));
				}
			}
		});

		if (declarations.length > 0) {
			block.maintain_context = true;
			declarations.forEach(
				/** @param {any} declaration */ (declaration) => {
					block.chunks.init.push(declaration);
				}
			);
		}
		return (this.manipulated = /** @type {import('estree').Node} */ (node));
	}
}

/**
 * @param {any} _node
 * @param {any} parent
 */
function get_function_name(_node, parent) {
	if (parent.type === 'EventHandler') {
		return `${parent.name}_handler`;
	}
	if (parent.type === 'Action') {
		return `${parent.name}_function`;
	}
	return 'func';
}
