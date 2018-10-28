export default function(node, renderer, options) {
	renderer.append('${(__result.head += `');

	renderer.render(node.children, options);

	renderer.append('`, "")}');
}