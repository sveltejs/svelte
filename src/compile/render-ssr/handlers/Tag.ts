export default function(node, renderer, options) {
	const snippet = node.expression.render();

	renderer.append(
		node.parent &&
		node.parent.type === 'Element' &&
		node.parent.name === 'style'
			? '${' + snippet + '}'
			: '${@escape(' + snippet + ')}'
	);
}