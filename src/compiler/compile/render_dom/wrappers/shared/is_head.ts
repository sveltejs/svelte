export function is_head(node) {
	return node && node.type === 'MemberExpression' && node.object.name === '@_document' && node.property.name === 'head';
}
