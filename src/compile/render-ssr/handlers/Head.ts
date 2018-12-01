export default function(node, renderer, options) {
	renderer.append('${($$result.head += `');

	renderer.render(node.children, options);

	renderer.append('`, "")}');
}