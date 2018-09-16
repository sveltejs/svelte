export default function(node, renderer, options) {
	renderer.append(
		node.parent &&
		node.parent.type === 'Element' &&
		node.parent.name === 'style'
			? '${' + node.expression.snippet + '}'
			: '${@escape(' + node.expression.snippet + ')}'
	);
}