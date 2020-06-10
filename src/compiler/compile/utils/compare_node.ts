import { Node, Literal, Identifier, MemberExpression } from "estree";

export function compare_node(a: Node | void, b: Node | void) {
	if (a === b) return true;
	if (!a || !b) return false;
	if (a.type !== b.type) return false;
	switch (a.type) {
		case "Identifier":
			return a.name === (b as Identifier).name;
		case "MemberExpression":
			return (
				compare_node(a.object, (b as MemberExpression).object) &&
				compare_node(a.property, (b as MemberExpression).property) &&
				a.computed === (b as MemberExpression).computed
      );
    case 'Literal':
      return a.value === (b as Literal).value;
	}
}
