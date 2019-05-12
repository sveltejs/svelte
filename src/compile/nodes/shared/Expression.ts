import Component from '../../Component';
import { walk } from 'estree-walker';
import is_reference from 'is-reference';
import flatten_reference from '../../utils/flatten_reference';
import { create_scopes, Scope, extract_names } from '../../utils/scope';
import { Node } from '../../../interfaces';
import { globals } from '../../../utils/names';
import deindent from '../../utils/deindent';
import Wrapper from '../../render-dom/wrappers/shared/Wrapper';
import { sanitize } from '../../../utils/names';
import TemplateScope from './TemplateScope';
import get_object from '../../utils/get_object';
import { nodes_match } from '../../../utils/nodes_match';
import Block from '../../render-dom/Block';

const binary_operators: Record<string, number> = {
	'**': 15,
	'*': 14,
	'/': 14,
	'%': 14,
	'+': 13,
	'-': 13,
	'<<': 12,
	'>>': 12,
	'>>>': 12,
	'<': 11,
	'<=': 11,
	'>': 11,
	'>=': 11,
	'in': 11,
	'instanceof': 11,
	'==': 10,
	'!=': 10,
	'===': 10,
	'!==': 10,
	'&': 9,
	'^': 8,
	'|': 7
};

const logical_operators: Record<string, number> = {
	'&&': 6,
	'||': 5
};

const precedence: Record<string, (node?: Node) => number> = {
	Literal: () => 21,
	Identifier: () => 21,
	ParenthesizedExpression: () => 20,
	MemberExpression: () => 19,
	NewExpression: () => 19, // can be 18 (if no args) but makes no practical difference
	CallExpression: () => 19,
	UpdateExpression: () => 17,
	UnaryExpression: () => 16,
	BinaryExpression: (node: Node) => binary_operators[node.operator],
	LogicalExpression: (node: Node) => logical_operators[node.operator],
	ConditionalExpression: () => 4,
	AssignmentExpression: () => 3,
	YieldExpression: () => 2,
	SpreadElement: () => 1,
	SequenceExpression: () => 0
};

export default class Expression {
	type = 'Expression';
	component: Component;
	owner: Wrapper;
	node: any;
	snippet: string;
	references: Set<string>;
	dependencies: Set<string> = new Set();
	contextual_dependencies: Set<string> = new Set();

	template_scope: TemplateScope;
	scope: Scope;
	scope_map: WeakMap<Node, Scope>;

	is_synthetic: boolean;
	declarations: string[] = [];
	uses_context = false;

	rendered: string;

	constructor(component: Component, owner: Wrapper, template_scope: TemplateScope, info) {
		// TODO revert to direct property access in prod?
		Object.defineProperties(this, {
			component: {
				value: component
			}
		});

		this.node = info;
		this.template_scope = template_scope;
		this.owner = owner;
		this.is_synthetic = owner.is_synthetic;

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

					if (globals.has(name) && !component.var_lookup.has(name)) return;

					if (name[0] === '$' && template_scope.names.has(name.slice(1))) {
						component.error(node, {
							code: `contextual-store`,
							message: `Stores must be declared at the top level of the component (this may change in a future version of Svelte)`
						});
					}

					if (template_scope.is_let(name)) {
						if (!function_expression) {
							dependencies.add(name);
						}
					} else if (template_scope.names.has(name)) {
						expression.uses_context = true;

						contextual_dependencies.add(name);

						if (!function_expression) {
							template_scope.dependencies_for_name.get(name).forEach(name => dependencies.add(name));
						}
					} else {
						if (!function_expression) {
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
		return Array.from(this.dependencies).filter(name => {
			if (this.template_scope.is_let(name)) return true;
			if (name === '$$props') return true;

			const variable = this.component.var_lookup.get(name);
			if (!variable) return false;

			if (variable.mutated || variable.reassigned) return true; // dynamic internal state
			if (!variable.module && variable.writable && variable.export_name) return true; // writable props
		});
	}

	get_precedence() {
		return this.node.type in precedence ? precedence[this.node.type](this.node) : 0;
	}

	// TODO move this into a render-dom wrapper?
	render(block: Block) {
		if (this.rendered) return this.rendered;

		const {
			component,
			declarations,
			scope_map: map,
			template_scope,
			owner,
			is_synthetic
		} = this;
		let scope = this.scope;

		const { code } = component;

		let function_expression;
		let pending_assignments = new Set();

		let dependencies: Set<string>;
		let contextual_dependencies: Set<string>;

		// rewrite code as appropriate
		walk(this.node, {
			enter(node: any, parent: any, key: string) {
				// don't manipulate shorthand props twice
				if (key === 'value' && parent.shorthand) return;

				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);

				if (map.has(node)) {
					scope = map.get(node);
				}

				if (is_reference(node, parent)) {
					const { name, nodes } = flatten_reference(node);

					if (scope.has(name)) return;
					if (globals.has(name) && !component.var_lookup.has(name)) return;

					if (function_expression) {
						if (template_scope.names.has(name)) {
							contextual_dependencies.add(name);

							template_scope.dependencies_for_name.get(name).forEach(dependency => {
								dependencies.add(dependency);
							});
						} else {
							dependencies.add(name);
							component.add_reference(name);
						}
					} else if (!is_synthetic && is_contextual(component, template_scope, name)) {
						code.prependRight(node.start, key === 'key' && parent.shorthand
							? `${name}: ctx.`
							: 'ctx.');
					}

					if (node.type === 'MemberExpression') {
						nodes.forEach(node => {
							code.addSourcemapLocation(node.start);
							code.addSourcemapLocation(node.end);
						});
					}

					this.skip();
				}

				if (function_expression) {
					if (node.type === 'AssignmentExpression') {
						const names = node.left.type === 'MemberExpression'
							? [get_object(node.left).name]
							: extract_names(node.left);

						if (node.operator === '=' && nodes_match(node.left, node.right)) {
							const dirty = names.filter(name => {
								return !scope.declarations.has(name);
							});

							if (dirty.length) component.has_reactive_assignments = true;

							code.overwrite(node.start, node.end, dirty.map(n => component.invalidate(n)).join('; '));
						} else {
							names.forEach(name => {
								if (scope.declarations.has(name)) return;

								const variable = component.var_lookup.get(name);
								if (variable && variable.hoistable) return;

								pending_assignments.add(name);
							});
						}
					} else if (node.type === 'UpdateExpression') {
						const { name } = get_object(node.argument);

						if (scope.declarations.has(name)) return;

						const variable = component.var_lookup.get(name);
						if (variable && variable.hoistable) return;

						pending_assignments.add(name);
					}
				} else {
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
					if (pending_assignments.size > 0) {
						if (node.type !== 'ArrowFunctionExpression') {
							// this should never happen!
							throw new Error(`Well that's odd`);
						}

						// TOOD optimisation — if this is an event handler,
						// the return value doesn't matter
					}

					const name = component.get_unique_name(
						sanitize(get_function_name(node, owner))
					);

					const args = contextual_dependencies.size > 0
						? [`{ ${Array.from(contextual_dependencies).join(', ')} }`]
						: [];

					let original_params;

					if (node.params.length > 0) {
						original_params = code.slice(node.params[0].start, node.params[node.params.length - 1].end);
						args.push(original_params);
					}

					let body = code.slice(node.body.start, node.body.end).trim();
					if (node.body.type !== 'BlockStatement') {
						if (pending_assignments.size > 0) {
							const dependencies = new Set();
							pending_assignments.forEach(name => {
								if (template_scope.names.has(name)) {
									template_scope.dependencies_for_name.get(name).forEach(dependency => {
										dependencies.add(dependency);
									});
								} else {
									dependencies.add(name);
								}
							});

							const insert = Array.from(dependencies).map(name => component.invalidate(name)).join('; ');
							pending_assignments = new Set();

							component.has_reactive_assignments = true;

							body = deindent`
								{
									const $$result = ${body};
									${insert};
									return $$result;
								}
							`;
						} else {
							body = `{\n\treturn ${body};\n}`;
						}
					}

					const fn = deindent`
						function ${name}(${args.join(', ')}) ${body}
					`;

					if (dependencies.size === 0 && contextual_dependencies.size === 0) {
						// we can hoist this out of the component completely
						component.fully_hoisted.push(fn);
						code.overwrite(node.start, node.end, name);

						component.add_var({
							name,
							internal: true,
							hoistable: true,
							referenced: true
						});
					}

					else if (contextual_dependencies.size === 0) {
						// function can be hoisted inside the component init
						component.partly_hoisted.push(fn);
						code.overwrite(node.start, node.end, `ctx.${name}`);

						component.add_var({
							name,
							internal: true,
							referenced: true
						});
					}

					else {
						// we need a combo block/init recipe
						component.partly_hoisted.push(fn);
						code.overwrite(node.start, node.end, name);

						component.add_var({
							name,
							internal: true,
							referenced: true
						});

						declarations.push(deindent`
							function ${name}(${original_params ? '...args' : ''}) {
								return ctx.${name}(ctx${original_params ? ', ...args' : ''});
							}
						`);
					}

					function_expression = null;
					dependencies = null;
					contextual_dependencies = null;
				}

				if (/Statement/.test(node.type)) {
					if (pending_assignments.size > 0) {
						const has_semi = code.original[node.end - 1] === ';';

						const insert = (
							(has_semi ? ' ' : '; ') +
							Array.from(pending_assignments).map(name => component.invalidate(name)).join('; ')
						);

						if (/^(Break|Continue|Return)Statement/.test(node.type)) {
							if (node.argument) {
								code.overwrite(node.start, node.argument.start, `var $$result = `);
								code.appendLeft(node.argument.end, `${insert}; return $$result`);
							} else {
								code.prependRight(node.start, `${insert}; `);
							}
						} else if (parent && /(If|For(In|Of)?|While)Statement/.test(parent.type) && node.type !== 'BlockStatement') {
							code.prependRight(node.start, '{ ');
							code.appendLeft(node.end, `${insert}; }`);
						} else {
							code.appendLeft(node.end, `${insert};`);
						}

						component.has_reactive_assignments = true;
						pending_assignments = new Set();
					}
				}
			}
		});

		if (declarations.length > 0) {
			block.maintain_context = true;
			declarations.forEach(declaration => {
				block.builders.init.add_block(declaration);
			});
		}

		return this.rendered = `[✂${this.node.start}-${this.node.end}✂]`;
	}
}

function get_function_name(node, parent) {
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