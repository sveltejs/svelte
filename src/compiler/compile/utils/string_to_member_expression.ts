import { MemberExpression, Identifier } from 'estree';

export function string_to_member_expression(name: string) {
	const parts = name.split('.');
	let node: MemberExpression | Identifier = {
		type: 'Identifier',
		name: parts[0]
	};
	for (let i = 1; i < parts.length; i++) {
		node = {
			type: 'MemberExpression',
			object: node,
			property: { type: 'Identifier', name: parts[i] }
		} as MemberExpression;
	}
	return node;
}
