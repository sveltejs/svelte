import Generator from '../../Generator';
import { walk } from 'estree-walker';
import isReference from 'is-reference';
import flattenReference from '../../../utils/flattenReference';
import { createScopes } from '../../../utils/annotateWithScopes';
import { Node } from '../../../interfaces';

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
	compiler: Generator;
	node: any;
	snippet: string;

	usesContext: boolean;
	references: Set<string>;
	dependencies: Set<string>;

	thisReferences: Array<{ start: number, end: number }>;

	constructor(compiler, parent, scope, info) {
		// TODO revert to direct property access in prod?
		Object.defineProperties(this, {
			compiler: {
				value: compiler
			}
		});

		this.node = info;
		this.thisReferences = [];

		this.snippet = `[✂${info.start}-${info.end}✂]`;

		this.usesContext = false;

		const dependencies = new Set();

		const { code, helpers } = compiler;

		let { map, scope: currentScope } = createScopes(info);

		const isEventHandler = parent.type === 'EventHandler';
		const expression = this;
		const isSynthetic = parent.isSynthetic;

		walk(info, {
			enter(node: any, parent: any, key: string) {
				// don't manipulate shorthand props twice
				if (key === 'value' && parent.shorthand) return;

				code.addSourcemapLocation(node.start);
				code.addSourcemapLocation(node.end);

				if (map.has(node)) {
					currentScope = map.get(node);
					return;
				}

				if (node.type === 'ThisExpression') {
					expression.thisReferences.push(node);
				}

				if (isReference(node, parent)) {
					const { name } = flattenReference(node);

					if (currentScope.has(name) || (name === 'event' && isEventHandler)) return;

					if (compiler.helpers.has(name)) {
						let object = node;
						while (object.type === 'MemberExpression') object = object.object;

						const alias = compiler.templateVars.get(`helpers-${name}`);
						if (alias !== name) code.overwrite(object.start, object.end, alias);
						return;
					}

					expression.usesContext = true;

					if (!isSynthetic) {
						// <option> value attribute could be synthetic — avoid double editing
						code.prependRight(node.start, key === 'key' && parent.shorthand
							? `${name}: ctx.`
							: 'ctx.');
					}

					if (scope.names.has(name)) {
						scope.dependenciesForName.get(name).forEach(dependency => {
							dependencies.add(dependency);
						});
					} else {
						dependencies.add(name);
						compiler.expectedProperties.add(name);
					}

					if (node.type === 'MemberExpression') {
						walk(node, {
							enter(node) {
								code.addSourcemapLocation(node.start);
								code.addSourcemapLocation(node.end);
							}
						});
					}

					this.skip();
				}
			},

			leave(node: Node, parent: Node) {
				if (map.has(node)) currentScope = currentScope.parent;
			}
		});

		this.dependencies = dependencies;
	}

	getPrecedence() {
		return this.node.type in precedence ? precedence[this.node.type](this.node) : 0;
	}

	overwriteThis(name) {
		this.thisReferences.forEach(ref => {
			this.compiler.code.overwrite(ref.start, ref.end, name, {
				storeName: true
			});
		});
	}
}