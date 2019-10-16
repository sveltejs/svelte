import { walk } from 'estree-walker';
import is_reference from 'is-reference';
import { Node, VariableDeclaration, ClassDeclaration, VariableDeclarator, ObjectPattern, Property, RestElement, ArrayPattern, Identifier } from 'estree';
import get_object from './get_object';

// TODO replace this with periscopic?
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
			} else if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
				if (node.type === 'FunctionDeclaration') {
					scope.declarations.set(node.id.name, node);
					scope = new Scope(scope, false);
					map.set(node, scope);
				} else {
					scope = new Scope(scope, false);
					map.set(node, scope);
					if (node.type === 'FunctionExpression' && node.id) {
						scope.declarations.set(node.id.name, node);
					}
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
			} else if (node.type === 'ClassDeclaration' || node.type === 'VariableDeclaration') {
				scope.add_declaration(node);
			} else if (node.type === 'CatchClause') {
				scope = new Scope(scope, true);
				map.set(node, scope);

				extract_names(node.param).forEach(name => {
					scope.declarations.set(name, node.param);
				});
			} else if (node.type === 'Identifier' && is_reference(node as Node, parent as Node)) {
				if (!scope.has(node.name) && !globals.has(node.name)) {
					globals.set(node.name, node);
				}
			}
		},

		leave(node: Node) {
			if (map.has(node)) {
				scope = scope.parent;
			}
		}
	});

	scope.declarations.forEach((_node, name) => {
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

	add_declaration(node: VariableDeclaration | ClassDeclaration) {
		if (node.type === 'VariableDeclaration') {
			if (node.kind === 'var' && this.block && this.parent) {
				this.parent.add_declaration(node);
			} else {
				node.declarations.forEach((declarator: VariableDeclarator) => {
					extract_names(declarator.id).forEach(name => {
						this.declarations.set(name, node);
						if (declarator.init) this.initialised_declarations.add(name);
					});
				});
			}
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

export function extract_names(param: Node): string[] {
	return extract_identifiers(param).map((node: any) => node.name);
}

export function extract_identifiers(param: Node): Identifier[] {
	const nodes: Identifier[] = [];
	extractors[param.type] && extractors[param.type](nodes, param);
	return nodes;
}

const extractors = {
	Identifier(nodes: Node[], param: Node) {
		nodes.push(param);
	},

	MemberExpression(nodes: Node[], param: Node) {
		nodes.push(get_object(param));
	},

	ObjectPattern(nodes: Node[], param: ObjectPattern) {
		param.properties.forEach((prop: Property | RestElement) => {
			if (prop.type === 'RestElement') {
				nodes.push(prop.argument);
			} else {
				extractors[prop.value.type](nodes, prop.value);
			}
		});
	},

	ArrayPattern(nodes: Node[], param: ArrayPattern) {
		param.elements.forEach((element: Node) => {
			if (element) extractors[element.type](nodes, element);
		});
	},

	RestElement(nodes: Node[], param: any) {
		extractors[param.argument.type](nodes, param.argument);
	},

	AssignmentPattern(nodes: Node[], param: any) {
		extractors[param.left.type](nodes, param.left);
	}
};
