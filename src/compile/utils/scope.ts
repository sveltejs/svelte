import { walk } from 'estree-walker';
import is_reference from 'is-reference';
import { Node } from '../../interfaces';
import { Node as ESTreeNode } from 'estree';

export function create_scopes(expression: Node) {
	const map = new WeakMap();

	const globals: Map<string, Node> = new Map();
	let scope = new Scope(null, false);

	walk(expression, {
		enter(node, parent) {
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

				node.params.forEach((param) => {
					extract_names(param).forEach(name => {
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
				scope.add_declaration(node);
			} else if (node.type === 'Identifier' && is_reference(node as ESTreeNode, parent as ESTreeNode)) {
				if (!scope.has(node.name) && !globals.has(node.name)) {
					globals.set(node.name, node);
				}
			}
		},

		leave(node: Node) {
			if (map.has(node)) {
				scope = scope.parent;
			}
		},
	});

	scope.declarations.forEach((node, name) => {
		globals.delete(name);
	});

	return { map, scope, globals };
}

export class Scope {
	parent: Scope;
	block: boolean;

	declarations: Map<string, Node> = new Map();
	initialised_declarations: Set<string> = new Set();

	constructor(parent: Scope, block: boolean) {
		this.parent = parent;
		this.block = block;
	}

	add_declaration(node: Node) {
		if (node.kind === 'var' && this.block && this.parent) {
			this.parent.add_declaration(node);
		} else if (node.type === 'VariableDeclaration') {
			node.declarations.forEach((declarator: Node) => {
				extract_names(declarator.id).forEach(name => {
					this.declarations.set(name, node);
					if (declarator.init) this.initialised_declarations.add(name);
				});
			});
		} else {
			this.declarations.set(node.id.name, node);
		}
	}

	find_owner(name: string): Scope {
		if (this.declarations.has(name)) return this;
		return this.parent && this.parent.find_owner(name);
	}

	has(name: string): boolean {
		return (
			this.declarations.has(name) || (this.parent && this.parent.has(name))
		);
	}
}

export function extract_names(param: Node) {
	return extract_identifiers(param).map(node => node.name);
}

export function extract_identifiers(param: Node) {
	const nodes: Node[] = [];
	extractors[param.type] && extractors[param.type](nodes, param);
	return nodes;
}

const extractors = {
	Identifier(nodes: Node[], param: Node) {
		nodes.push(param);
	},

	ObjectPattern(nodes: Node[], param: Node) {
		param.properties.forEach((prop: Node) => {
			if (prop.type === 'RestElement') {
				nodes.push(prop.argument);
			} else {
				extractors[prop.value.type](nodes, prop.value);
			}
		});
	},

	ArrayPattern(nodes: Node[], param: Node) {
		param.elements.forEach((element: Node) => {
			if (element) extractors[element.type](nodes, element);
		});
	},

	RestElement(nodes: Node[], param: Node) {
		extractors[param.argument.type](nodes, param.argument);
	},

	AssignmentPattern(nodes: Node[], param: Node) {
		extractors[param.left.type](nodes, param.left);
	}
};
