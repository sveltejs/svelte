import Component from '../../Component';
import { walk } from 'estree-walker';
import is_reference from 'is-reference';
import flatten_reference from '../../utils/flatten_reference';
import { create_scopes, Scope, extract_names } from '../../utils/scope';
import { sanitize } from '../../../utils/names';
import TemplateScope from './TemplateScope';
import get_object from '../../utils/get_object';
import Block from '../../render_dom/Block';
import is_dynamic from '../../render_dom/wrappers/shared/is_dynamic';
import { b } from 'code-red';
import { invalidate } from '../../render_dom/invalidate';
import { Node, FunctionExpression, Identifier } from 'estree';
import { INode } from '../interfaces';
import { is_reserved_keyword } from '../../utils/reserved_keywords';
import replace_object from '../../utils/replace_object';
import is_contextual from './is_contextual';
import EachBlock from '../EachBlock';

type Owner = INode;

export default class Expression {
	type: 'Expression' = 'Expression';
	component: Component;
	owner: Owner;
	node: Node;
	references: Set<string> = new Set();
	dependencies: Set<string> = new Set();
	contextual_dependencies: Set<string> = new Set();

	template_scope: TemplateScope;
	scope: Scope;
	scope_map: WeakMap<Node, Scope>;

	declarations: Array<(Node | Node[])> = [];
	uses_context = false;

	manipulated: Node;

	constructor(component: Component, owner: Owner, template_scope: TemplateScope, info: Node, lazy?: boolean) {
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
			enter(node: any, parent: any, key: string) {
				// don't manipulate shorthand props twice
				if (key === 'value' && parent.shorthand) return;
				// don't manipulate `import.meta`, `new.target`
				if (node.type === 'MetaProperty') return this.skip();

				if (map.has(node)) {
					scope = map.get(node);
				}

				if (!function_expression && /FunctionExpression/.test(node.type)) {
					function_expression = node;
				}

				if (is_reference(node, parent)) {
					const { name, nodes } = flatten_reference(node);
					references.add(name);

					if (scope.has(name)) return;

					if (name[0] === '$') {
						const store_name = name.slice(1);
						if (template_scope.names.has(store_name) || scope.has(store_name)) {
							component.error(node, {
								code: 'contextual-store',
								message: 'Stores must be declared at the top level of the component (this may change in a future version of Svelte)'
							});
						}
					}

					if (template_scope.is_let(name)) {
						if (!function_expression) { // TODO should this be `!lazy` ?
							contextual_dependencies.add(name);
							dependencies.add(name);
						}
					} else if (template_scope.names.has(name)) {
						expression.uses_context = true;

						contextual_dependencies.add(name);

						const owner = template_scope.get_owner(name);
						const is_index = owner.type === 'EachBlock' && owner.key && name === owner.index;

						if (!lazy || is_index) {
							template_scope.dependencies_for_name.get(name).forEach(name => dependencies.add(name));
						}
					} else {
						if (!lazy) {
							dependencies.add(name);
						}

						component.add_reference(name);
						component.warn_if_undefined(name, nodes[0], template_scope);
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
						names = extract_names(get_object(node.argument));
					}
				}

				if (names) {
					names.forEach(name => {
						if (template_scope.names.has(name)) {
							template_scope.dependencies_for_name.get(name).forEach(name => {
								const variable = component.var_lookup.get(name);
								if (variable) variable[deep ? 'mutated' : 'reassigned'] = true;
							});
							const each_block = template_scope.get_owner(name);
							(each_block as EachBlock).has_binding = true;
						} else {
							component.add_reference(name);

							const variable = component.var_lookup.get(name);
							if (variable) variable[deep ? 'mutated' : 'reassigned'] = true;
						}
					});
				}
			},

			leave(node: Node) {
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
		return Array.from(this.dependencies).filter(name => {
			if (this.template_scope.is_let(name)) return true;
			if (is_reserved_keyword(name)) return true;

			const variable = this.component.var_lookup.get(name);
			return is_dynamic(variable);
		});
	}

	// TODO move this into a render-dom wrapper?
	manipulate(block?: Block) {
		// TODO ideally we wouldn't end up calling this method
		// multiple times
		if (this.manipulated) return this.manipulated;

		const {
			component,
			declarations,
			scope_map: map,
			template_scope,
			owner
		} = this;
		let scope = this.scope;

		let function_expression;

		let dependencies: Set<string>;
		let contextual_dependencies: Set<string>;

		const node = walk(this.node, {
			enter(node: any, parent: any) {
				if (node.type === 'Property' && node.shorthand) {
					node.value = JSON.parse(JSON.stringify(node.value));
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

							template_scope.dependencies_for_name.get(name).forEach(dependency => {
								dependencies.add(dependency);
							});
						} else {
							dependencies.add(name);
							component.add_reference(name); // TODO is this redundant/misplaced?
						}
					} else if (is_contextual(component, template_scope, name)) {
						const reference = block.renderer.reference(node);
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

			leave(node: Node, parent: Node) {
				if (map.has(node)) scope = scope.parent;

				if (node === function_expression) {
					const id = component.get_unique_name(
						sanitize(get_function_name(node, owner))
					);

					const declaration = b`const ${id} = ${node}`;

					if (dependencies.size === 0 && contextual_dependencies.size === 0) {
						// we can hoist this out of the component completely
						component.fully_hoisted.push(declaration);

						this.replace(id as any);

						component.add_var({
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
						const deps = Array.from(contextual_dependencies);
						const function_expression = node as FunctionExpression;

						const has_args = function_expression.params.length > 0;
						function_expression.params = [
							...deps.map(name => ({ type: 'Identifier', name } as Identifier)),
							...function_expression.params
						];

						const context_args = deps.map(name => block.renderer.reference(name));

						component.partly_hoisted.push(declaration);

						block.renderer.add_to_context(id.name);
						const callee = block.renderer.reference(id);

						this.replace(id as any);

						const func_declaration = has_args
							? b`function ${id}(...args) {
								return ${callee}(${context_args}, ...args);
							}`
							: b`function ${id}() {
								return ${callee}(${context_args});
							}`;

						if (owner.type === 'Attribute' && owner.parent.name === 'slot') {
							const dep_scopes = new Set<INode>(deps.map(name => template_scope.get_owner(name)));
							// find the nearest scopes
							let node: INode = owner.parent;
							while (node && !dep_scopes.has(node)) {
								node = node.parent;
							}

							const func_expression = func_declaration[0];

							if (node.type === 'InlineComponent') {
								// <Comp let:data />
								this.replace(func_expression);
							} else {
								// {#each}, {#await}
								const func_id = component.get_unique_name(id.name + '_func');
								block.renderer.add_to_context(func_id.name, true);
								// rename #ctx -> child_ctx;
								walk(func_expression, {
									enter(node: Node) {
										if (node.type === 'Identifier' && node.name === '#ctx') {
											node.name = 'child_ctx';
										}
									}
								});
								// add to get_xxx_context
								// child_ctx[x] = function () { ... }
								(template_scope.get_owner(deps[0]) as EachBlock).contexts.push({
									key: func_id,
									modifier: () => func_expression,
									default_modifier: node => node
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
					const names = new Set(extract_names(assignee));

					const traced: Set<string> = new Set();
					names.forEach(name => {
						const dependencies = template_scope.dependencies_for_name.get(name);
						if (dependencies) {
							dependencies.forEach(name => traced.add(name));
						} else {
							traced.add(name);
						}
					});

					const context = block.bindings.get(object_name);

					if (context) {
						// for `{#each array as item}`
						// replace `item = 1` to `each_array[each_index] = 1`, this allow us to mutate the array
						// rather than mutating the local `item` variable
						const { snippet, object, property } = context;
						const replaced: any = replace_object(assignee, snippet);
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
			declarations.forEach(declaration => {
				block.chunks.init.push(declaration);
			});
		}

		return (this.manipulated = node as Node);
	}
}

function get_function_name(_node, parent) {
	if (parent.type === 'EventHandler') {
		return `${parent.name}_handler`;
	}

	if (parent.type === 'Action') {
		return `${parent.name}_function`;
	}

	return 'func';
}
