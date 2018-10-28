export default function(node, renderer, options) {
	renderer.append('${' + node.expression.snippet + '}');
}