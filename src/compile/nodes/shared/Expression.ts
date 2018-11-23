import Component from '../../Component';
import { walk } from 'estree-walker';
import isReference from 'is-reference';
import flattenReference from '../../../utils/flattenReference';
import { createScopes } from '../../../utils/annotateWithScopes';
import { Node } from '../../../interfaces';
import addToSet from '../../../utils/addToSet';
import globalWhitelist from '../../../utils/globalWhitelist';
import deindent from '../../../utils/deindent';
import Wrapper from '../../render-dom/wrappers/shared/Wrapper';

const binaryOperators: Record<string, number> = {
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

const logicalOperators: Record<string, number> = {
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
	BinaryExpression: (node: Node) => binaryOperators[node.operator],
	LogicalExpression: (node: Node) => logicalOperators[node.operator],
	ConditionalExpression: () => 4,
	AssignmentExpression: () => 3,
	YieldExpression: () => 2,
	SpreadElement: () => 1,
	SequenceExpression: () => 0
};

export default class Expression {
	component: Component;
	node: any;
	snippet: string;
	references: Set<string>;
	dependencies: Set<string>;
	contextual_dependencies: Set<string>;

	declarations: string[] = [];
	usesContext = false;
	usesEvent = false;

	constructor(component: Component, owner: Wrapper, scope, info, isEventHandler?: boolean) {
		// TODO revert to direct property access in prod?
		Object.defineProperties(this, {
			component: {
				value: component
			}
		});

		this.node = info;

		this.snippet = `[✂${info.start}-${info.end}✂]`;

		const expression_dependencies = new Set();
		const expression_contextual_dependencies = new Set();

		let dependencies = expression_dependencies;
		let contextual_dependencies = expression_contextual_dependencies;

		const { declarations } = this;
		const { code } = component;

		let { map, scope: currentScope } = createScopes(info);

		const expression = this;
		const isSynthetic = owner.isSynthetic;

		let function_expression;

		walk(info, {
			enter(node: any, parent: any, key: string) {
				// don't manipulate shorthand props twice
				if (key === 'value' && parent.shorthand) return;

				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);

				if (map.has(node)) {
					currentScope = map.get(node);
				}

				if (isReference(node, parent)) {
					const { name, nodes } = flattenReference(node);

					if (currentScope.has(name)) return;
					if (globalWhitelist.has(name) && component.declarations.indexOf(name) === -1) return;

					if (!isSynthetic && !function_expression) {
						// <option> value attribute could be synthetic — avoid double editing
						code.prependRight(node.start, key === 'key' && parent.shorthand
							? `${name}: ctx.`
							: 'ctx.');
					}

					if (scope.names.has(name)) {
						expression.usesContext = true;

						contextual_dependencies.add(name);

						scope.dependenciesForName.get(name).forEach(dependency => {
							dependencies.add(dependency);
						});
					} else {
						dependencies.add(name);
						component.expectedProperties.add(name);
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
						// TODO handle destructuring assignments
						const { name } = flattenReference(node.left);

						code.prependRight(node.start, `($$make_dirty('${name}'), `);
						code.appendLeft(node.end, ')');
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

					if (node.type === 'CallExpression') {
						if (node.callee.type === 'Identifier') {
							const dependencies_for_invocation = component.findDependenciesForFunctionCall(node.callee.name);
							if (dependencies_for_invocation) {
								addToSet(dependencies, dependencies_for_invocation);
							} else {
								dependencies.add('$$BAIL$$');
							}
						} else {
							dependencies.add('$$BAIL$$');
						}
					}
				}
			},

			leave(node: Node) {
				if (map.has(node)) currentScope = currentScope.parent;

				if (node === function_expression) {
					const name = component.getUniqueName(get_function_name(node, owner));

					const args = contextual_dependencies.size > 0
						? [`{ ${[...contextual_dependencies].join(', ')} }`]
						: [];

					let original_params;

					if (node.params.length > 0) {
						original_params = code.slice(node.params[0].start, node.params[node.params.length - 1].end);
						args.push(original_params);
					}

					let body = code.slice(node.body.start, node.body.end).trim();
					if (node.body.type !== 'BlockStatement') {
						body = `{\n\treturn ${body};\n}`;
					}

					const fn = deindent`
						function ${name}(${args.join(', ')}) ${body}
					`;

					if (dependencies.size === 0 && contextual_dependencies.size === 0) {
						// we can hoist this out of the component completely
						component.fully_hoisted.push(fn);
						code.overwrite(node.start, node.end, name);
					}

					else if (contextual_dependencies.size === 0) {
						// function can be hoisted inside the component init
						component.partly_hoisted.push(fn);
						component.declarations.push(name);
						code.overwrite(node.start, node.end, `ctx.${name}`);
					}

					else {
						// we need a combo block/init recipe
						component.partly_hoisted.push(fn);
						component.declarations.push(name);
						code.overwrite(node.start, node.end, name);

						declarations.push(deindent`
							function ${name}(${original_params ? '...args' : ''}) {
								return ctx.${name}(ctx${original_params ? ', ...args' : ''});
							}
						`);
					}

					function_expression = null;
					dependencies = expression_dependencies;
					contextual_dependencies = expression_contextual_dependencies;
				}
			}
		});

		this.dependencies = dependencies;
		this.contextual_dependencies = contextual_dependencies;
	}

	getPrecedence() {
		return this.node.type in precedence ? precedence[this.node.type](this.node) : 0;
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