import { snip } from '../utils';

export default function(node, renderer, options) {
	const snippet = snip(node.expression);

	renderer.append('${ ' + snippet + ' ? `');

	renderer.render(node.children, options);

	renderer.append('` : `');

	if (node.else) {
		renderer.render(node.else.children, options);
	}

	renderer.append('` }');
}