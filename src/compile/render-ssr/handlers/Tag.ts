export default function(node, target, options) {
	target.append(
		node.parent &&
		node.parent.type === 'Element' &&
		node.parent.name === 'style'
			? '${' + node.expression.snippet + '}'
			: '${@escape(' + node.expression.snippet + ')}'
	);
}