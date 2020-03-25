import { x } from 'code-red';
import { Node, Identifier, RestElement, Property } from 'estree';

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
			if (element && (element as any).type === 'RestElement') {
				unpack_destructuring(contexts, element, node => x`${modifier(node)}.slice(${i})` as Node);
			} else {
				unpack_destructuring(contexts, element, node => x`${modifier(node)}[${i}]` as Node);
			}
		});
	} else if (node.type === 'ObjectPattern') {
		const used_properties = [];

		node.properties.forEach((property) => {
			const props: (RestElement | Property) = (property as any);

			if (props.type === 'RestElement') {
				unpack_destructuring(
					contexts,
					props.argument,
					node => x`@object_without_properties(${modifier(node)}, [${used_properties}])` as Node
				);
			} else {
				used_properties.push(x`"${(property.key as Identifier).name}"`);

				unpack_destructuring(contexts, property.value, node => x`${modifier(node)}.${(property.key as Identifier).name}` as Node);
			}
		});
	}
}
