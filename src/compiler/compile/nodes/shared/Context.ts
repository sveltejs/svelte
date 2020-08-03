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
				const n = contexts.length;

				unpack_destructuring(contexts, element.left, node => {
					const alternate = JSON.parse(JSON.stringify(element.right));

					update_reference(contexts.slice(0, n), node, alternate);

					return x`${modifier(node)}[${i}] !== undefined ? ${modifier(node)}[${i}] : ${alternate.replacement || alternate}` as Node;
				});
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

					unpack_destructuring(contexts, value.left, node => {
						const alternate = JSON.parse(JSON.stringify(value.right));

						update_reference(contexts.slice(0, n), node, alternate);

						return x`${modifier(node)}.${key.name} !== undefined ? ${modifier(node)}.${key.name} : ${alternate.replacement || alternate}` as Node;
					});
				} else {
					unpack_destructuring(contexts, value, node => x`${modifier(node)}.${key.name}` as Node);
				}
			}
		});
	}
}

function update_reference(contexts: Context[], node: Node, parent: any, property?: any) {
	const current_node = (property !== undefined && parent[property] || parent);

	if (!current_node || !contexts.length) return;

	if (current_node.type === 'Identifier') {
		contexts.forEach((context) => {
			const { key, modifier } = context;

			if (current_node.name === key.name) {
				const replacement = modifier(node);
				
				if (property === undefined) {
					current_node.replacement = replacement;
				} else {
					parent[property] = replacement;
				}
			}
		});
	} else if (current_node.type === 'BinaryExpression') {
		update_reference(contexts, node, current_node, 'left');
		update_reference(contexts, node, current_node, 'right');
	} else if (current_node.type === 'CallExpression') {
		for (let i = 0; i < current_node.arguments.length; i += 1) {
			update_reference(contexts, node, current_node.arguments, i);
		}

		update_reference(contexts, node, current_node, 'callee');
	} else if (current_node.type === 'MemberExpression') {
		update_reference(contexts, node, current_node, 'object');
		update_reference(contexts, node, current_node, 'property');
	}
}
