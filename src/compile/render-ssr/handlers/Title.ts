export default function(node, renderer, options) {
	renderer.append(`<title>`);

	renderer.render(node.children, options);

	renderer.append(`</title>`);
}