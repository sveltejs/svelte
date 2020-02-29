import Component from '../../Component';
import { walk } from 'estree-walker';
import is_reference from 'is-reference';
import flatten_reference from '../../utils/flatten_reference';
import { create_scopes, Scope, extract_names } from '../../utils/scope';
import { sanitize } from '../../../utils/names';
import Wrapper from '../../render_dom/wrappers/shared/Wrapper';
import TemplateScope from './TemplateScope';
import get_object from '../../utils/get_object';
import Block from '../../render_dom/Block';
import is_dynamic from '../../render_dom/wrappers/shared/is_dynamic';
import { b } from 'code-red';
import { invalidate } from '../../render_dom/invalidate';
import { Node, FunctionExpression, Identifier } from 'estree';
import { TemplateNode } from '../../../interfaces';

type Owner = Wrapper | TemplateNode;

export default class Expression {
	type: 'Expression' = 'Expression';
	component: Component;
	owner: Owner;
	node: any;
	references: Set<string>;
	dependencies: Set<string> = new Set();
	contextual_dependencies: Set<string> = new Set();

	template_scope: TemplateScope;
	scope: Scope;
	scope_map: WeakMap<Node, Scope>;

	declarations: Array<(Node | Node[])> = [];
	uses_context = false;

	manipulated: Node;

	// todo: owner type
	constructor(component: Component, owner: Owner, template_scope: TemplateScope, info, lazy?: boolean) {
		// TODO revert to direct property access in prod?
		Object.defineProperties(this, {
			component: {
				value: component
			}
		});

		this.node = info;
		this.template_scope = template_scope;
		this.owner = owner;

		const { dependencies, contextual_dependencies } = this;

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

				if (map.has(node)) {
					scope = map.get(node);
				}

				if (!function_expression && /FunctionExpression/.test(node.type)) {
					function_expression = node;
				}

				if (is_reference(node, parent)) {
					const { name, nodes } = flatten_reference(node);

					if (scope.has(name)) return;

					if (name[0] === '$' && template_scope.names.has(name.slice(1))) {
						component.error(node, {
							code: `contextual-store`,
							message: `Stores must be declared at the top level of the component (this may change in a future version of Svelte)`
						});
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
						names = deep
							? [get_object(node.left).name]
							: extract_names(node.left);
					} else if (node.type === 'UpdateExpression') {
						const { name } = get_object(node.argument);
						names = [name];
					}
				}

				if (names) {
					names.forEach(name => {
						if (template_scope.names.has(name)) {
							template_scope.dependencies_for_name.get(name).forEach(name => {
								const variable = component.var_lookup.get(name);
								if (variable) variable[deep ? 'mutated' : 'reassigned'] = true;
							});
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
			if (name === '$$props') return true;

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

				if (is_reference(node, parent)) {
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
					}

					else if (contextual_dependencies.size === 0) {
						// function can be hoisted inside the component init
						component.partly_hoisted.push(declaration);

						block.renderer.add_to_context(id.name);
						this.replace(block.renderer.reference(id));
					}

					else {
						// we need a combo block/init recipe
						const deps = Array.from(contextual_dependencies);

						(node as FunctionExpression).params = [
							...deps.map(name => ({ type: 'Identifier', name } as Identifier)),
							...(node as FunctionExpression).params
						];

						const context_args = deps.map(name => block.renderer.reference(name));

						component.partly_hoisted.push(declaration);

						block.renderer.add_to_context(id.name);
						const callee = block.renderer.reference(id);

						this.replace(id as any);

						if ((node as FunctionExpression).params.length > 0) {
							declarations.push(b`
								function ${id}(...args) {
									return ${callee}(${context_args}, ...args);
								}
							`);
						} else {
							declarations.push(b`
								function ${id}() {
									return ${callee}(${context_args});
								}
							`);
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

function is_contextual(component: Component, scope: TemplateScope, name: string) {
	if (name === '$$props') return true;

	// if it's a name below root scope, it's contextual
	if (!scope.is_top_level(name)) return true;

	const variable = component.var_lookup.get(name);

	// hoistables, module declarations, and imports are non-contextual
	if (!variable || variable.hoistable) return false;

	// assume contextual
	return true;
}
