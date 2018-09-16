export default function(node, target, options) {
	target.append('${' + node.expression.snippet + '}');
}