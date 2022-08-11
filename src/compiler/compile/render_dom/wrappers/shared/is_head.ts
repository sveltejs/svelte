import { Identifier, Node } from 'estree';

type NarrowNodeType<Y> = Y extends { name: string } ? Y : never;

export function is_head(node: Identifier | Node) {
	return node && node.type === 'MemberExpression' &&
		(node.object as NarrowNodeType<Node>).name === '@_document' &&
		(node.property as NarrowNodeType<Node>).name === 'head';
}
