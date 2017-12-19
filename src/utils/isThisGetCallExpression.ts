import { Node } from '../interfaces';

export default function isThisGetCallExpression(node: Node): boolean {
		return node.type === 'CallExpression' &&
				node.callee.type === 'MemberExpression' &&
				node.callee.object.type === 'ThisExpression' &&
				node.callee.property.name === 'get';
}
