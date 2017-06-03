import { walk } from 'estree-walker';
import { Node } from '../interfaces';

export default function annotateWithScopes(expression: Node) {
	let scope = new Scope(null, false);

	walk(expression, {
		enter(node: Node) {
			if (/Function/.test(node.type)) {
				if (node.type === 'FunctionDeclaration') {
					scope.declarations.add(node.id.name);
				} else {
					node._scope = scope = new Scope(scope, false);
					if (node.id) scope.declarations.add(node.id.name);
				}

				node.params.forEach((param: Node) => {
					extractNames(param).forEach(name => {
						scope.declarations.add(name);
					});
				});
			} else if (/For(?:In|Of)Statement/.test(node.type)) {
				node._scope = scope = new Scope(scope, true);
			} else if (node.type === 'BlockStatement') {
				node._scope = scope = new Scope(scope, true);
			} else if (/(Function|Class|Variable)Declaration/.test(node.type)) {
				scope.addDeclaration(node);
			}
		},

		leave(node: Node) {
			if (node._scope) {
				scope = scope.parent;
			}
		},
	});

	return scope;
}

class Scope {
	parent: Scope;
	block: boolean;
	declarations: Set<string>;

	constructor(parent: Scope, block: boolean) {
		this.parent = parent;
		this.block = block;
		this.declarations = new Set();
	}

	addDeclaration(node: Node) {
		if (node.kind === 'var' && !this.block && this.parent) {
			this.parent.addDeclaration(node);
		} else if (node.type === 'VariableDeclaration') {
			node.declarations.forEach((declarator: Node) => {
				extractNames(declarator.id).forEach(name => {
					this.declarations.add(name);
				});
			});
		} else {
			this.declarations.add(node.id.name);
		}
	}

	has(name: string): boolean {
		return (
			this.declarations.has(name) || (this.parent && this.parent.has(name))
		);
	}
}

function extractNames(param: Node) {
	const names: string[] = [];
	extractors[param.type](names, param);
	return names;
}

const extractors = {
	Identifier(names: string[], param: Node) {
		names.push(param.name);
	},

	ObjectPattern(names: string[], param: Node) {
		param.properties.forEach((prop: Node) => {
			extractors[prop.value.type](names, prop.value);
		});
	},

	ArrayPattern(names: string[], param: Node) {
		param.elements.forEach((element: Node) => {
			if (element) extractors[element.type](names, element);
		});
	},

	RestElement(names: string[], param: Node) {
		extractors[param.argument.type](names, param.argument);
	},

	AssignmentPattern(names: string[], param: Node) {
		extractors[param.left.type](names, param.left);
	},
};
