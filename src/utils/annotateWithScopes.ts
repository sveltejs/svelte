import { walk } from 'estree-walker';
import isReference from 'is-reference';
import { Node } from '../interfaces';

export function createScopes(expression: Node) {
	const map = new WeakMap();

	const globals = new Set();
	let scope = new Scope(null, false);

	walk(expression, {
		enter(node: Node, parent: Node) {
			if (node.type === 'ImportDeclaration') {
				node.specifiers.forEach(specifier => {
					scope.declarations.set(specifier.local.name, specifier);
				});
			} else if (/Function/.test(node.type)) {
				if (node.type === 'FunctionDeclaration') {
					scope.declarations.set(node.id.name, node);
					scope = new Scope(scope, false);
					map.set(node, scope);
				} else {
					scope = new Scope(scope, false);
					map.set(node, scope);
					if (node.id) scope.declarations.set(node.id.name, node);
				}

				node.params.forEach((param: Node) => {
					extractNames(param).forEach(name => {
						scope.declarations.set(name, node);
					});
				});
			} else if (/For(?:In|Of)?Statement/.test(node.type)) {
				scope = new Scope(scope, true);
				map.set(node, scope);
			} else if (node.type === 'BlockStatement') {
				scope = new Scope(scope, true);
				map.set(node, scope);
			} else if (/(Class|Variable)Declaration/.test(node.type)) {
				scope.addDeclaration(node);
			} else if (node.type === 'Identifier' && isReference(node, parent)) {
				if (!scope.has(node.name)) {
					globals.add(node.name);
				}
			}
		},

		leave(node: Node) {
			if (map.has(node)) {
				scope = scope.parent;
			}
		},
	});

	return { map, scope, globals };
}

export class Scope {
	parent: Scope;
	block: boolean;

	declarations: Map<string, Node> = new Map();
	writable_declarations: Set<string> = new Set();
	initialised_declarations: Set<string> = new Set();

	constructor(parent: Scope, block: boolean) {
		this.parent = parent;
		this.block = block;
	}

	addDeclaration(node: Node) {
		if (node.kind === 'var' && this.block && this.parent) {
			this.parent.addDeclaration(node);
		} else if (node.type === 'VariableDeclaration') {
			const writable = node.kind !== 'const';
			const initialised = !!node.init;

			node.declarations.forEach((declarator: Node) => {
				extractNames(declarator.id).forEach(name => {
					this.declarations.set(name, node);
					if (writable) this.writable_declarations.add(name);
					if (initialised) this.initialised_declarations.add(name);
				});
			});
		} else {
			this.declarations.set(node.id.name, node);
		}
	}

	findOwner(name: string): Scope {
		if (this.declarations.has(name)) return this;
		return this.parent && this.parent.findOwner(name);
	}

	has(name: string): boolean {
		return (
			this.declarations.has(name) || (this.parent && this.parent.has(name))
		);
	}
}

export function extractNames(param: Node) {
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
			if (prop.type === 'RestElement') {
				names.push(prop.argument.name);
			} else {
				extractors[prop.value.type](names, prop.value);
			}
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
