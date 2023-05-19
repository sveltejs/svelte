/**
 * @param {import('estree').Node} node
 */
export default function get_object(node) {
	while (node.type === 'MemberExpression') node = node.object;
	return /** @type {import('estree').Identifier} */ (node);
}
