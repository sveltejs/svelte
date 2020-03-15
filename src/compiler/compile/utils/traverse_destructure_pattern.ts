import { Pattern, Identifier, RestElement } from "estree";
import { Node } from "acorn";

export default function traverse_destructure_pattern(
	node: Pattern,
	callback: (node: Identifier, parent: Node, key: string | number) => void
) {
	function traverse(node: Pattern, parent, key) {
		switch (node.type) {
			case "Identifier":
				return callback(node, parent, key);
			case "ArrayPattern":
				for (let i = 0; i < node.elements.length; i++) {
					const element = node.elements[i];
					traverse(element, node.elements, i);
				}
				break;
			case "ObjectPattern":
				for (let i = 0; i < node.properties.length; i++) {
					const property = node.properties[i];
					if (property.type === "Property") {
						traverse(property.value, property, "value");
					} else {
						traverse((property as any) as RestElement, node.properties, i);
					}
				}
				break;
			case "RestElement":
				return traverse(node.argument, node, 'argument');
			case "AssignmentPattern":
        return traverse(node.left, node, 'left');
		}
  }
  traverse(node, null, null);
}
