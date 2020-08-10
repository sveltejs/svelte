import { x } from 'code-red';
import { Node, Identifier } from 'estree';
import { walk } from 'estree-walker';
import is_reference from 'is-reference';

export interface Context {
	key: Identifier;
	name?: string;
	modifier: (node: Node) => Node;
}

export function unpack_destructuring(contexts: Context[], node: Node, modifier: (node: Node) => Node) {
	if (!node) return;

	if (node.type === 'Identifier') {
		contexts.push({
			key: node as Identifier,
			modifier
		});
	} else if (node.type === 'RestElement') {
		contexts.push({
			key: node.argument as Identifier,
			modifier
		});
	} else if (node.type === 'ArrayPattern') {
		node.elements.forEach((element, i) => {
			if (element && element.type === 'RestElement') {
				unpack_destructuring(contexts, element, node => x`${modifier(node)}.slice(${i})` as Node);
			} else if (element && element.type === 'AssignmentPattern') {
				const n = contexts.length;

				unpack_destructuring(contexts, element.left, node =>  x`${modifier(node)}[${i}] !== undefined ? ${modifier(node)}[${i}] : ${update_reference(contexts, n, element.right, node)}` as Node);
			} else {
				unpack_destructuring(contexts, element, node => x`${modifier(node)}[${i}]` as Node);
			}
		});
	} else if (node.type === 'ObjectPattern') {
		const used_properties = [];

		node.properties.forEach((property) => {
			if (property.type === 'RestElement') {
				unpack_destructuring(
					contexts,
					property.argument,
					node => x`@object_without_properties(${modifier(node)}, [${used_properties}])` as Node
				);
			} else {
				const key = property.key as Identifier;
				const value = property.value;

				used_properties.push(x`"${key.name}"`);
				if (value.type === 'AssignmentPattern') {
					const n = contexts.length;

					unpack_destructuring(contexts, value.left, node => x`${modifier(node)}.${key.name} !== undefined ? ${modifier(node)}.${key.name} : ${update_reference(contexts, n, value.right, node)}` as Node);
				} else {
					unpack_destructuring(contexts, value, node => x`${modifier(node)}.${key.name}` as Node);
				}
			}
		});
	}
}

function update_reference(contexts: Context[], n: number, info, replacement: Node): Node {
	if (!n) return info;

	let copy = JSON.parse(JSON.stringify(info)) as Node;
	const replace = (node: Identifier, callback: (node: Node, context: any) => void, context?: any) => {
		for (let i = 0; i < n; i++) {
			const { key, modifier } = contexts[i];

			if (node.name === key.name) {
				callback(modifier(replacement), context);
				break;
			}
		}
	};

	if (copy.type === 'Identifier') {
		replace(copy, (node: Node, _context: any) => copy = node);
	} else {
		walk(copy, {
			enter(node, parent: Node) {
				if (!['Identifier', 'BinaryExpression', 'CallExpression', 'MemberExpression'].includes(node.type)) {
					return this.skip();
				}

				if (is_reference(node, parent)) {
					replace(node as Identifier, (node: Node, context: any) => context && context.replace(node), this);
				}
			}
		});
	}

	return copy;
}
