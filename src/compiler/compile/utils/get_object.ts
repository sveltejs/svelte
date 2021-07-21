import {
	Node,
	Identifier,
	ArrayExpression,
	ObjectExpression,
	ThisExpression,
	ObjectPattern,
	ArrayPattern,
	Literal,
} from "estree";

type ObjectType =
	| Identifier
	| ThisExpression
	| ArrayExpression
	| ObjectExpression
	| ArrayPattern
	| ObjectPattern
	| Literal;

export default function get_object(node: Node): ObjectType {
	while (true) {
		if (node.type === "MemberExpression") node = node.object;
		else if (node.type === "CallExpression") node = node.callee;
		else break;
	}
	return node as ObjectType;
}
