import {
	Node,
	Identifier,
} from "estree";

export default function get_object(node: Node): Identifier {
	while (true) {
		if (node.type === "MemberExpression") node = node.object;
		else if (node.type === "CallExpression") node = node.callee;
		else break;
	}
	return node as Identifier;
}
