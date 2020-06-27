import { x } from 'code-red';
import { Node, Identifier } from 'estree';

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
				unpack_destructuring(contexts, element.left, node => x`${modifier(node)}[${i}] !== undefined ? ${modifier(node)}[${i}] : ${element.right}` as Node);
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

				used_properties.push(x`"${(key as Identifier).name}"`);
				if (value.type === 'AssignmentPattern') {
					unpack_destructuring(contexts, value.left, node => x`${modifier(node)}.${key.name} !== undefined ? ${modifier(node)}.${key.name} : ${value.right}` as Node);
				} else {
					unpack_destructuring(contexts, value, node => x`${modifier(node)}.${key.name}` as Node);
				}
			}
		});
	}
}
