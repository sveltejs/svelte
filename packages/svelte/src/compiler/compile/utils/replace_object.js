/**
 * @param {import('estree').Node} node
 * @param {import('estree').Node} replacement
 */
export default function replace_object(node, replacement) {
	if (node.type === 'Identifier') return replacement;

	const ancestor = node;
	let parent;
	while (node.type === 'MemberExpression') {
		parent = node;
		node = node.object;
	}
	parent.object = /** @type {any} */ (replacement);
	return ancestor;
}
